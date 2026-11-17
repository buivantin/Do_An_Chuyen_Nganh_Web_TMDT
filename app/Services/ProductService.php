<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class ProductService
{
    // =========================================================================
    // PHẦN 1: API TRANG CHỦ ([TM-01] - GIỮ NGUYÊN CỦA TV5)
    // =========================================================================

    private function formatBook(Product $book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title ?? $book->name,
            'author' => $book->author ?? 'Đang cập nhật',
            'category' => $book->category?->name ?? 'Chưa phân loại',
            'category_id' => $book->category_id,
            'price' => (float) $book->price,
            'image' => $book->image,
            'stock' => $book->stock ?? 0,
        ];
    }

    public function getHomeData(): array
    {
        // 1. Danh mục đang hoạt động (dùng cho Menu & phân nhóm)
        $categories = Category::where('status', 'active')
            ->orderBy('id', 'asc')
            ->get(['id', 'name', 'description']);

        // 2. 8 sách mới nhất
        $latestBooks = Product::with('category:id,name')
            ->where('status', 'active')
            ->orderByDesc('id')
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        // 3. Sách theo từng danh mục
        $categoriesWithBooks = Category::where('status', 'active')
            ->orderBy('id', 'asc')
            ->with(['products' => function ($query) {
                $query->with('category:id,name')
                    ->where('status', 'active')
                    ->orderByDesc('id');
            }])
            ->get()
            ->map(function (Category $category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'description' => $category->description,
                    'books' => $category->products
                        ->map(fn (Product $book) => $this->formatBook($book))
                        ->values(),
                ];
            });

        return [
            'categories' => $categories,
            'latest_books' => $latestBooks,
            'categories_with_books' => $categoriesWithBooks,
        ];
    }

    // =========================================================================
    // PHẦN 2: CRUD SẢN PHẨM & UPLOAD ẢNH ADMIN ([TM-12] - TV4)
    // =========================================================================

    /**
     * Lấy danh sách sản phẩm cho trang Admin (kèm danh mục, tìm kiếm, lọc trạng thái)
     */
    public function getAllProducts(array $filters = [])
    {
        $query = Product::with('category:id,name')->orderByDesc('id');

        if (!empty($filters['keyword'])) {
            $keyword = $filters['keyword'];
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('author', 'like', "%{$keyword}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Tạo mới sản phẩm kèm tải ảnh đại diện
     */
    public function createProduct(array $data, ?UploadedFile $imageFile = null, ?int $adminId = null): Product
    {
        DB::beginTransaction();
        $savedImagePath = null;

        try {
            if ($imageFile) {
                $savedImagePath = $this->uploadImage($imageFile, $adminId);
                $data['image'] = $savedImagePath;
            }

            $data['status'] = $data['status'] ?? 'active';
            $product = Product::create($data);

            DB::commit();

            Log::info('[TM-12] Tạo sản phẩm mới thành công', [
                'admin_id'   => $adminId,
                'product_id' => $product->id,
                'name'       => $product->name,
                'image'      => $product->image,
            ]);

            return $product->load('category:id,name');
        } catch (Throwable $e) {
            DB::rollBack();

            if ($savedImagePath) {
                $this->deletePhysicalImage($savedImagePath);
            }

            Log::error('[TM-12] Lỗi khi tạo sản phẩm', [
                'admin_id' => $adminId,
                'error'    => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Cập nhật thông tin sản phẩm & thay thế ảnh nếu có tải ảnh mới
     */
    public function updateProduct(Product $product, array $data, ?UploadedFile $imageFile = null, ?int $adminId = null): Product
    {
        DB::beginTransaction();
        $newImagePath = null;
        $oldImagePath = $product->image;

        try {
            if ($imageFile) {
                $newImagePath = $this->uploadImage($imageFile, $adminId);
                $data['image'] = $newImagePath;
            }

            $product->update($data);
            DB::commit();

            if ($newImagePath && $oldImagePath && $oldImagePath !== $newImagePath) {
                $this->deletePhysicalImage($oldImagePath);
            }

            Log::info('[TM-12] Cập nhật sản phẩm thành công', [
                'admin_id'   => $adminId,
                'product_id' => $product->id,
                'changes'    => array_keys($data),
            ]);

            return $product->fresh('category:id,name');
        } catch (Throwable $e) {
            DB::rollBack();

            if ($newImagePath) {
                $this->deletePhysicalImage($newImagePath);
            }

            Log::error('[TM-12] Lỗi khi cập nhật sản phẩm', [
                'admin_id'   => $adminId,
                'product_id' => $product->id,
                'error'      => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Ngừng bán (ẩn) sản phẩm thay vì xóa cứng khỏi database
     */
    public function deleteProduct(Product $product, ?int $adminId = null): void
    {
        // Kiểm tra ngoại lệ A2c: sản phẩm đang nằm trong đơn hàng chưa hoàn tất
        $hasUnfinishedOrders = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $product->id)
            ->whereIn('orders.status', ['pending', 'processing', 'shipped'])
            ->exists();

        if ($hasUnfinishedOrders) {
            throw new RuntimeException('Không thể xóa sản phẩm vì đang nằm trong đơn hàng chưa hoàn tất.');
        }

        // Cập nhật trạng thái về inactive, giữ nguyên bản ghi và ảnh trong public/imgs
        $product->update([
            'status' => 'inactive',
        ]);

        Log::info('[TM-12] Đã chuyển trạng thái sản phẩm sang inactive', [
            'admin_id'   => $adminId,
            'product_id' => $product->id,
            'name'       => $product->name,
        ]);
    }

    /**
     * Kiểm tra MIME theo nội dung thực tế (Magic Bytes), đổi tên ngẫu nhiên và lưu vào public/imgs
     */
    private function uploadImage(UploadedFile $file, ?int $adminId = null): string
    {
        $realMime = $file->getMimeType();
        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
        ];

        if (!isset($allowedMimes[$realMime])) {
            Log::warning('[TM-12] Từ chối tệp tải lên do sai định dạng MIME thực tế', [
                'admin_id'      => $adminId,
                'original_name' => $file->getClientOriginalName(),
                'detected_mime' => $realMime,
            ]);
            throw new RuntimeException('Nội dung tệp không hợp lệ. Chỉ chấp nhận ảnh JPG hoặc PNG.');
        }

        $extension = $allowedMimes[$realMime];
        $randomFilename = now()->format('YmdHis') . '_' . Str::random(16) . '.' . $extension;

        $destinationPath = public_path('imgs');
        if (!is_dir($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        $file->move($destinationPath, $randomFilename);

        Log::info('[TM-12] Tải ảnh đại diện thành công', [
            'admin_id'      => $adminId,
            'original_name' => $file->getClientOriginalName(),
            'saved_name'    => $randomFilename,
            'mime_type'     => $realMime,
            'size_bytes'    => $file->getSize(),
        ]);

        return "/imgs/{$randomFilename}";
    }

    /**
     * Xóa tệp ảnh vật lý trong public/imgs
     */
    private function deletePhysicalImage(string $relativePath): void
    {
        $fullPath = public_path(ltrim($relativePath, '/'));
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}