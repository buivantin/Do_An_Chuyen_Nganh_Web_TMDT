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

    public function search(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);

        $query = Product::with('category:id,name');
        $this->applyActiveScope($query, 'products');

        $query
            ->when($request->filled('keyword'), function ($q) use ($request) {
                $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($request->keyword));
                $keyword = '%' . $escaped . '%';
                $q->where(function ($sub) use ($keyword) {
                    $sub->where('products.name', 'LIKE', $keyword)
                        ->orWhere('products.author', 'LIKE', $keyword);
                });
            })
            ->when($request->filled('category_id'), function ($q) use ($request) {
                $q->where('products.category_id', (int) $request->category_id);
            })
            ->when($request->filled('min_price'), function ($q) use ($request) {
                $q->where('products.price', '>=', (float) $request->min_price);
            })
            ->when($request->filled('max_price'), function ($q) use ($request) {
                $q->where('products.price', '<=', (float) $request->max_price);
            });

        switch ($request->input('sort')) {
            case 'price_asc':
                $query->orderBy('products.price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('products.price', 'desc');
                break;
            case 'bestseller':
                if (Schema::hasTable('order_items') && Schema::hasTable('orders')) {
                    $productColumns = Schema::hasTable('products')
                        ? Schema::getColumnListing('products')
                        : [];
                    $groupedColumns = array_map(fn (string $col) => "products.{$col}", $productColumns);

                    $query
                        ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
                        ->leftJoin('orders', function ($join) {
                            $join->on('order_items.order_id', '=', 'orders.id')
                                ->where('orders.status', '!=', 'cancelled');
                        })
                        ->select('products.*', DB::raw('COALESCE(SUM(order_items.quantity), 0) as sold_count'))
                        ->groupBy(!empty($groupedColumns) ? $groupedColumns : ['products.id'])
                        ->orderByDesc('sold_count')
                        ->orderByDesc('products.id');
                } else {
                    $query->orderBy('products.created_at', 'desc');
                }
                break;
            case 'newest':
            default:
                $query->orderBy('products.created_at', 'desc');
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
            'publish_year' => 'nullable|integer|min:1000|max:2100',
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
            'publish_year.integer'  => 'Năm xuất bản phải là số nguyên.',
            'publish_year.min'      => 'Năm xuất bản không hợp lệ.',
            'publish_year.max'      => 'Năm xuất bản không hợp lệ.',
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
            'publish_year' => 'nullable|integer|min:1000|max:2100',
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
            'publish_year.integer'  => 'Năm xuất bản phải là số nguyên.',
            'publish_year.min'      => 'Năm xuất bản không hợp lệ.',
            'publish_year.max'      => 'Năm xuất bản không hợp lệ.',
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