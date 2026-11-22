<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Đặt hàng: đọc giỏ -> kiểm tra tồn kho -> tạo order + order_items
     * -> trừ kho -> xóa giỏ. Tất cả trong 1 transaction.
     */
    public function placeOrder(int $userId, array $data): Order
    {
        return DB::transaction(function () use ($userId, $data) {

            // 1. Đọc giỏ hàng của user
            $cartItems = CartItem::where('user_id', $userId)->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Giỏ hàng đang trống.',
                ]);
            }

            // 2. Khóa các sản phẩm trong giỏ (sắp theo id để tránh deadlock)
            $products = Product::whereIn('id', $cartItems->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // 3. Kiểm tra từng dòng và tính tổng tiền từ giá trong CSDL
            $total = 0;
            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);

                if (!$product || $product->status !== 'active') {
                    throw ValidationException::withMessages([
                        'cart' => 'Có sản phẩm trong giỏ không còn được bán.',
                    ]);
                }

                if ($item->quantity < 1 || $product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Sản phẩm {$product->name} không đủ số lượng.",
                    ]);
                }

                $total += $product->price * $item->quantity;
            }

            // 4. Tạo đơn hàng
            $order = Order::create([
                'user_id'        => $userId,
                'voucher_id'     => null, // TODO: xử lý voucher sau
                'status'         => 'pending',
                'payment_method' => strtolower(trim($data['payment_method'] ?? 'cod')),
                'total_amount'   => $total,
                'address'        => trim($data['address']),
                'receiver_name'  => trim($data['receiver_name']),
                'phone'          => trim($data['phone']),
            ]);

            // 5. Tạo chi tiết đơn và trừ kho
            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item->quantity,
                    'price'      => $product->price, // giá tại thời điểm mua
                ]);

                $product->decrement('stock', $item->quantity);
            }

            // 6. Xóa giỏ hàng
            CartItem::where('user_id', $userId)->delete();

            return $order;
        });
    }

    public function listForUser(int $userId, int $perPage = 10)
    {
        $orders = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate($perPage);

        $userReviews = \App\Models\Review::where('user_id', $userId)
            ->get()
            ->keyBy('product_id');

        $orders->getCollection()->transform(function (Order $order) use ($userReviews) {
            $order->items->transform(function ($item) use ($userReviews) {
                $review = $userReviews->get($item->product_id);
                $item->setAttribute('user_review', $review ? [
                    'id'      => $review->id,
                    'rating'  => $review->rating,
                    'comment' => $review->comment,
                ] : null);
                return $item;
            });
            return $order;
        });

        return $orders;
    }

    public function findForUser(int $userId, int $orderId): Order
    {
        $order = Order::with(['items.product'])
            ->where('user_id', $userId)
            ->findOrFail($orderId);

        $userReviews = \App\Models\Review::where('user_id', $userId)
            ->whereIn('product_id', $order->items->pluck('product_id'))
            ->get()
            ->keyBy('product_id');

        $order->items->transform(function ($item) use ($userReviews) {
            $review = $userReviews->get($item->product_id);
            $item->setAttribute('user_review', $review ? [
                'id'      => $review->id,
                'rating'  => $review->rating,
                'comment' => $review->comment,
            ] : null);
            return $item;
        });

        return $order;
    }
}