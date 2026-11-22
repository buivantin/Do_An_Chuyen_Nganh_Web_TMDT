<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Lấy danh sách đánh giá hiển thị (status = visible) & thống kê sao của 1 sản phẩm.
     */
    public function index(Request $request, int $productId): JsonResponse
    {
        $baseQuery = Review::visible()->where('product_id', $productId);

        $totalReviews = (clone $baseQuery)->count();
        $averageRating = $totalReviews > 0
            ? round((float) (clone $baseQuery)->avg('rating'), 1)
            : 0;

        $rawCounts = (clone $baseQuery)
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $ratingCounts = [];
        for ($star = 5; $star >= 1; $star--) {
            $ratingCounts[(string) $star] = (int) ($rawCounts[$star] ?? 0);
        }

        $listQuery = Review::with('user')
            ->visible()
            ->where('product_id', $productId)
            ->latest();

        $filterRating = (int) $request->query('rating', 0);
        if ($filterRating >= 1 && $filterRating <= 5) {
            $listQuery->where('rating', $filterRating);
        }

        $paginated = $listQuery->paginate(10);

        $paginated->getCollection()->transform(function (Review $review) {
            return [
                'id'         => $review->id,
                'rating'     => $review->rating,
                'comment'    => $review->comment,
                'created_at' => $review->created_at,
                'user'       => [
                    'id'         => $review->user?->id,
                    'username'   => $review->user?->username ?? $review->user?->name ?? 'Độc giả Mọt Sách',
                    'image_path' => $review->user?->image_path ?? null,
                ],
            ];
        });

        return response()->json([
            'stats' => [
                'average_rating' => $averageRating,
                'total_reviews'  => $totalReviews,
                'rating_counts'  => $ratingCounts,
            ],
            'reviews' => $paginated,
        ]);
    }

    /**
     * Lưu đánh giá mới từ khách hàng đã mua hàng thành công (order status = completed).
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $validated = $request->validated();
        $productId = (int) $validated['product_id'];

        $hasCompletedOrder = Order::where('user_id', $userId)
            ->where('status', 'completed')
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->exists();

        if (!$hasCompletedOrder) {
            return response()->json([
                'message' => 'Bạn chỉ có thể đánh giá sản phẩm thuộc đơn hàng đã hoàn thành.',
            ], 403);
        }

        $alreadyReviewed = Review::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'Bạn đã đánh giá đầu sách này trước đó.',
            ], 422);
        }

        $review = Review::create([
            'user_id'    => $userId,
            'product_id' => $productId,
            'rating'     => (int) $validated['rating'],
            'comment'    => isset($validated['comment']) && trim($validated['comment']) !== ''
                ? trim($validated['comment'])
                : null,
            'status'     => 'visible',
        ]);

        return response()->json([
            'message' => 'Cảm ơn bạn đã gửi đánh giá cho cuốn sách!',
            'review'  => [
                'id'         => $review->id,
                'product_id' => $review->product_id,
                'rating'     => $review->rating,
                'comment'    => $review->comment,
                'created_at' => $review->created_at,
            ],
        ], 201);
    }
}