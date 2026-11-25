<?php

namespace App\Services;

use App\Models\Category;
use Exception;

class CategoryService
{
    public function getAll(bool $onlyActive = false)
    {
        return Category::withCount('products')
            ->when($onlyActive, fn ($q) => $q->where('status', 'active'))
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();
    }

    public function create(array $data): Category
    {
        return Category::create([
            'name' => trim($data['name']),
            'description' => $data['description'] ?? null,
            'display_order' => isset($data['display_order']) ? (int) $data['display_order'] : 0,
            'status' => $data['status'] ?? 'active',
        ]);
    }

    public function update(int $id, array $data): Category
    {
        $category = Category::findOrFail($id);

        $displayOrder = array_key_exists('display_order', $data) && $data['display_order'] !== null
            ? (int) $data['display_order']
            : ($category->display_order ?? 0);

        $category->update([
            'name' => trim($data['name']),
            'description' => $data['description'] ?? null,
            'display_order' => $displayOrder,
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