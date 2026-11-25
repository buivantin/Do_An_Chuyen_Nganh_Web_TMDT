<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function placeOrder(int $userId, array $data): Order
    {
        return DB::transaction(function () use ($userId, $data) {
            // 1. Khóa dòng cart_items của user này để chặn bấm đúp nút Đặt hàng (2 request song song)
            $cartItems = CartItem::where('user_id', $userId)
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Giỏ hàng đang trống.',
                ]);
            }

            // 2. Khóa dòng products theo thứ tự ID tăng dần để tránh Deadlock
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

            $shippingRates = [
                'standard' => 0,
                'express'  => 35000,
            ];
            $shippingMethod = strtolower(trim($data['shipping_method'] ?? 'standard'));
            $shippingFee = $shippingRates[$shippingMethod] ?? 0;

            // 2. Tự kiểm tra & tính giảm giá Voucher từ Database (nếu có voucher_id)
            $voucherId = null;
            $discountAmount = 0;

            if (!empty($data['voucher_id'])) {
                // Nếu dự án có bảng vouchers, query trực tiếp từ DB để kiểm tra điều kiện
                $voucher = DB::table('vouchers')
                    ->where('id', $data['voucher_id'])
                    ->lockForUpdate()
                    ->first();

                if ($voucher && $subtotal >= ($voucher->min_order_value ?? 0)) {
                    $voucherId = $voucher->id;
                    $type = strtolower($voucher->discount_type ?? 'fixed');
                    $val = (float) ($voucher->discount_value ?? 0);

                    if ($type === 'percent' || $type === 'percentage') {
                        $rawDisc = round(($subtotal * $val) / 100);
                        $maxDisc = (float) ($voucher->max_discount ?? 0);
                        $discountAmount = $maxDisc > 0 ? min($rawDisc, $maxDisc) : $rawDisc;
                    } else {
                        $discountAmount = min($val, $subtotal);
                    }
                }
            }
            $grandTotal = max(0, $subtotal - $discountAmount) + $shippingFee;

            $order = Order::create([
                'user_id'        => $userId,
                'voucher_id'     => null,
                'status'         => 'pending',
                'payment_method' => strtolower(trim($data['payment_method'] ?? 'cod')),
                'shipping_fee'   => $shippingFee,
                'total_amount'   => $grandTotal,
                'address'        => trim($data['address']),
                'receiver_name'  => trim($data['receiver_name']),
                'phone'          => trim($data['phone']),
                'note'           => !empty($data['note']) ? trim($data['note']) : null,
            ]);

            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item->quantity,
                    'price'      => $product->price,
                ]);

                $affectedRows = Product::where('id', $product->id)
                    ->where('stock', '>=', $item->quantity)
                    ->decrement('stock', $item->quantity);

                if ($affectedRows === 0) {
                    throw ValidationException::withMessages([
                        'cart' => "Sản phẩm {$product->name} vừa hết hàng, vui lòng kiểm tra lại.",
                    ]);
                }
            }

            CartItem::where('user_id', $userId)->delete();

            return $order;
        });
    }

    public function listForUser(int $userId, int $perPage = 10)
    {
        return Order::with(['items.product'])
            ->withCount('items')
            ->where('user_id', $userId)
            ->latest()
            ->paginate($perPage);
    }

    public function findForUser(int $userId, int $orderId): Order
    {
        return Order::with(['items.product'])
            ->where('user_id', $userId)
            ->findOrFail($orderId);
    }

    // TM-07: Khách tự hủy đơn khi đang chờ xác nhận
    public function cancelOrder(int $userId, int $orderId): Order
    {
        return DB::transaction(function () use ($userId, $orderId) {
            $order = Order::with('items')->where('user_id', $userId)->findOrFail($orderId);

            if ($order->status !== 'pending') {
                throw ValidationException::withMessages([
                    'order' => 'Không thể hủy đơn hàng vì đơn hàng đã được tiếp nhận xử lý hoặc bàn giao vận chuyển.',
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

    // Khách hàng gửi yêu cầu hoàn đơn / đổi trả trong vòng 3 ngày kể từ khi hoàn thành
    public function requestReturn(int $userId, int $orderId, array $data, array $imageFiles): Order
    {
        return DB::transaction(function () use ($userId, $orderId, $data, $imageFiles) {
            $order = Order::with(['items.product'])
                ->where('user_id', $userId)
                ->findOrFail($orderId);

            if ($order->status !== 'completed') {
                throw ValidationException::withMessages([
                    'order' => 'Chỉ có thể gửi yêu cầu hoàn đơn / đổi trả đối với đơn hàng đã hoàn thành.',
                ]);
            }

            $completedAnchor = $order->completed_at ?? $order->updated_at;
            if (!$completedAnchor || now()->greaterThan($completedAnchor->copy()->addDays(3))) {
                throw ValidationException::withMessages([
                    'order' => 'Đã quá thời hạn 3 ngày kể từ khi hoàn thành đơn hàng, không thể gửi yêu cầu hoàn đơn / đổi trả.',
                ]);
            }

            if (empty($imageFiles)) {
                throw ValidationException::withMessages([
                    'images' => 'Vui lòng tải lên ít nhất 1 hình ảnh chứng minh tình trạng sản phẩm.',
                ]);
            }

            $storedPaths = [];
            foreach ($imageFiles as $file) {
                if ($file instanceof UploadedFile && $file->isValid()) {
                    $path = $file->store('returns', 'public');
                    $storedPaths[] = '/storage/' . $path;
                }
            }

            if (empty($storedPaths)) {
                throw ValidationException::withMessages([
                    'images' => 'Không thể lưu hình ảnh chứng minh. Vui lòng thử lại.',
                ]);
            }

            $order->status              = 'return_requested';
            $order->return_type         = $data['return_type'];
            $order->return_reason       = trim($data['return_reason']);
            $order->return_images       = $storedPaths;
            $order->return_requested_at = now();
            $order->admin_return_note   = null;
            $order->save();

            return $order->fresh(['items.product']);
        });
    }

    // TM-13: Admin lấy danh sách đơn (có lọc trạng thái + tìm kiếm)
    public function listAllForAdmin(?string $status = null, ?string $keyword = null, int $perPage = 15)
    {
        $keyword = trim((string) $keyword);

        $query = Order::with(['user', 'items.product'])
            ->withCount('items')
            ->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($keyword !== '') {
            $numericId = preg_replace('/[^0-9]/', '', $keyword);
            $query->where(function ($q) use ($keyword, $numericId) {
                if ($numericId !== '') {
                    $q->orWhere('id', (int) $numericId);
                }
                $q->orWhere('receiver_name', 'like', "%{$keyword}%")
                  ->orWhere('phone', 'like', "%{$keyword}%")
                  ->orWhere('tracking_code', 'like', "%{$keyword}%")
                  ->orWhereHas('user', function ($uq) use ($keyword) {
                      $uq->where('username', 'like', "%{$keyword}%")
                         ->orWhere('email', 'like', "%{$keyword}%");
                  });
            });
        }

        return $query->paginate($perPage);
    }

    public function findForAdmin(int $orderId): Order
    {
        return Order::with(['user', 'items.product'])->findOrFail($orderId);
    }

    // TM-13: Admin cập nhật trạng thái (hỗ trợ cả processing và duyệt/từ chối hoàn đơn)
    public function updateStatus(int $orderId, string $newStatus, array $extra = []): Order
    {
        return DB::transaction(function () use ($orderId, $newStatus, $extra) {
            $order = Order::with(['items', 'user'])->findOrFail($orderId);
            $currentStatus = $order->status;

            $allowedTransitions = [
                'pending'          => ['processing', 'shipping', 'cancelled'],
                'processing'       => ['shipping', 'completed', 'cancelled'],
                'shipping'         => ['completed', 'cancelled'],
                'completed'        => ['returned'],
                'return_requested' => ['returned', 'completed'], // returned = Chấp nhận hoàn đơn; completed = Từ chối hoàn đơn
                'returned'         => [],
                'cancelled'        => [],
            ];

            if (!in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
                throw ValidationException::withMessages([
                    'status' => "Không thể chuyển từ trạng thái '{$currentStatus}' sang '{$newStatus}'."
                ]);
            }

            // Hoàn tồn kho nếu hủy đơn hoặc chấp nhận hoàn đơn
            if (in_array($newStatus, ['cancelled', 'returned']) && !in_array($currentStatus, ['cancelled', 'returned'])) {
                foreach ($order->items as $item) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }

            // Lưu thông tin bàn giao vận chuyển nếu có
            if (!empty($extra['shipping_provider'])) {
                $order->shipping_provider = trim((string) $extra['shipping_provider']);
            }
            if (!empty($extra['tracking_code'])) {
                $order->tracking_code = strtoupper(trim((string) $extra['tracking_code']));
            }
            if (array_key_exists('shipper_info', $extra) && $extra['shipper_info'] !== null) {
                $order->shipper_info = trim((string) $extra['shipper_info']) ?: null;
            }
            if (array_key_exists('delivery_note', $extra) && $extra['delivery_note'] !== null) {
                $order->delivery_note = trim((string) $extra['delivery_note']) ?: null;
            }
            if (array_key_exists('admin_return_note', $extra) && $extra['admin_return_note'] !== null) {
                $order->admin_return_note = trim((string) $extra['admin_return_note']) ?: null;
            }

            // Ghi nhận mốc thời gian hoàn thành (giữ mốc cũ nếu Admin từ chối hoàn đơn quay lại completed)
            if ($newStatus === 'completed' && !$order->completed_at) {
                $order->completed_at = now();
            }

            $order->status = $newStatus;
            $order->save();

            // Tự động tính lại tổng chi tiêu tích lũy và cấp bậc thành viên (1..5)
            if ($order->user && in_array($newStatus, ['completed', 'returned'])) {
                $order->user->refreshMembershipTier();
            }

            return $order->fresh(['user', 'items.product']);
        });
    }
}