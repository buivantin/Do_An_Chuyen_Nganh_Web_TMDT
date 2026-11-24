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
use Illuminate\Support\Facades\Schema;

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
            'original_price' => isset($book->original_price) ? (float) $book->original_price : null,
            'discount_percent' => $book->discount_percent ?? null,
            'pages' => $book->pages ?? null,
            'publisher' => $book->publisher ?? null,
            'publish_year' => $book->publish_year ?? null,
            'rating' => isset($book->avg_rating) ? round((float) $book->avg_rating, 1) : ($book->rating ?? null),
            'sold_count' => isset($book->sold_count) ? (int) $book->sold_count : null,
            'created_at' => $book->created_at?->toISOString(),
            'image' => $book->image,
            'stock' => $book->stock ?? 0,
        ];
    }

    public function getHomeData(): array
    {
        $categories = Category::where('status', 'active')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'description']);

        // 1. Sách mới về (xét theo ngày thêm created_at)
        $latestBooks = Product::with('category:id,name')
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        // 2. Sách bán chạy (dựa vào số lần xuất hiện trong hóa đơn hợp lệ)
        $bestsellerQuery = Product::with('category:id,name')
            ->where('products.status', 'active');

        if (Schema::hasTable('order_items') && Schema::hasTable('orders')) {
            $bestsellerQuery
                ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
                ->leftJoin('orders', function ($join) {
                    $join->on('order_items.order_id', '=', 'orders.id')
                        ->where('orders.status', '!=', 'cancelled');
                })
                ->select('products.*', DB::raw('COALESCE(SUM(order_items.quantity), 0) as sold_count'))
                ->groupBy('products.id')
                ->orderByDesc('sold_count')
                ->orderByDesc('products.id');
        } else {
            $bestsellerQuery->orderByDesc('id');
        }

        $bestsellerBooks = $bestsellerQuery
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        // 3. Top đánh giá (số sao trung bình cao nhất)
        $topRatedQuery = Product::with('category:id,name')
            ->where('products.status', 'active');

        if (Schema::hasTable('reviews')) {
            $topRatedQuery
                ->leftJoin('reviews', 'products.id', '=', 'reviews.product_id')
                ->select('products.*', DB::raw('COALESCE(AVG(reviews.rating), 0) as avg_rating'))
                ->groupBy('products.id')
                ->orderByDesc('avg_rating')
                ->orderByDesc('products.id');
        } else {
            $topRatedQuery->orderByDesc('id');
        }

        $topRatedBooks = $topRatedQuery
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        // 4. Sách theo từng danh mục
        $categoriesWithBooks = Category::where('status', 'active')
            ->orderBy('name', 'asc')
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
            'bestseller_books' => $bestsellerBooks,
            'top_rated_books' => $topRatedBooks,
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

        $keyword = trim((string) ($filters['keyword'] ?? $filters['search'] ?? ''));
        if ($keyword !== '') {
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

        $perPage = (int) ($filters['per_page'] ?? 10);
        $perPage = ($perPage > 0 && $perPage <= 100) ? $perPage : 10;

        return $query->paginate($perPage);
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