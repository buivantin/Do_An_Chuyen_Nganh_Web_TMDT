<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    // API: Lấy danh sách giỏ hàng
    public function index()
    {
        $userId = Auth::id();

        // Đảm bảo không bao giờ tồn tại số lượng <= 0 trong giỏ hàng
        DB::table('cart_items')
            ->where('user_id', $userId)
            ->where('quantity', '<', 1)
            ->update(['quantity' => 1]);

        $cart = $this->cartService->getCart($userId);
        return response()->json($cart, 200);
    }

    // API Thêm sản phẩm vào giỏ hàng
    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ], [
            'quantity.min' => 'Số lượng sản phẩm phải lớn hơn hoặc bằng 1.',
            'quantity.integer' => 'Số lượng sản phẩm không hợp lệ.',
        ]);

        try {
            $userId = Auth::id();
            $this->cartService->addToCart(
                $userId,
                $validated['product_id'],
                (int) $validated['quantity']
            );

            return response()->json([
                'message' => 'Đã thêm sản phẩm vào giỏ hàng thành công',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    // API: Cập nhật số lượng sản phẩm (Chặn tuyệt đối số âm & số 0 kể cả khi dùng F12)
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ], [
            'quantity.min' => 'Số lượng sản phẩm không được nhỏ hơn 1.',
            'quantity.integer' => 'Số lượng sản phẩm không hợp lệ.',
        ]);

        try {
            $this->cartService->updateQuantity(
                Auth::id(),
                $id,
                (int) $validated['quantity']
            );
            return response()->json([
                'message' => 'Cập nhật giỏ hàng thành công',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    // API: Xóa sản phẩm khỏi giỏ
    public function destroy($id)
    {
        try {
            $this->cartService->removeFromCart(Auth::id(), $id);
            return response()->json([
                'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm',
            ], 400);
        }
    }
}