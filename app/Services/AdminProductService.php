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

    public function paginate(array $filters, int $perPage = 10)
    {
        $query = Product::with('category:id,name')->where('is_deleted', false);

        if (!empty($filters['keyword'])) {
            $query->where('name', 'like', '%' . $filters['keyword'] . '%');
        }
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest('id')->paginate($perPage);
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
            $this->deleteImage($product->image);          // xóa ảnh cũ do mình upload
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

            // Đã từng nằm trong đơn hàng -> xóa mềm để giữ lịch sử
            if (OrderItem::where('product_id', $id)->exists()) {
                $product->update(['is_deleted' => true, 'status' => 'hidden']);
                CartItem::where('product_id', $id)->delete();   // gỡ khỏi giỏ của mọi người

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
        // Tên ngẫu nhiên, đuôi lấy từ nội dung tệp (không tin tên do người dùng đặt)
        $name = Str::random(40) . '.' . $file->guessExtension();
        $file->move(public_path(self::IMAGE_DIR), $name);

        return '/' . self::IMAGE_DIR . '/' . $name;
    }

    private function deleteImage(?string $path): void
    {
        // Chỉ xóa ảnh do chức năng này tải lên, không đụng ảnh mẫu /imgs/...
        if ($path && str_starts_with($path, '/' . self::IMAGE_DIR . '/')) {
            @unlink(public_path($path));
        }
    }
}