<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlaceOrderRequest;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orders) {}

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
}