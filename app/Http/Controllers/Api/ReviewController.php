<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ReviewController extends Controller
{
    /**
     * Lấy thống kê & danh sách đánh giá theo sản phẩm (Public)
     */
    public function index(Request $request, $productId)
    {
        $baseQuery = Review::where('product_id', $productId);

        $totalReviews = (clone $baseQuery)->count();
        $averageRating = $totalReviews > 0
            ? round((float) (clone $baseQuery)->avg('rating'), 1)
            : 0;

        $ratingCounts = [
            5 => (clone $baseQuery)->where('rating', 5)->count(),
            4 => (clone $baseQuery)->where('rating', 4)->count(),
            3 => (clone $baseQuery)->where('rating', 3)->count(),
            2 => (clone $baseQuery)->where('rating', 2)->count(),
            1 => (clone $baseQuery)->where('rating', 1)->count(),
        ];

        $listQuery = Review::with('user:id,username,image_path')
            ->where('product_id', $productId)
            ->orderByDesc('created_at');

        $starFilter = (int) $request->query('rating', 0);
        if ($starFilter >= 1 && $starFilter <= 5) {
            $listQuery->where('rating', $starFilter);
        }

        $reviews = $listQuery->paginate(10);

        return response()->json([
            'stats' => [
                'average_rating' => $averageRating,
                'total_reviews'  => $totalReviews,
                'rating_counts'  => $ratingCounts,
            ],
            'reviews' => $reviews,
        ]);
    }

    /**
     * Gửi đánh giá sản phẩm theo từng đơn hàng đã giao hoặc đã hoàn thành (Auth)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'product_id'    => 'required|integer|exists:products,id',
            'order_id'      => 'required|integer',
            'order_item_id' => 'nullable|integer',
            'rating'        => 'required|integer|min:1|max:5',
            'comment'       => 'nullable|string|max:1000',
        ]);

        // 1. Xác minh đúng đơn hàng đó thuộc về user, đã giao/hoàn thành và có chứa sản phẩm này
        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->whereHas('items', function ($q) use ($validated) {
                $q->where('product_id', $validated['product_id']);
            })
            ->first();

        if (!$order) {
            return response()->json([
                'message' => 'Bạn chỉ có thể đánh giá sản phẩm thuộc đơn hàng đã giao hoặc đã hoàn thành.',
            ], 422);
        }

        // 2. Chỉ chặn nếu CHÍNH ĐƠN HÀNG NÀY đã đánh giá sản phẩm này rồi
        $alreadyReviewed = Review::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->where('order_id', $order->id)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi.',
            ], 422);
        }

        // 3. Tạo đánh giá gắn với order_id cụ thể
        $review = Review::create([
            'user_id'    => $user->id,
            'product_id' => $validated['product_id'],
            'order_id'   => $order->id,
            'rating'     => $validated['rating'],
            'comment'    => $validated['comment'] ?? null,
        ]);

        // 4. Đồng bộ lại điểm sao trung bình & tổng lượt đánh giá trên sản phẩm
        $avgRating = Review::where('product_id', $validated['product_id'])->avg('rating');
        $totalReviews = Review::where('product_id', $validated['product_id'])->count();

        $productUpdates = [];
        if (Schema::hasColumn('products', 'rating')) {
            $productUpdates['rating'] = round((float) $avgRating, 1);
        }
        if (Schema::hasColumn('products', 'reviews_count')) {
            $productUpdates['reviews_count'] = $totalReviews;
        }
        if (!empty($productUpdates)) {
            Product::where('id', $validated['product_id'])->update($productUpdates);
        }

        return response()->json([
            'message' => 'Đánh giá sản phẩm thành công!',
            'review'  => $review,
        ], 201);
    }
}