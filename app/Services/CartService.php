<?php

namespace App\Services;

use App\Models\Product;
use App\Models\CartItem;
use Exception;

class CartService
{
    public function addToCart($userId, $productId, $quantity)
    {
        // 1. Tìm sản phẩm
        $product = Product::findOrFail($productId);

        // 2. Kiểm tra xem sản phẩm đã có trong giỏ của user này chưa
        $cartItem = CartItem::where('user_id', $userId)
                            ->where('product_id', $productId)
                            ->first();

        $currentQty = $cartItem ? $cartItem->quantity : 0;
        $newQty = $currentQty + $quantity;

        // 3. Kiểm tra tồn kho (Không cho phép vượt quá số lượng trong kho)
        if ($newQty > $product->stock) {
            throw new Exception("Số lượng vượt quá tồn kho. Sản phẩm này chỉ còn {$product->stock} cuốn.");
        }

        // 4. Cập nhật hoặc tạo mới
        if ($cartItem) {
            // Nếu đã có, cộng dồn số lượng
            $cartItem->quantity = $newQty;
            $cartItem->save();
        } else {
            // Nếu chưa có, tạo mới
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
        }

        return true;
    }
}