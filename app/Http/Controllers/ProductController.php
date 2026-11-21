<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Throwable;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * GET /api/products (Tìm kiếm, lọc & phân trang công khai - TM-02)
     */
    public function search(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);

        $query = Product::with('category:id,name')
            ->where('status', 'active')
            ->when($request->filled('keyword'), function ($q) use ($request) {
                $keyword = '%' . trim($request->keyword) . '%';
                $q->where(function ($sub) use ($keyword) {
                    $sub->where('name', 'LIKE', $keyword)
                        ->orWhere('author', 'LIKE', $keyword);
                });
            })
            ->when($request->filled('category_id'), function ($q) use ($request) {
                $q->where('category_id', (int) $request->category_id);
            })
            ->when($request->filled('min_price'), function ($q) use ($request) {
                $q->where('price', '>=', (float) $request->min_price);
            })
            ->when($request->filled('max_price'), function ($q) use ($request) {
                $q->where('price', '<=', (float) $request->max_price);
            });

        switch ($request->input('sort')) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
            case 'bestseller':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     * GET /api/admin/products
     */
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

    /**
     * GET /api/admin/products/{id}
     */
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

    /**
     * POST /api/admin/products
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'author'      => 'nullable|string|max:255',
            'price'       => 'required|numeric|gt:0',
            'stock'       => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:active,inactive',
            'image'       => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'        => 'Vui lòng nhập tên sản phẩm.',
            'price.required'       => 'Vui lòng nhập giá bán.',
            'price.gt'  => 'Giá bán phải lớn hơn 0.',
            'stock.required'       => 'Vui lòng nhập số lượng tồn kho.',
            'stock.min'            => 'Số lượng tồn kho không được âm.',
            'category_id.required' => 'Vui lòng chọn danh mục.',
            'category_id.exists'   => 'Danh mục không tồn tại.',
            'status.in'            => 'Trạng thái chỉ chấp nhận active hoặc inactive.',
            'image.mimetypes'      => 'Ảnh đại diện chỉ chấp nhận định dạng JPG hoặc PNG hợp lệ.',
            'image.max'            => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',
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

    /**
     * PUT/PATCH /api/admin/products/{id} (Hỗ trợ cả POST kèm _method=PUT khi gửi FormData có ảnh)
     */
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
            'name'        => 'sometimes|required|string|max:255',
            'author'      => 'nullable|string|max:255',
            'price'       => 'sometimes|required|numeric|gt:0',
            'stock'       => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'description' => 'nullable|string',
            'status'      => 'sometimes|required|in:active,inactive',
            'image'       => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'      => 'Tên sản phẩm không được để trống.',
            'price.gt'  => 'Giá bán phải lớn hơn 0.',
            'stock.min'          => 'Số lượng tồn kho không được âm.',
            'category_id.exists' => 'Danh mục không tồn tại.',
            'status.in'          => 'Trạng thái chỉ chấp nhận active hoặc inactive.',
            'image.mimetypes'    => 'Ảnh đại diện chỉ chấp nhận định dạng JPG hoặc PNG hợp lệ.',
            'image.max'          => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',
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

    /**
     * DELETE /api/admin/products/{id}
     */
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