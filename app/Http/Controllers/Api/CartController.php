<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class CartController extends Controller
{
    protected $cartService;

    // Tiêm CartService vào để sử dụng
    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Lấy query CartItem thuộc về user hiện tại (tương thích cả 2 cấu trúc bảng carts/cart_items)
     */
    private function userCartItemsQuery(int $userId)
    {
        if (Schema::hasColumn('cart_items', 'cart_id') && class_exists(Cart::class)) {
            $cart = Cart::firstOrCreate(['user_id' => $userId]);
            return CartItem::where('cart_id', $cart->id);
        }

        return CartItem::where('user_id', $userId);
    }

    // API Lấy danh sách sản phẩm trong giỏ hàng (GET /api/cart)
    public function index()
    {
        $userId = Auth::id();
        $query = $this->userCartItemsQuery($userId)->orderBy('id', 'desc');

        if (method_exists(CartItem::class, 'product')) {
            $items = $query->with('product')->get();
        } else {
            $items = $query->get()->map(function ($item) {
                $item->setRelation('product', Product::find($item->product_id));
                return $item;
            });
        }

        $items = $items->filter(fn ($item) => $item->product !== null)->values();

        return response()->json([
            'success' => true,
            'data'    => $items,
        ], 200);
    }

    // API Thêm sản phẩm vào giỏ hàng (POST /api/cart/add)
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        try {
            $userId = Auth::id();
            $this->cartService->addToCart($userId, $request->product_id, $request->quantity);

            return response()->json([
                'message' => 'Đã thêm sản phẩm vào giỏ hàng thành công',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    // API Cập nhật số lượng sản phẩm trong giỏ (PUT /api/cart/{id})
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = $this->userCartItemsQuery(Auth::id())->find($id);

        if (!$cartItem) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm trong giỏ hàng',
            ], 404);
        }

        $product = Product::find($cartItem->product_id);

        if (!$product || $product->status !== 'active') {
            return response()->json([
                'message' => 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh',
            ], 422);
        }

        if ((int) $request->quantity > (int) $product->stock) {
            return response()->json([
                'message' => "Số lượng vượt quá tồn kho (chỉ còn {$product->stock} cuốn)",
            ], 422);
        }

        $cartItem->quantity = (int) $request->quantity;
        $cartItem->save();
        $cartItem->setRelation('product', $product);

        return response()->json([
            'message' => 'Cập nhật giỏ hàng thành công',
            'data'    => $cartItem,
        ], 200);
    }

    // API Xóa sản phẩm khỏi giỏ hàng (DELETE /api/cart/{id})
    public function destroy($id)
    {
        $cartItem = $this->userCartItemsQuery(Auth::id())->find($id);

        if (!$cartItem) {
            return response()->json([
                'message' => 'Không tìm thấy sản phẩm trong giỏ hàng',
            ], 404);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
        ], 200);
    }
}