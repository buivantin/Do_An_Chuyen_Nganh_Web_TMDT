<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OrderController extends Controller
{
    /**
     * Hoàn trả lượt sử dụng voucher khi đơn hàng bị hủy
     */
    private function releaseOrderVoucher(Order $order): void
    {
        if (!Schema::hasColumn('orders', 'voucher_id') || empty($order->voucher_id)) {
            return;
        }

        $voucher = Voucher::find($order->voucher_id);
        if (!$voucher) {
            return;
        }

        if ($voucher->used_count > 0) {
            $voucher->decrement('used_count');
        }

        if ($order->user_id && Schema::hasTable('user_vouchers')) {
            DB::table('user_vouchers')
                ->where('voucher_id', $voucher->id)
                ->where('user_id', $order->user_id)
                ->update(['used_at' => null, 'updated_at' => now()]);
        }
    }

    /**
     * Cập nhật chi tiêu tích lũy & tự động thăng hạng thành viên khi đơn hàng hoàn thành
     */
    private function syncUserMembershipOnCompleted(Order $order): void
    {
        if (!$order->user_id || !Schema::hasColumn('users', 'total_spent')) {
            return;
        }

        $user = User::find($order->user_id);
        if (!$user || $user->role === 'admin') {
            return;
        }

        $orderNetAmount = max(0, (float) $order->total_amount - (float) ($order->shipping_fee ?? 0));
        $newTotalSpent = (float) $user->total_spent + $orderNetAmount;

        // Xác định cấp bậc theo mốc chi tiêu tích lũy (1 -> 5)
        $newTier = 1;
        if ($newTotalSpent >= 10000000) {
            $newTier = 5; // Đại Sứ Tri Thức
        } elseif ($newTotalSpent >= 5000000) {
            $newTier = 4; // Tri Kỷ Sách
        } elseif ($newTotalSpent >= 2000000) {
            $newTier = 3; // Độc Giả Thân Thiết
        } elseif ($newTotalSpent >= 500000) {
            $newTier = 2; // Bạn Đọc Tích Cực
        }

        $user->update([
            'total_spent'     => $newTotalSpent,
            'membership_tier' => max((int) $user->membership_tier, $newTier),
        ]);
    }

    /**
     * 1. Tự động hoàn thành đơn "delivered" sau 3 ngày nếu không hoàn đơn
     * 2. Tự động hủy đơn "pending" quá 5 ngày Admin chưa xác nhận & trả sản phẩm về giỏ hàng
     */
    private function runScheduledOrderChecks(): void
    {
        // A. Tự động hoàn thành đơn đã giao quá 3 ngày
        if (Schema::hasColumn('orders', 'delivered_at')) {
            $threeDaysAgo = Carbon::now()->subDays(3);
            $ordersToComplete = Order::where('status', 'delivered')
                ->where(function ($q) use ($threeDaysAgo) {
                    $q->where('delivered_at', '<=', $threeDaysAgo)
                      ->orWhere(function ($q2) use ($threeDaysAgo) {
                          $q2->whereNull('delivered_at')
                             ->where('updated_at', '<=', $threeDaysAgo);
                      });
                })
                ->get();

            foreach ($ordersToComplete as $deliveredOrder) {
                $completeData = ['status' => 'completed'];
                if (Schema::hasColumn('orders', 'completed_at')) {
                    $completeData['completed_at'] = Carbon::now();
                }
                $deliveredOrder->update($completeData);
                $this->syncUserMembershipOnCompleted($deliveredOrder);
            }
        }

        // B. Tự động trả đơn về giỏ hàng nếu Admin không xác nhận trong vòng 5 ngày
        $fiveDaysAgo = Carbon::now()->subDays(5);
        $expiredPendingOrders = Order::with('items')
            ->where('status', 'pending')
            ->where('created_at', '<=', $fiveDaysAgo)
            ->get();

        foreach ($expiredPendingOrders as $order) {
            DB::transaction(function () use ($order) {
                foreach ($order->items as $item) {
                    $existingCart = DB::table('cart_items')
                        ->where('user_id', $order->user_id)
                        ->where('product_id', $item->product_id)
                        ->first();

                    if ($existingCart) {
                        DB::table('cart_items')
                            ->where('id', $existingCart->id)
                            ->increment('quantity', $item->quantity);
                    } else {
                        DB::table('cart_items')->insert([
                            'user_id' => $order->user_id,
                            'product_id' => $item->product_id,
                            'quantity' => $item->quantity,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }

                $this->releaseOrderVoucher($order);

                $expireMessage = '[Hệ thống] Đơn hàng chưa được xử lý trong vòng 5 ngày nên đã tự động hủy và trả sản phẩm về giỏ hàng của bạn.';
                $newNote = trim(($order->note ? $order->note . ' | ' : '') . $expireMessage);

                $order->update([
                    'status' => 'cancelled',
                    'note' => $newNote,
                ]);
            });
        }
    }

    /**
     * Đặt hàng (POST /api/orders)
     * Xác thực tuyệt đối Voucher ở Backend (chống giả mạo F12), chưa trừ kho ở bước này
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $receiverName = trim((string) ($request->input('receiver_name') ?? $request->input('shipping_name') ?? $request->input('name') ?? ''));
        $phone = trim((string) ($request->input('phone') ?? $request->input('shipping_phone') ?? $request->input('receiver_phone') ?? ''));
        $address = trim((string) ($request->input('address') ?? $request->input('shipping_address') ?? $request->input('receiver_address') ?? ''));

        if ($receiverName === '' || $phone === '' || $address === '') {
            return response()->json([
                'message' => 'Vui lòng cung cấp đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.',
            ], 422);
        }

        $cartItems = DB::table('cart_items')
            ->join('products', 'cart_items.product_id', '=', 'products.id')
            ->where('cart_items.user_id', $user->id)
            ->select(
                'cart_items.product_id',
                'cart_items.quantity',
                'products.name as product_name',
                'products.price',
                'products.stock'
            )
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Giỏ hàng của bạn đang trống.',
            ], 422);
        }

        // Chặn số lượng âm hoặc vượt tồn kho kể cả khi gửi request giả mạo qua F12
        foreach ($cartItems as $item) {
            if ((int) $item->quantity <= 0) {
                return response()->json([
                    'message' => 'Số lượng sản phẩm trong giỏ hàng không hợp lệ.',
                ], 422);
            }
            if ($item->stock < $item->quantity) {
                return response()->json([
                    'message' => "Ấn phẩm \"{$item->product_name}\" chỉ còn {$item->stock} cuốn trong kho.",
                ], 422);
            }
        }

        $subtotal = (float) $cartItems->sum(fn ($i) => $i->price * $i->quantity);
        $shippingFee = max(0, (float) $request->input('shipping_fee', 0));
        $voucherIdInput = $request->input('voucher_id');
        $voucherCodeInput = trim((string) ($request->input('voucher_code') ?? $request->input('code') ?? ''));

        try {
            $order = DB::transaction(function () use (
                $user,
                $receiverName,
                $phone,
                $address,
                $cartItems,
                $request,
                $subtotal,
                $shippingFee,
                $voucherIdInput,
                $voucherCodeInput
            ) {
                $discount = 0.0;
                $appliedVoucher = null;

                // Kiểm tra & khóa voucher trên Server (bỏ qua hoàn toàn discount_amount giả mạo từ Client)
                if (!empty($voucherIdInput) || $voucherCodeInput !== '') {
                    $voucherQuery = Voucher::lockForUpdate();
                    if (!empty($voucherIdInput)) {
                        $appliedVoucher = $voucherQuery->find((int) $voucherIdInput);
                    } else {
                        $appliedVoucher = $voucherQuery->where('code', strtoupper($voucherCodeInput))->first();
                    }

                    if (!$appliedVoucher) {
                        abort(422, 'Mã giảm giá không tồn tại hoặc đã bị xóa.');
                    }

                    $check = $appliedVoucher->validateForUser($user, $subtotal);
                    if (!$check['valid']) {
                        abort(422, $check['message']);
                    }

                    $discount = $appliedVoucher->calculateDiscount($subtotal);
                }

                $totalAmount = max(0, $subtotal - $discount) + $shippingFee;

                $orderData = [
                    'user_id' => $user->id,
                    'receiver_name' => $receiverName,
                    'phone' => $phone,
                    'address' => $address,
                    'payment_method' => $request->input('payment_method', 'cod'),
                    'shipping_fee' => $shippingFee,
                    'total_amount' => $totalAmount,
                    'note' => $request->input('note') ?? $request->input('notes'),
                    'status' => 'pending',
                ];

                if (Schema::hasColumn('orders', 'discount_amount')) {
                    $orderData['discount_amount'] = $discount;
                }
                if (Schema::hasColumn('orders', 'voucher_id')) {
                    $orderData['voucher_id'] = $appliedVoucher?->id;
                }

                $order = Order::create($orderData);

                if (Schema::hasColumn('orders', 'order_code') && empty($order->order_code)) {
                    $order->order_code = 'DH' . str_pad((string) $order->id, 4, '0', STR_PAD_LEFT);
                    $order->save();
                }

                // Cập nhật lượt đã sử dụng của Voucher & đánh dấu đã dùng trong user_vouchers
                if ($appliedVoucher) {
                    $appliedVoucher->increment('used_count');
                    if (Schema::hasTable('user_vouchers')) {
                        DB::table('user_vouchers')
                            ->where('voucher_id', $appliedVoucher->id)
                            ->where('user_id', $user->id)
                            ->update(['used_at' => now(), 'updated_at' => now()]);
                    }
                }

                foreach ($cartItems as $item) {
                    DB::table('order_items')->insert([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Chỉ xóa giỏ hàng, KHÔNG trừ stock ở đây (chỉ trừ khi Admin xác nhận đơn)
                DB::table('cart_items')->where('user_id', $user->id)->delete();

                return $order->load(['items.product']);
            });
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'message' => 'Đặt hàng thành công! Đơn hàng đang chờ quản trị viên xác nhận.',
            'data' => $order,
            'order' => $order,
        ], 201);
    }

    /**
     * Danh sách đơn hàng của User (GET /api/orders)
     */
    public function index(Request $request)
    {
        $this->runScheduledOrderChecks();

        $orders = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $orders,
        ]);
    }

    /**
     * Chi tiết 1 đơn hàng của User (GET /api/orders/{id})
     */
    public function show(Request $request, $id)
    {
        $this->runScheduledOrderChecks();

        $order = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'data' => $order,
        ]);
    }

    /**
     * Khách hàng hủy đơn khi đang chờ xác nhận (POST /api/orders/{id}/cancel)
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $this->releaseOrderVoucher($order);
            $order->update(['status' => 'cancelled']);
        });

        return response()->json([
            'message' => 'Đã hủy đơn hàng thành công.',
            'data' => $order->fresh(['items.product']),
        ]);
    }

    /**
     * Khách hàng gửi Form yêu cầu hoàn đơn / đổi trả trong vòng 3 ngày (POST /api/orders/{id}/return)
     */
    public function requestReturn(Request $request, $id)
    {
        $this->runScheduledOrderChecks();

        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if (!in_array($order->status, ['delivered', 'completed'], true)) {
            return response()->json([
                'message' => 'Chỉ có thể yêu cầu hoàn đơn đối với đơn hàng đã giao.',
            ], 422);
        }

        $deliveredTime = ($order->delivered_at ?? null)
            ?? ($order->completed_at ?? null)
            ?? $order->updated_at;

        if ($deliveredTime && Carbon::parse($deliveredTime)->addDays(3)->isPast()) {
            return response()->json([
                'message' => 'Đã quá thời hạn 3 ngày kể từ khi nhận hàng, không thể gửi yêu cầu hoàn đơn.',
            ], 422);
        }

        $validated = $request->validate([
            'return_type' => 'required|in:refund,exchange',
            'return_reason' => 'required|string|min:10|max:1000',
            'images.*' => 'nullable|image|max:5120',
        ], [
            'return_reason.required' => 'Vui lòng nhập lý do hoàn đơn / mô tả lỗi sản phẩm.',
            'return_reason.min' => 'Vui lòng mô tả chi tiết ít nhất 10 ký tự.',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('returns', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $updateData = ['status' => 'return_requested'];
        if (Schema::hasColumn('orders', 'return_type')) {
            $updateData['return_type'] = $validated['return_type'];
        }
        if (Schema::hasColumn('orders', 'return_reason')) {
            $updateData['return_reason'] = $validated['return_reason'];
        }
        if (Schema::hasColumn('orders', 'return_images')) {
            $updateData['return_images'] = $imagePaths;
        }
        if (Schema::hasColumn('orders', 'return_requested_at')) {
            $updateData['return_requested_at'] = Carbon::now();
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Đã gửi yêu cầu hoàn đơn thành công. Cửa hàng sẽ liên hệ với bạn sớm nhất!',
            'data' => $order->fresh(['items.product']),
        ]);
    }

    /**
     * Khách hàng chủ động bấm "Đã nhận hàng & Hoàn thành"
     */
    public function confirmCompleted(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if ($order->status !== 'delivered') {
            return response()->json([
                'message' => 'Đơn hàng không ở trạng thái chờ xác nhận hoàn thành.',
            ], 422);
        }

        $updateData = ['status' => 'completed'];
        if (Schema::hasColumn('orders', 'completed_at')) {
            $updateData['completed_at'] = Carbon::now();
        }

        $order->update($updateData);
        $this->syncUserMembershipOnCompleted($order);

        return response()->json([
            'message' => 'Cảm ơn bạn đã xác nhận hoàn thành đơn hàng!',
            'data' => $order->fresh(['items.product']),
        ]);
    }

    /**
     * ADMIN: Đếm số lượng đơn chờ xác nhận
     */
    public function getPendingCount()
    {
        $this->runScheduledOrderChecks();

        $pending = Order::where('status', 'pending')->count();
        $returnRequested = Order::where('status', 'return_requested')->count();

        return response()->json([
            'count' => $pending,
            'pending_count' => $pending,
            'return_requested_count' => $returnRequested,
        ]);
    }

    /**
     * ADMIN: Danh sách đơn hàng + đếm số lượng từng trạng thái
     */
    public function adminIndex(Request $request)
    {
        $this->runScheduledOrderChecks();

        $query = Order::with(['user', 'items.product'])->orderByDesc('id');

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'completed') {
                $query->whereIn('status', ['delivered', 'completed']);
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('keyword')) {
            $kw = trim($request->keyword);
            $numericId = preg_replace('/[^0-9]/', '', $kw);
            $query->where(function ($q) use ($kw, $numericId) {
                $q->where('receiver_name', 'like', "%{$kw}%")
                  ->orWhere('phone', 'like', "%{$kw}%");
                if (Schema::hasColumn('orders', 'order_code')) {
                    $q->orWhere('order_code', 'like', "%{$kw}%");
                }
                if (Schema::hasColumn('orders', 'tracking_code')) {
                    $q->orWhere('tracking_code', 'like', "%{$kw}%");
                }
                if ($numericId !== '') {
                    $q->orWhere('id', (int) $numericId);
                }
            });
        }

        $counts = [
            'all' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipping' => Order::where('status', 'shipping')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'completed' => Order::whereIn('status', ['delivered', 'completed'])->count(),
            'return_requested' => Order::where('status', 'return_requested')->count(),
            'returned' => Order::where('status', 'returned')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        return response()->json([
            'data' => $query->paginate(15),
            'counts' => $counts,
        ]);
    }

    /**
     * ADMIN: Chi tiết 1 đơn hàng
     */
    public function adminShow($id)
    {
        $this->runScheduledOrderChecks();

        $order = Order::with(['user', 'items.product'])->findOrFail($id);

        return response()->json([
            'data' => $order,
            'order' => $order,
        ]);
    }

    /**
     * ADMIN: Cập nhật trạng thái đơn hàng
     * Chỉ trừ kho khi đơn chuyển từ "pending" (Chờ xác nhận) sang trạng thái xử lý/giao hàng!
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::with('items.product')->findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->input('status');

        $isStockDeductedOld = !in_array($oldStatus, ['pending', 'cancelled', 'returned'], true);
        $isStockDeductedNew = !in_array($newStatus, ['pending', 'cancelled', 'returned'], true);

        // Khi Admin xác nhận đơn từ pending -> trừ tồn kho
        if (!$isStockDeductedOld && $isStockDeductedNew) {
            foreach ($order->items as $item) {
                if (!$item->product || $item->product->stock < $item->quantity) {
                    $name = $item->product->name ?? "Sản phẩm #{$item->product_id}";
                    $remain = $item->product->stock ?? 0;
                    return response()->json([
                        'message' => "Không thể xác nhận đơn vì ấn phẩm \"{$name}\" chỉ còn {$remain} cuốn trong kho.",
                    ], 422);
                }
            }
        }

        // Khi Admin nhấn "Xác nhận đã giao" từ trạng thái đang giao -> lưu delivered_at để bắt đầu đếm 3 ngày
        if ($newStatus === 'completed' && $oldStatus === 'shipping') {
            $updateDelivered = ['status' => 'delivered'];
            if (Schema::hasColumn('orders', 'delivered_at')) {
                $updateDelivered['delivered_at'] = Carbon::now();
            }
            $order->update($updateDelivered);

            return response()->json([
                'message' => 'Đã xác nhận giao hàng! Đơn sẽ tự động hoàn thành sau 3 ngày nếu khách không yêu cầu hoàn đơn.',
                'data' => $order,
            ]);
        }

        $updateData = ['status' => $newStatus];

        if ($newStatus === 'shipping') {
            if (Schema::hasColumn('orders', 'shipping_provider')) {
                $updateData['shipping_provider'] = $request->input('shipping_provider');
            }
            if (Schema::hasColumn('orders', 'tracking_code')) {
                $updateData['tracking_code'] = $request->input('tracking_code');
            }
            if (Schema::hasColumn('orders', 'shipper_info')) {
                $updateData['shipper_info'] = $request->input('shipper_info');
            }
            if (Schema::hasColumn('orders', 'delivery_note')) {
                $updateData['delivery_note'] = $request->input('delivery_note');
            }
        }

        if ($request->filled('admin_return_note') && Schema::hasColumn('orders', 'admin_return_note')) {
            $updateData['admin_return_note'] = $request->input('admin_return_note');
        }

        if ($newStatus === 'completed' && Schema::hasColumn('orders', 'completed_at')) {
            $updateData['completed_at'] = Carbon::now();
        }

        DB::transaction(function () use ($order, $updateData, $oldStatus, $newStatus, $isStockDeductedOld, $isStockDeductedNew) {
            // 1. Trừ tồn kho khi Admin xác nhận đơn (từ pending -> processing/shipping/completed)
            if (!$isStockDeductedOld && $isStockDeductedNew) {
                foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->decrement('stock', $item->quantity);
                    }
                }
            }

            // 2. Hoàn lại tồn kho nếu đơn đã được xác nhận trước đó nhưng bị Hủy hoặc Chấp nhận hoàn đơn
            if ($isStockDeductedOld && !$isStockDeductedNew) {
                foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->increment('stock', $item->quantity);
                    }
                }
            }

            // 3. Hoàn lại lượt dùng voucher nếu đơn bị hủy
            if ($oldStatus !== 'cancelled' && $newStatus === 'cancelled') {
                $this->releaseOrderVoucher($order);
            }

            $order->update($updateData);

            // 4. Cộng dồn chi tiêu & thăng hạng thành viên khi đơn chuyển sang hoàn thành
            if ($oldStatus !== 'completed' && $newStatus === 'completed') {
                $this->syncUserMembershipOnCompleted($order);
            }
        });

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công.',
            'data' => $order,
        ]);
    }
}