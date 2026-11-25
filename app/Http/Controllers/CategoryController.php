<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class CategoryController extends Controller
{
    protected CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(Request $request)
    {
        $onlyActive = !$request->is('api/admin/*');
        $categories = $this->categoryService->getAll($onlyActive);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate(
            [
                'name' => 'required|string|max:255|unique:categories,name',
                'description' => 'nullable|string|max:1000',
                'status' => 'nullable|in:active,inactive',
                'display_order' => 'nullable|integer|min:0',
            ],
            [
                'name.required' => 'Tên danh mục không được để trống.',
                'name.string' => 'Tên danh mục phải là chuỗi ký tự hợp lệ.',
                'name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
                'name.unique' => 'Tên danh mục này đã tồn tại, vui lòng nhập tên khác.',
                'description.string' => 'Mô tả danh mục phải là chuỗi ký tự hợp lệ.',
                'description.max' => 'Mô tả danh mục không được vượt quá 1000 ký tự.',
                'status.in' => 'Trạng thái không hợp lệ (chỉ chấp nhận active hoặc inactive).',
            ]
        );

        $category = $this->categoryService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm danh mục thành công.',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate(
            [
                'name' => 'required|string|max:255|unique:categories,name,' . $id,
                'description' => 'nullable|string|max:1000',
                'status' => 'nullable|in:active,inactive',
                'display_order' => 'nullable|integer|min:0',
            ],
            [
                'name.required' => 'Tên danh mục không được để trống.',
                'name.string' => 'Tên danh mục phải là chuỗi ký tự hợp lệ.',
                'name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
                'name.unique' => 'Tên danh mục này đã tồn tại, vui lòng nhập tên khác.',
                'description.string' => 'Mô tả danh mục phải là chuỗi ký tự hợp lệ.',
                'description.max' => 'Mô tả danh mục không được vượt quá 1000 ký tự.',
                'status.in' => 'Trạng thái không hợp lệ (chỉ chấp nhận active hoặc inactive).',
            ]
        );

        try {
            $category = $this->categoryService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật danh mục thành công.',
                'data' => $category,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục cần cập nhật.',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->categoryService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Xóa danh mục thành công.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Danh mục không tồn tại.',
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}