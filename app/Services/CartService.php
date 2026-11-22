<?php

namespace App\Services;

use App\Models\Product;
use App\Models\CartItem;
use Exception;

class CartService
{
    // 1. Lấy danh sách giỏ hàng
    public function getCart($userId)
    {
        return CartItem::with('product')
                        ->where('user_id', $userId)
                        ->orderBy('id', 'desc')
                        ->get();
    }

    // 2. Thêm vào giỏ
    public function addToCart($userId, $productId, $quantity)
    {
        $product = Product::findOrFail($productId);

        $cartItem = CartItem::where('user_id', $userId)
                            ->where('product_id', $productId)
                            ->first();

        $currentQty = $cartItem ? $cartItem->quantity : 0;
        $newQty = $currentQty + $quantity;

        if ($newQty > $product->stock) {
            throw new Exception("Số lượng vượt quá tồn kho. Sản phẩm này chỉ còn {$product->stock} cuốn.");
        }

        if ($cartItem) {
            $cartItem->quantity = $newQty;
            $cartItem->save();
        } else {
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
        }

        return true;
    }

    // 3. Cập nhật số lượng
    public function updateQuantity($userId, $cartItemId, $quantity)
    {
        $cartItem = CartItem::where('user_id', $userId)->findOrFail($cartItemId);
        
        if ($quantity > $cartItem->product->stock) {
            throw new Exception("Số lượng vượt quá tồn kho.");
        }

        if ($quantity <= 0) {
            $cartItem->delete();
        } else {
            $cartItem->quantity = $quantity;
            $cartItem->save();
        }

        return true;
    }

    // 4. Xóa sản phẩm khỏi giỏ
    public function removeFromCart($userId, $cartItemId)
    {
        $cartItem = CartItem::where('user_id', $userId)->findOrFail($cartItemId);
        $cartItem->delete();
        return true;
    }
}