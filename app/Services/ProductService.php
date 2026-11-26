<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class ProductService
{
    private function formatBook(Product $book): array
    {
        $pageCount = $book->page_count ?? $book->pages ?? null;
        $publishedYear = $book->published_year ?? $book->publish_year ?? null;

        $basePrice = (float) $book->price;
        $discountPercent = (int) ($book->discount ?? $book->discount_percent ?? 0);
        $discountPercent = max(0, min(100, $discountPercent));

        $finalPrice = $discountPercent > 0
            ? (float) round($basePrice * (1 - $discountPercent / 100))
            : $basePrice;

        $originalPrice = $discountPercent > 0
            ? $basePrice
            : (isset($book->original_price) ? (float) $book->original_price : null);

        return [
            'id' => $book->id,
            'title' => $book->title ?? $book->name,
            'author' => $book->author ?? 'Đang cập nhật',
            'category' => $book->category?->name ?? 'Chưa phân loại',
            'category_id' => $book->category_id,
            'price' => $finalPrice,
            'original_price' => $originalPrice,
            'discount' => $discountPercent,
            'discount_percent' => $discountPercent > 0 ? $discountPercent : null,
            'pages' => $pageCount,
            'page_count' => $pageCount,
            'publisher' => $book->publisher ?? null,
            'publish_year' => $publishedYear,
            'published_year' => $publishedYear,
            'rating' => isset($book->avg_rating) ? round((float) $book->avg_rating, 1) : ($book->rating ?? null),
            'reviews_count' => isset($book->reviews_count) ? (int) $book->reviews_count : 0,
            'sold_count' => isset($book->sold_count) ? (int) $book->sold_count : null,
            'created_at' => $book->created_at?->toISOString(),
            'image' => $book->image,
            'stock' => $book->stock ?? 0,
        ];
    }

    private function applyActiveProductScope($query, string $table = 'products')
    {
        $query->where("{$table}.status", 'active');

        if (Schema::hasColumn($table, 'is_deleted')) {
            $query->where(function ($q) use ($table) {
                $q->where("{$table}.is_deleted", false)
                    ->orWhereNull("{$table}.is_deleted");
            });
        }

        return $query;
    }

    public function getHomeData(): array
    {
        $categoriesQuery = Category::where('status', 'active');
        if (Schema::hasColumn('categories', 'display_order')) {
            $categoriesQuery->orderBy('display_order', 'asc');
        }
        $categories = $categoriesQuery
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'description']);

        $productColumns = Schema::hasTable('products')
            ? Schema::getColumnListing('products')
            : [];
        $groupedColumns = array_map(fn (string $col) => "products.{$col}", $productColumns);

        $latestQuery = Product::with('category:id,name');
        $this->applyActiveProductScope($latestQuery, 'products');

        $latestBooks = $latestQuery
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        $bestsellerQuery = Product::with('category:id,name');
        $this->applyActiveProductScope($bestsellerQuery, 'products');

        if (Schema::hasTable('order_items') && Schema::hasTable('orders')) {
            $bestsellerQuery
                ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
                ->leftJoin('orders', function ($join) {
                    $join->on('order_items.order_id', '=', 'orders.id')
                        ->where('orders.status', '!=', 'cancelled');
                })
                ->select('products.*', DB::raw('COALESCE(SUM(order_items.quantity), 0) as sold_count'));

            if (!empty($groupedColumns)) {
                $bestsellerQuery->groupBy($groupedColumns);
            } else {
                $bestsellerQuery->groupBy('products.id');
            }

            $bestsellerQuery
                ->orderByDesc('sold_count')
                ->orderByDesc('products.id');
        } else {
            $bestsellerQuery->orderByDesc('products.id');
        }

        $bestsellerBooks = $bestsellerQuery
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        $topRatedQuery = Product::with('category:id,name');
        $this->applyActiveProductScope($topRatedQuery, 'products');

        if (Schema::hasTable('reviews')) {
            $topRatedQuery
                ->leftJoin('reviews', function ($join) {
                    $join->on('products.id', '=', 'reviews.product_id')
                        ->where('reviews.status', '=', 'visible');
                })
                ->select(
                    'products.*',
                    DB::raw('COALESCE(AVG(reviews.rating), 0) as avg_rating'),
                    DB::raw('COUNT(reviews.id) as reviews_count')
                );

            if (!empty($groupedColumns)) {
                $topRatedQuery->groupBy($groupedColumns);
            } else {
                $topRatedQuery->groupBy('products.id');
            }

            $topRatedQuery
                ->orderByDesc('avg_rating')
                ->orderByDesc('products.id');
        } else {
            $topRatedQuery->orderByDesc('products.id');
        }

        $topRatedBooks = $topRatedQuery
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        $categoriesWithBooksQuery = Category::where('status', 'active');
        if (Schema::hasColumn('categories', 'display_order')) {
            $categoriesWithBooksQuery->orderBy('display_order', 'asc');
        }

        $categoriesWithBooks = $categoriesWithBooksQuery
            ->orderBy('name', 'asc')
            ->with(['products' => function ($query) {
                $query->with('category:id,name');
                $this->applyActiveProductScope($query, 'products');
                $query->orderByDesc('id');
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

    public function getAllProducts(array $filters = [])
    {
        $query = Product::with('category:id,name')->orderByDesc('id');

        $keyword = trim((string) ($filters['keyword'] ?? $filters['search'] ?? ''));
        if ($keyword !== '') {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $keyword);
            $query->where(function ($q) use ($escaped) {
                $q->where('name', 'like', "%{$escaped}%")
                    ->orWhere('author', 'like', "%{$escaped}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = (int) ($filters['per_page'] ?? 10);
        $perPage = ($perPage > 0 && $perPage <= 100) ? $perPage : 10;

        return $query->paginate($perPage);
    }

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
                'admin_id' => $adminId,
                'product_id' => $product->id,
                'name' => $product->name,
                'image' => $product->image,
            ]);

            return $product->load('category:id,name');
        } catch (Throwable $e) {
            DB::rollBack();

            if ($savedImagePath) {
                $this->deletePhysicalImage($savedImagePath);
            }

            Log::error('[TM-12] Lỗi khi tạo sản phẩm', [
                'admin_id' => $adminId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

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
                'admin_id' => $adminId,
                'product_id' => $product->id,
                'changes' => array_keys($data),
            ]);

            return $product->fresh('category:id,name');
        } catch (Throwable $e) {
            DB::rollBack();

            if ($newImagePath) {
                $this->deletePhysicalImage($newImagePath);
            }

            Log::error('[TM-12] Lỗi khi cập nhật sản phẩm', [
                'admin_id' => $adminId,
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function deleteProduct(Product $product, ?int $adminId = null): void
    {
        $hasUnfinishedOrders = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $product->id)
            ->whereIn('orders.status', ['pending', 'processing', 'shipped'])
            ->exists();

        if ($hasUnfinishedOrders) {
            throw new RuntimeException('Không thể xóa sản phẩm vì đang nằm trong đơn hàng chưa hoàn tất.');
        }

        $product->update([
            'status' => 'inactive',
        ]);

        Log::info('[TM-12] Đã chuyển trạng thái sản phẩm sang inactive', [
            'admin_id' => $adminId,
            'product_id' => $product->id,
            'name' => $product->name,
        ]);
    }

    private function uploadImage(UploadedFile $file, ?int $adminId = null): string
    {
        $realMime = $file->getMimeType();
        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        if (!isset($allowedMimes[$realMime])) {
            Log::warning('[TM-12] Từ chối tệp tải lên do sai định dạng MIME thực tế', [
                'admin_id' => $adminId,
                'original_name' => $file->getClientOriginalName(),
                'detected_mime' => $realMime,
            ]);
            throw new RuntimeException('Nội dung tệp không hợp lệ. Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
        }

        $extension = $allowedMimes[$realMime];
        $randomFilename = now()->format('YmdHis') . '_' . Str::random(16) . '.' . $extension;

        $destinationPath = public_path('imgs');
        if (!is_dir($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        $file->move($destinationPath, $randomFilename);

        Log::info('[TM-12] Tải ảnh đại diện thành công', [
            'admin_id' => $adminId,
            'original_name' => $file->getClientOriginalName(),
            'saved_name' => $randomFilename,
            'mime_type' => $realMime,
            'size_bytes' => $file->getSize(),
        ]);

        return "/imgs/{$randomFilename}";
    }

    private function deletePhysicalImage(string $relativePath): void
    {
        $fullPath = public_path(ltrim($relativePath, '/'));
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}