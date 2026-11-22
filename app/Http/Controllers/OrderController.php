<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlaceOrderRequest;
use App\Services\OrderService;
use Illuminate\Http\Request;
use App\Models\Order; // Thêm import này để đếm số lượng

class OrderController extends Controller
{
    public function __construct(private OrderService $orders) {}

    // --- DÀNH CHO KHÁCH HÀNG ---
    public function store(PlaceOrderRequest $request)
    {
        $order = $this->orders->placeOrder(
            $request->user()->id,
            $request->validated()
        );

        return response()->json($order->load('items'), 201);
    }

    public function index(Request $request)
    {
        return response()->json(
            $this->orders->listForUser($request->user()->id)
        );
    }

    public function show(Request $request, int $id)
    {
        return response()->json(
            $this->orders->findForUser($request->user()->id, $id)
        );
    }

    // TM-07: Khách hủy đơn
    public function cancel(Request $request, int $id)
    {
        try {
            $order = $this->orders->cancelOrder($request->user()->id, $id);
            return response()->json(['message' => 'Hủy đơn thành công', 'order' => $order], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // --- DÀNH CHO ADMIN (TM-13) ---
    public function adminIndex(Request $request)
    {
        $status = $request->query('status');
        
        $orders = $this->orders->listAllForAdmin($status);

        $counts = [
            'all'       => Order::count(),
            'pending'   => Order::where('status', 'pending')->count(),
            'shipping'  => Order::where('status', 'shipping')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        return response()->json([
            'data'   => $orders,
            'counts' => $counts
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,shipping,completed,cancelled'
        ]);

        try {
            $order = $this->orders->updateStatus($id, $request->status);
            return response()->json(['message' => 'Cập nhật thành công', 'order' => $order], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // --- API LẤY SỐ LƯỢNG ĐƠN CHỜ CHO CHUÔNG THÔNG BÁO ---
    public function getPendingCount()
    {
        $count = Order::where('status', 'pending')->count();
        return response()->json(['pending_count' => $count], 200);
    }
}