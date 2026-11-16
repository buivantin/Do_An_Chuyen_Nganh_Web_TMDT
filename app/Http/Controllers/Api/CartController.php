<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    protected $cartService;

    // Tiêm CartService vào để sử dụng
    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    // API Thêm sản phẩm vào giỏ hàng
    public function addToCart(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            // Lấy ID của user đang đăng nhập (nhờ Sanctum)
            $userId = Auth::id(); 
            
            // Gọi Service xử lý logic (kiểm tra tồn kho, cộng dồn...)
            $this->cartService->addToCart($userId, $request->product_id, $request->quantity);
            
            return response()->json([
                'message' => 'Đã thêm sản phẩm vào giỏ hàng thành công'
            ], 200);
            
        } catch (\Exception $e) {
            // Trả về lỗi (VD: vượt quá tồn kho) với mã 400 Bad Request
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
}