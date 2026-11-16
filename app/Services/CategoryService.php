<?php

namespace App\Services;

use App\Models\Category;
use Exception;

class CategoryService
{
    public function getAll()
    {
        return Category::withCount('products')
            ->orderBy('id')
            ->get();
    }

    public function create(array $data): Category
    {
        return Category::create([
            'name' => trim($data['name']),
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'active',
        ]);
    }

    public function update(int $id, array $data): Category
    {
        $category = Category::findOrFail($id);

        $category->update([
            'name' => trim($data['name']),
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? $category->status,
        ]);

        return $category;
    }

    public function delete(int $id): bool
    {
        $category = Category::withCount('products')->findOrFail($id);

        if ($category->products_count > 0) {
            throw new Exception(
                "Không thể xóa danh mục \"{$category->name}\" vì đang có {$category->products_count} sản phẩm thuộc danh mục này."
            );
        }

        return $category->delete();
    }
}