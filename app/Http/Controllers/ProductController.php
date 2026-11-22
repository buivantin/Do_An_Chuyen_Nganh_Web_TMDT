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

    public function showPublic(int $id): JsonResponse
    {
        $product = Product::with('category:id,name')
            ->where('status', 'active')
            ->find($id);

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
            'price'       => 'required|numeric|gt:0|max:999999999',
            'stock'       => 'required|integer|min:0|max:1000000',
            'category_id' => 'required|integer|exists:categories,id',
            'description' => 'nullable|string|max:5000',
            'status'      => 'nullable|in:active,inactive',
            'image'       => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'        => 'Vui lòng nhập tên sản phẩm.',
            'name.string'          => 'Tên sản phẩm phải là chuỗi ký tự hợp lệ.',
            'name.max'             => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'author.string'        => 'Tên tác giả phải là chuỗi ký tự hợp lệ.',
            'author.max'           => 'Tên tác giả không được vượt quá 255 ký tự.',
            'price.required'       => 'Vui lòng nhập giá bán.',
            'price.numeric'        => 'Giá bán phải là một số hợp lệ.',
            'price.gt'             => 'Giá bán phải lớn hơn 0.',
            'price.max'            => 'Giá bán không được vượt quá 999.999.999 VNĐ.',
            'stock.required'       => 'Vui lòng nhập số lượng tồn kho.',
            'stock.integer'        => 'Số lượng tồn kho phải là số nguyên.',
            'stock.min'            => 'Số lượng tồn kho không được âm.',
            'stock.max'            => 'Số lượng tồn kho không được vượt quá 1.000.000.',
            'category_id.required' => 'Vui lòng chọn danh mục.',
            'category_id.integer'  => 'Mã danh mục không hợp lệ.',
            'category_id.exists'   => 'Danh mục không tồn tại.',
            'description.string'   => 'Mô tả sản phẩm phải là chuỗi ký tự hợp lệ.',
            'description.max'      => 'Mô tả sản phẩm không được vượt quá 5000 ký tự.',
            'status.in'            => 'Trạng thái chỉ chấp nhận active hoặc inactive.',
            'image.file'           => 'Tệp ảnh tải lên không hợp lệ.',
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
            'price'       => 'sometimes|required|numeric|gt:0|max:999999999',
            'stock'       => 'sometimes|required|integer|min:0|max:1000000',
            'category_id' => 'sometimes|required|integer|exists:categories,id',
            'description' => 'nullable|string|max:5000',
            'status'      => 'sometimes|required|in:active,inactive',
            'image'       => 'nullable|file|mimetypes:image/jpeg,image/png|max:2048',
        ], [
            'name.required'        => 'Tên sản phẩm không được để trống.',
            'name.string'          => 'Tên sản phẩm phải là chuỗi ký tự hợp lệ.',
            'name.max'             => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'author.string'        => 'Tên tác giả phải là chuỗi ký tự hợp lệ.',
            'author.max'           => 'Tên tác giả không được vượt quá 255 ký tự.',
            'price.required'       => 'Giá bán không được để trống.',
            'price.numeric'        => 'Giá bán phải là một số hợp lệ.',
            'price.gt'             => 'Giá bán phải lớn hơn 0.',
            'price.max'            => 'Giá bán không được vượt quá 999.999.999 VNĐ.',
            'stock.required'       => 'Số lượng tồn kho không được để trống.',
            'stock.integer'        => 'Số lượng tồn kho phải là số nguyên.',
            'stock.min'            => 'Số lượng tồn kho không được âm.',
            'stock.max'            => 'Số lượng tồn kho không được vượt quá 1.000.000.',
            'category_id.required' => 'Vui lòng chọn danh mục.',
            'category_id.integer'  => 'Mã danh mục không hợp lệ.',
            'category_id.exists'   => 'Danh mục không tồn tại.',
            'description.string'   => 'Mô tả sản phẩm phải là chuỗi ký tự hợp lệ.',
            'description.max'      => 'Mô tả sản phẩm không được vượt quá 5000 ký tự.',
            'status.required'      => 'Vui lòng chọn trạng thái sản phẩm.',
            'status.in'            => 'Trạng thái chỉ chấp nhận active hoặc inactive.',
            'image.file'           => 'Tệp ảnh tải lên không hợp lệ.',
            'image.mimetypes'      => 'Ảnh đại diện chỉ chấp nhận định dạng JPG hoặc PNG hợp lệ.',
            'image.max'            => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',
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