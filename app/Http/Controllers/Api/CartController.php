<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index()
    {
        $cart = $this->cartService->getCart(Auth::id());
        return response()->json($cart, 200);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            $this->cartService->addToCart(Auth::id(), $request->product_id, $request->quantity);
            return response()->json(['message' => 'Đã thêm sản phẩm vào giỏ hàng thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer'
        ]);

        try {
            $this->cartService->updateQuantity(Auth::id(), $id, $request->quantity);
            return response()->json(['message' => 'Cập nhật giỏ hàng thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy($id)
    {
        try {
            $this->cartService->removeFromCart(Auth::id(), $id);
            return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 400);
        }
    }
}