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
    public function placeOrder(int $userId, array $data): Order
    {
        return DB::transaction(function () use ($userId, $data) {
            $cartItems = CartItem::where('user_id', $userId)->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Giỏ hàng đang trống.',
                ]);
            }

            $products = Product::whereIn('id', $cartItems->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);

                if (!$product || $product->status !== 'active' || $product->is_deleted) {
                    throw ValidationException::withMessages([
                        'cart' => 'Có sản phẩm trong giỏ không còn được bán.',
                    ]);
                }

                if ($item->quantity < 1 || $product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Sản phẩm {$product->name} không đủ số lượng.",
                    ]);
                }

                $subtotal += $product->price * $item->quantity;
            }

            // Lấy phí ship từ Frontend gửi lên (mặc định là 0)
            $shippingFee = (float) ($data['shipping_fee'] ?? 0);
            $grandTotal = $subtotal + $shippingFee;

            $order = Order::create([
                'user_id'        => $userId,
                'voucher_id'     => null,
                'status'         => 'pending',
                'payment_method' => strtolower(trim($data['payment_method'] ?? 'cod')),
                'total_amount'   => $grandTotal, // Lưu tổng tiền đã cộng phí ship
                'address'        => trim($data['address']),
                'receiver_name'  => trim($data['receiver_name']),
                'phone'          => trim($data['phone']),
            ]);

            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item->quantity,
                    'price'      => $product->price,
                ]);

                $product->decrement('stock', $item->quantity);
            }

            CartItem::where('user_id', $userId)->delete();

            return $order;
        });
    }

    public function listForUser(int $userId, int $perPage = 10)
    {
        return Order::withCount('items')
            ->where('user_id', $userId)
            ->latest()
            ->paginate($perPage);
    }

    public function findForUser(int $userId, int $orderId): Order
    {
        return Order::with('items')
            ->where('user_id', $userId)
            ->findOrFail($orderId);
    }

    // TM-07: Khách tự hủy đơn
    public function cancelOrder(int $userId, int $orderId): Order
    {
        return DB::transaction(function () use ($userId, $orderId) {
            $order = Order::with('items')->where('user_id', $userId)->findOrFail($orderId);

            if ($order->status !== 'pending') {
                throw ValidationException::withMessages([
                    'order' => 'Không thể hủy đơn hàng vì đơn hàng đã được bàn giao cho đơn vị vận chuyển.',
                ]);
            }

            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }

            $order->status = 'cancelled';
            $order->save();

            return $order;
        });
    }

    // TM-13: Admin lấy danh sách đơn (có lọc)
    public function listAllForAdmin(?string $status = null, int $perPage = 15)
    {
        $query = Order::withCount('items')->with('user')->latest();
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        return $query->paginate($perPage);
    }

    // TM-13: Admin cập nhật trạng thái (chặn đi lùi)
    public function updateStatus(int $orderId, string $newStatus): Order
    {
        return DB::transaction(function () use ($orderId, $newStatus) {
            $order = Order::with('items')->findOrFail($orderId);
            $currentStatus = $order->status;

            // Đồng bộ trạng thái với Frontend và Controller
            $allowedTransitions = [
                'pending'    => ['shipping', 'cancelled'], 
                'shipping'   => ['completed', 'cancelled'],             
                'completed'  => [],
                'cancelled'  => []
            ];

            if (!in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
                throw ValidationException::withMessages([
                    'status' => "Lỗi: Không thể chuyển từ trạng thái '{$currentStatus}' sang '{$newStatus}'."
                ]);
            }

            // Nếu Admin hủy đơn, phải hoàn kho
            if ($newStatus === 'cancelled') {
                foreach ($order->items as $item) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }

            $order->status = $newStatus;
            $order->save();

            return $order;
        });
    }
}