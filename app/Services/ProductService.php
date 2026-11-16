<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;

class ProductService
{
    private function formatBook(Product $book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title ?? $book->name,
            'author' => $book->author ?? 'Đang cập nhật',
            'category' => $book->category?->name ?? 'Chưa phân loại',
            'category_id' => $book->category_id,
            'price' => (float) $book->price,
            'image' => $book->image,
            'stock' => $book->stock ?? 0,
        ];
    }

    public function getHomeData(): array
    {
        // 1. Danh mục đang hoạt động (dùng cho Menu & phân nhóm)
        $categories = Category::where('status', 'active')
            ->orderBy('id', 'asc')
            ->get(['id', 'name', 'description']);

        // 2. 8 sách mới nhất
        $latestBooks = Product::with('category:id,name')
            ->where('status', 'active')
            ->orderByDesc('id')
            ->take(8)
            ->get()
            ->map(fn (Product $book) => $this->formatBook($book));

        // 3. Sách theo từng danh mục
        $categoriesWithBooks = Category::where('status', 'active')
            ->orderBy('id', 'asc')
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
            'categories_with_books' => $categoriesWithBooks,
        ];
    }
}