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
     * GET /api/admin/products
     */
    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->getAllProducts(
            $request->only(['keyword', 'category_id', 'status', 'per_page'])
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
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:active,inactive',
            'image'       => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'        => 'Vui lòng nhập tên sản phẩm.',
            'price.required'       => 'Vui lòng nhập giá bán.',
            'price.min'            => 'Giá bán không được âm.',
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
            'price'       => 'sometimes|required|numeric|min:0',
            'stock'       => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'description' => 'nullable|string',
            'status'      => 'sometimes|required|in:active,inactive',
            'image'       => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'      => 'Tên sản phẩm không được để trống.',
            'price.min'          => 'Giá bán không được âm.',
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