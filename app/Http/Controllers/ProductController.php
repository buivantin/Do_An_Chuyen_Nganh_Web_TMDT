<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Throwable;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    private function applyActiveScope($query, string $table = 'products')
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

    public function showPublic(int $id): JsonResponse
    {
        $query = Product::with('category:id,name');
        $this->applyActiveScope($query, 'products');
        $product = $query->find($id);

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Sản phẩm không tồn tại hoặc đã bị ẩn.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $product,
        ]);
    }

    public function filterOptions(): JsonResponse
    {
        $authors = [];
        if (Schema::hasColumn('products', 'author')) {
            $authorsQuery = Product::query();
            $this->applyActiveScope($authorsQuery, 'products');
            $authors = $authorsQuery
                ->whereNotNull('author')
                ->where('author', '!=', '')
                ->whereRaw('LOWER(TRIM(author)) != ?', ['đang cập nhật'])
                ->selectRaw('TRIM(author) as name, COUNT(*) as count')
                ->groupBy(DB::raw('TRIM(author)'))
                ->orderBy('name')
                ->get();
        }

        $publishers = [];
        if (Schema::hasColumn('products', 'publisher')) {
            $publishersQuery = Product::query();
            $this->applyActiveScope($publishersQuery, 'products');
            $publishers = $publishersQuery
                ->whereNotNull('publisher')
                ->where('publisher', '!=', '')
                ->selectRaw('TRIM(publisher) as name, COUNT(*) as count')
                ->groupBy(DB::raw('TRIM(publisher)'))
                ->orderBy('name')
                ->get();
        }

        return response()->json([
            'status'     => 'success',
            'authors'    => $authors,
            'publishers' => $publishers,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 12), 1), 60);

        $hasOrderItems = Schema::hasTable('order_items') && Schema::hasTable('orders');
        $hasReviews = Schema::hasTable('reviews');
        $hasReviewStatus = $hasReviews && Schema::hasColumn('reviews', 'status');

        $query = Product::with('category:id,name')->select('products.*');
        $this->applyActiveScope($query, 'products');

        // Subquery tính tổng lượt bán thật từ đơn hàng không bị hủy
        if ($hasOrderItems) {
            $soldSub = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', 'cancelled')
                ->whereColumn('order_items.product_id', 'products.id')
                ->selectRaw('COALESCE(SUM(order_items.quantity), 0)');

            $query->selectSub($soldSub, 'sold_count');
        }

        // Subquery tính điểm đánh giá trung bình & tổng lượt đánh giá thật
        if ($hasReviews) {
            $ratingSub = DB::table('reviews')
                ->whereColumn('reviews.product_id', 'products.id')
                ->when($hasReviewStatus, fn ($q) => $q->where('reviews.status', 'visible'))
                ->selectRaw('ROUND(COALESCE(AVG(reviews.rating), 0), 1)');

            $reviewCountSub = DB::table('reviews')
                ->whereColumn('reviews.product_id', 'products.id')
                ->when($hasReviewStatus, fn ($q) => $q->where('reviews.status', 'visible'))
                ->selectRaw('COUNT(*)');

            $query->selectSub($ratingSub, 'rating');
            $query->selectSub($reviewCountSub, 'reviews_count');
        }

        // 1. Tìm kiếm theo từ khóa
        $rawKeyword = $request->input('search') ?? $request->input('keyword');
        if (is_string($rawKeyword) && trim($rawKeyword) !== '') {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($rawKeyword));
            $keyword = '%' . $escaped . '%';
            $query->where(function ($sub) use ($keyword) {
                $sub->where('products.name', 'LIKE', $keyword);
                if (Schema::hasColumn('products', 'author')) {
                    $sub->orWhere('products.author', 'LIKE', $keyword);
                }
                if (Schema::hasColumn('products', 'publisher')) {
                    $sub->orWhere('products.publisher', 'LIKE', $keyword);
                }
            });
        }

        // 2. Lọc theo danh mục
        if ($request->filled('category_id')) {
            $categoryIds = is_array($request->category_id)
                ? $request->category_id
                : explode(',', (string) $request->category_id);
            $categoryIds = array_values(array_filter(array_map('intval', $categoryIds)));
            if (!empty($categoryIds)) {
                $query->whereIn('products.category_id', $categoryIds);
            }
        }

        // 3. Lọc theo tác giả (hỗ trợ cả author[]=... và author=...)
        if ($request->filled('author') && Schema::hasColumn('products', 'author')) {
            $rawAuthors = $request->input('author');
            $authors = is_array($rawAuthors) ? $rawAuthors : explode('|', (string) $rawAuthors);
            $authors = array_values(array_filter(array_map('trim', $authors)));
            if (!empty($authors)) {
                $query->whereIn(DB::raw('TRIM(products.author)'), $authors);
            }
        }

        // 4. Lọc theo nhà xuất bản (hỗ trợ cả publisher[]=... và publisher=...)
        if ($request->filled('publisher') && Schema::hasColumn('products', 'publisher')) {
            $rawPublishers = $request->input('publisher');
            $publishers = is_array($rawPublishers) ? $rawPublishers : explode('|', (string) $rawPublishers);
            $publishers = array_values(array_filter(array_map('trim', $publishers)));
            if (!empty($publishers)) {
                $query->whereIn(DB::raw('TRIM(products.publisher)'), $publishers);
            }
        }

        // 5. Lọc theo khoảng giá (xét trên giá thực tế sau giảm nếu có)
        if ($request->filled('min_price')) {
            $query->where('products.price', '>=', (float) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('products.price', '<=', (float) $request->max_price);
        }

        // 6. Lọc theo năm xuất bản
        if (Schema::hasColumn('products', 'published_year')) {
            if ($request->filled('min_year')) {
                $query->whereNotNull('products.published_year')
                    ->where('products.published_year', '>=', (int) $request->min_year);
            }
            if ($request->filled('max_year')) {
                $query->whereNotNull('products.published_year')
                    ->where('products.published_year', '<=', (int) $request->max_year);
            }
        }

        // 7. Lọc theo số sao tối thiểu
        if ($request->filled('min_rating') && $hasReviews) {
            $minRating = (float) $request->min_rating;
            $statusClause = $hasReviewStatus ? "AND r.status = 'visible'" : '';
            $query->whereRaw(
                "(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.product_id = products.id {$statusClause}) >= ?",
                [$minRating]
            );
        }

        // 8. Sắp xếp
        switch ($request->input('sort', 'bestseller')) {
            case 'price_asc':
                $query->orderBy('products.price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('products.price', 'desc');
                break;
            case 'title_asc':
                $query->orderBy('products.name', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('products.name', 'desc');
                break;
            case 'published_year_asc':
                if (Schema::hasColumn('products', 'published_year')) {
                    $query->orderByRaw('products.published_year IS NULL ASC')
                        ->orderBy('products.published_year', 'asc');
                }
                $query->orderByDesc('products.id');
                break;
            case 'published_year_desc':
                if (Schema::hasColumn('products', 'published_year')) {
                    $query->orderByRaw('products.published_year IS NULL ASC')
                        ->orderBy('products.published_year', 'desc');
                }
                $query->orderByDesc('products.id');
                break;
            case 'rating':
            case 'rating_desc':
                if ($hasReviews) {
                    $query->orderByDesc('rating');
                }
                $query->orderByDesc('products.id');
                break;
            case 'bestseller':
                if ($hasOrderItems) {
                    $query->orderByDesc('sold_count');
                }
                $query->orderByDesc('products.id');
                break;
            case 'newest':
            default:
                $query->orderByDesc('products.created_at')->orderByDesc('products.id');
                break;
        }

        return response()->json($query->paginate($perPage));
    }

    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->getAllProducts(
            $request->only(['keyword', 'search', 'category_id', 'status', 'per_page'])
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data'    => $products,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('category:id,name')->find($id);

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $product,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'author'       => 'nullable|string|max:255',
            'publisher'    => 'nullable|string|max:255',
            'published_year' => 'nullable|integer|min:1000|max:2100',
            'price'        => 'required|numeric|gt:0|max:999999999',
            'discount'     => 'nullable|numeric|min:0|max:100',
            'stock'        => 'required|integer|min:0|max:1000000',
            'category_id'  => 'required|integer|exists:categories,id',
            'description'  => 'nullable|string|max:5000',
            'status'       => 'nullable|in:active,inactive',
            'image'        => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'         => 'Vui lòng nhập tên sản phẩm.',
            'name.string'           => 'Tên sản phẩm phải là chuỗi ký tự hợp lệ.',
            'name.max'              => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'author.string'         => 'Tên tác giả phải là chuỗi ký tự hợp lệ.',
            'author.max'            => 'Tên tác giả không được vượt quá 255 ký tự.',
            'publisher.max'         => 'Nhà xuất bản không được vượt quá 255 ký tự.',
            'published_year.integer'  => 'Năm xuất bản phải là số nguyên.',
            'published_year.min'      => 'Năm xuất bản không hợp lệ.',
            'published_year.max'      => 'Năm xuất bản không hợp lệ.',
            'price.required'        => 'Vui lòng nhập giá bán.',
            'price.numeric'         => 'Giá bán phải là một số hợp lệ.',
            'price.gt'              => 'Giá bán phải lớn hơn 0.',
            'price.max'             => 'Giá bán không được vượt quá 999.999.999 VNĐ.',
            'discount.numeric'      => 'Giảm giá phải là số hợp lệ.',
            'discount.min'          => 'Giảm giá không được nhỏ hơn 0%.',
            'discount.max'          => 'Giảm giá không được vượt quá 100%.',
            'stock.required'        => 'Vui lòng nhập số lượng tồn kho.',
            'stock.integer'         => 'Số lượng tồn kho phải là số nguyên.',
            'stock.min'             => 'Số lượng tồn kho không được âm.',
            'stock.max'             => 'Số lượng tồn kho không được vượt quá 1.000.000.',
            'category_id.required'  => 'Vui lòng chọn danh mục.',
            'category_id.integer'   => 'Mã danh mục không hợp lệ.',
            'category_id.exists'    => 'Danh mục không tồn tại.',
            'description.string'    => 'Mô tả sản phẩm phải là chuỗi ký tự hợp lệ.',
            'description.max'       => 'Mô tả sản phẩm không được vượt quá 5000 ký tự.',
            'status.in'             => 'Trạng thái chỉ chấp nhận active hoặc inactive.',
            'image.file'            => 'Tệp ảnh tải lên không hợp lệ.',
            'image.mimetypes'       => 'Ảnh đại diện chỉ chấp nhận định dạng JPG hoặc PNG hợp lệ.',
            'image.max'             => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',
        ]);

        try {
            $product = $this->productService->createProduct(
                $validated,
                $request->file('image'),
                $request->user()?->id
            );

            return response()->json([
                'status'  => 'success',
                'message' => 'Thêm sản phẩm thành công',
                'data'    => $product,
            ], 201);
        } catch (RuntimeException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Có lỗi xảy ra khi thêm sản phẩm.',
            ], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        $validated = $request->validate([
            'name'         => 'sometimes|required|string|max:255',
            'author'       => 'nullable|string|max:255',
            'publisher'    => 'nullable|string|max:255',
            'published_year' => 'nullable|integer|min:1000|max:2100',
            'price'        => 'sometimes|required|numeric|gt:0|max:999999999',
            'discount'     => 'nullable|numeric|min:0|max:100',
            'stock'        => 'sometimes|required|integer|min:0|max:1000000',
            'category_id'  => 'sometimes|required|integer|exists:categories,id',
            'description'  => 'nullable|string|max:5000',
            'status'       => 'sometimes|required|in:active,inactive',
            'image'        => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'         => 'Tên sản phẩm không được để trống.',
            'name.string'           => 'Tên sản phẩm phải là chuỗi ký tự hợp lệ.',
            'name.max'              => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'author.string'         => 'Tên tác giả phải là chuỗi ký tự hợp lệ.',
            'author.max'            => 'Tên tác giả không được vượt quá 255 ký tự.',
            'publisher.max'         => 'Nhà xuất bản không được vượt quá 255 ký tự.',
            'published_year.integer'  => 'Năm xuất bản phải là số nguyên.',
            'published_year.min'      => 'Năm xuất bản không hợp lệ.',
            'published_year.max'      => 'Năm xuất bản không hợp lệ.',
            'price.required'        => 'Giá bán không được để trống.',
            'price.numeric'         => 'Giá bán phải là một số hợp lệ.',
            'price.gt'              => 'Giá bán phải lớn hơn 0.',
            'price.max'             => 'Giá bán không được vượt quá 999.999.999 VNĐ.',
            'discount.numeric'      => 'Giảm giá phải là số hợp lệ.',
            'discount.min'          => 'Giảm giá không được nhỏ hơn 0%.',
            'discount.max'          => 'Giảm giá không được vượt quá 100%.',
            'stock.required'        => 'Số lượng tồn kho không được để trống.',
            'stock.integer'         => 'Số lượng tồn kho phải là số nguyên.',
            'stock.min'             => 'Số lượng tồn kho không được âm.',
            'stock.max'             => 'Số lượng tồn kho không được vượt quá 1.000.000.',
            'category_id.required'  => 'Vui lòng chọn danh mục.',
            'category_id.integer'   => 'Mã danh mục không hợp lệ.',
            'category_id.exists'    => 'Danh mục không tồn tại.',
            'description.string'    => 'Mô tả sản phẩm phải là chuỗi ký tự hợp lệ.',
            'description.max'       => 'Mô tả sản phẩm không được vượt quá 5000 ký tự.',
            'status.required'       => 'Vui lòng chọn trạng thái sản phẩm.',
            'status.in'             => 'Trạng thái chỉ chấp nhận active hoặc inactive.',
            'image.file'            => 'Tệp ảnh tải lên không hợp lệ.',
            'image.mimetypes'       => 'Ảnh đại diện chỉ chấp nhận định dạng JPG hoặc PNG hợp lệ.',
            'image.max'             => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',
        ]);

        try {
            $updated = $this->productService->updateProduct(
                $product,
                $validated,
                $request->file('image'),
                $request->user()?->id
            );

            return response()->json([
                'status'  => 'success',
                'message' => 'Cập nhật sản phẩm thành công',
                'data'    => $updated,
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Có lỗi xảy ra khi cập nhật sản phẩm.',
            ], 500);
        }
    }

    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        try {
            $nextStatus = $product->status === 'active' ? 'inactive' : 'active';
            $updated = $this->productService->updateProduct(
                $product,
                ['status' => $nextStatus],
                null,
                $request->user()?->id
            );

            return response()->json([
                'status'  => 'success',
                'message' => 'Cập nhật trạng thái sản phẩm thành công',
                'data'    => $updated,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Không thể đổi trạng thái sản phẩm.',
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        try {
            $this->productService->deleteProduct($product, $request->user()?->id);

            return response()->json([
                'status'  => 'success',
                'message' => 'Xóa sản phẩm thành công',
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Không thể xóa sản phẩm do ràng buộc dữ liệu.',
            ], 409);
        }
    }
}