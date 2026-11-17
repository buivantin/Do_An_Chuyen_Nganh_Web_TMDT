<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlaceOrderRequest;
use App\Services\OrderService;

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
}