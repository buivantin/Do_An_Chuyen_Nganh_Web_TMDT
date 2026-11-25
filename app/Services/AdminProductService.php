<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminProductService
{
    private const IMAGE_DIR = 'uploads/products';
    public const LOW_STOCK_THRESHOLD = 5;

    public function paginate(array $filters, int $perPage = 10)
    {
        $query = Product::with('category:id,name')->where('is_deleted', false);

        $keyword = trim((string) ($filters['keyword'] ?? ''));
        if ($keyword !== '') {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $keyword);
            $idSearch = ltrim($keyword, '#');

            $query->where(function ($q) use ($escaped, $idSearch) {
                $q->where('name', 'like', "%{$escaped}%")
                    ->orWhere('author', 'like', "%{$escaped}%");

                if (ctype_digit($idSearch)) {
                    $q->orWhere('id', (int) $idSearch);
                }
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['stock_status'])) {
            switch ($filters['stock_status']) {
                case 'out_of_stock':
                    $query->where('stock', 0);
                    break;
                case 'low_stock':
                    $query->where('stock', '>', 0)
                        ->where('stock', '<=', self::LOW_STOCK_THRESHOLD);
                    break;
                case 'alert':
                    $query->where('stock', '<=', self::LOW_STOCK_THRESHOLD);
                    break;
            }
        }

        return $query->orderBy('id', 'asc')->paginate($perPage);
    }

    public function getStockAlerts(int $threshold = self::LOW_STOCK_THRESHOLD): array
    {
        $alertProducts = Product::with('category:id,name')
            ->where('is_deleted', false)
            ->where('stock', '<=', $threshold)
            ->orderBy('stock', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $outOfStockCount = $alertProducts->where('stock', 0)->count();
        $lowStockCount = $alertProducts->where('stock', '>', 0)->count();

        return [
            'threshold' => $threshold,
            'out_of_stock_count' => $outOfStockCount,
            'low_stock_count' => $lowStockCount,
            'total_alert_count' => $alertProducts->count(),
            'items' => $alertProducts->values(),
        ];
    }

    public function find(int $id): Product
    {
        return Product::with('category:id,name')
            ->where('is_deleted', false)
            ->findOrFail($id);
    }

    public function create(array $data, ?UploadedFile $image): Product
    {
        $payload = Arr::except($data, ['image']);
        $payload['is_deleted'] = false;

        if ($image) {
            $payload['image'] = $this->storeImage($image);
        }

        return Product::create($payload);
    }

    public function update(int $id, array $data, ?UploadedFile $image): Product
    {
        $product = $this->find($id);
        $payload = Arr::except($data, ['image']);

        if ($image) {
            $this->deleteImage($product->image);
            $payload['image'] = $this->storeImage($image);
        }

        $product->update($payload);

        return $product->fresh('category');
    }

    public function toggleStatus(int $id): Product
    {
        $product = $this->find($id);
        $product->update(['status' => $product->status === 'active' ? 'hidden' : 'active']);

        return $product;
    }

    /** @return string 'soft' nếu xóa mềm, 'hard' nếu xóa cứng */
    public function delete(int $id): string
    {
        return DB::transaction(function () use ($id) {
            $product = Product::where('is_deleted', false)->lockForUpdate()->findOrFail($id);

            if (OrderItem::where('product_id', $id)->exists()) {
                $product->update(['is_deleted' => true, 'status' => 'hidden']);
                CartItem::where('product_id', $id)->delete();

                return 'soft';
            }

            CartItem::where('product_id', $id)->delete();
            $this->deleteImage($product->image);
            $product->delete();

            return 'hard';
        });
    }

    private function storeImage(UploadedFile $file): string
    {
        $name = Str::random(40) . '.' . $file->guessExtension();
        $file->move(public_path(self::IMAGE_DIR), $name);

        return '/' . self::IMAGE_DIR . '/' . $name;
    }

    private function deleteImage(?string $path): void
    {
        if ($path && str_starts_with($path, '/' . self::IMAGE_DIR . '/')) {
            @unlink(public_path($path));
        }
    }
}