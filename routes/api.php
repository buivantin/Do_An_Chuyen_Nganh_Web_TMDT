<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;

// Controllers
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\Admin\UserController; 
use App\Http\Controllers\Api\CartController;       
use App\Http\Controllers\Api\ProfileController; 
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\AdminProductController;

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);

// Route trang chủ & danh mục (Của TV3 & TV4)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/home', [HomeController::class, 'index']);
Route::get('/products', [ProductController::class, 'search']); // Tìm kiếm sản phẩm
Route::get('/products/{id}', [ProductController::class, 'showPublic'])->whereNumber('id'); // Chi tiết sản phẩm

// --- AUTHENTICATED ROUTES (Bắt buộc đăng nhập - Dành cho Khách hàng & Admin) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', fn (Request $request) =>$request->user());

    // TM-06: Đặt hàng (Của TV2)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    
    // TM-07: Khách hàng hủy đơn (Của bạn)
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Đánh giá sản phẩm (Của TV4)
    Route::post('/reviews', [ReviewController::class, 'store']);

    // TM-05: Giỏ hàng (Của TV5)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);

    // TM-08: Hồ sơ cá nhân (Của TV1)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/change-password', [ProfileController::class, 'changePassword']);
    
    // Route Upload ảnh đại diện 
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
});

// --- ADMIN ROUTES (Bắt buộc đăng nhập VÀ phải là Admin) ---
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    
    Route::get('/', fn () => response()->json(['message' => 'Chào mừng Admin']));

    // Thống kê Dashboard & Quản lý đánh giá (Của TV4)
    Route::get('/dashboard', function (Request $request) {
        $startDate =$request->query('start_date');
        $endDate =$request->query('end_date');

        $productsQuery = DB::table('products')
            ->when($startDate && $endDate, function ($query) use ($startDate,$endDate) {
                $query->whereDate('created_at', '>=',$startDate)
                      ->whereDate('created_at', '<=', $endDate);
            });

        $booksSummary = [
            'total' => (clone $productsQuery)->count(),
            'low_stock' => (clone $productsQuery)->where('stock', 1)->count(),
            'out_of_stock' => (clone $productsQuery)->where('stock', 0)->count(),
        ];

        $orders = DB::table('orders')
            ->when($startDate && $endDate, function ($query) use ($startDate,$endDate) {
                $query->whereDate('created_at', '>=',$startDate)
                      ->whereDate('created_at', '<=', $endDate);
            })
            ->select(
                'id',
                'receiver_name as receiver',
                'phone',
                'payment_method as method',
                'total_amount as total',
                'status',
                DB::raw('DATE(created_at) as created_at')
            )
            ->orderByDesc('created_at')
            ->get();

        $revenues = DB::table('orders')
            ->where('status', 'completed')
            ->when($startDate && $endDate, function ($query) use ($startDate,$endDate) {
                $query->whereDate('created_at', '>=',$startDate)
                      ->whereDate('created_at', '<=', $endDate);
            })
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'completed')
            ->when($startDate && $endDate, function ($query) use ($startDate,$endDate) {
                $query->whereDate('orders.created_at', '>=',$startDate)
                      ->whereDate('orders.created_at', '<=', $endDate);
            })
            ->select(
                'products.id',
                'products.name',
                'products.author',
                'products.price',
                'products.stock',
                DB::raw('SUM(order_items.quantity) as sold')
            )
            ->groupBy('products.id', 'products.name', 'products.author', 'products.price', 'products.stock')
            ->orderByDesc('sold')
            ->limit(5)
            ->get()
            ->values()
            ->map(function ($item,$index) {
                $item->rank =$index + 1;
                return $item;
            });

        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->join('products', 'reviews.product_id', '=', 'products.id')
            ->when($startDate && $endDate, function ($query) use ($startDate,$endDate) {
                $query->whereDate('reviews.created_at', '>=',$startDate)
                      ->whereDate('reviews.created_at', '<=', $endDate);
            })
            ->select(
                'reviews.id',
                'users.username as customer',
                'products.name as book',
                'reviews.rating',
                'reviews.comment',
                'reviews.status',
                DB::raw("DATE_FORMAT(reviews.created_at, '%d/%m/%Y %H:%i') as created_at")
            )
            ->orderByDesc('reviews.created_at')
            ->get();

        return response()->json([
            'books_summary' => $booksSummary,
            'orders' => $orders,
            'revenues' => $revenues,
            'top_products' => $topProducts,
            'reviews' => $reviews,
        ]);
    });

    Route::patch('/reviews/{id}/toggle', function ($id) {
        $review = DB::table('reviews')->where('id',$id)->first();
        if (!$review) {
            return response()->json(['message' => 'Không tìm thấy đánh giá'], 404);
        }

        $newStatus =$review->status === 'visible' ? 'hidden' : 'visible';
        DB::table('reviews')->where('id', $id)->update([
            'status' => $newStatus,
            'updated_at' => now(),
        ]);

        return response()->json(['status' => $newStatus]);
    });

    Route::delete('/reviews/{id}', function ($id) {
        DB::table('reviews')->where('id', $id)->delete();
        return response()->json(['message' => 'Đã xóa đánh giá']);
    });

    // TM-14: Quản lý người dùng (Của TV1)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    // CRUD Quản lý danh mục cho Admin (Của TV4)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // TM-12: Quản lý sản phẩm (Admin)
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{id}', [AdminProductController::class, 'show']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::put('/products/{id}/toggle-status', [AdminProductController::class, 'toggleStatus']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    
    // CRUD Quản lý sản phẩm (Của TV4)
    //  

    

    // TM-13: Quản lý đơn hàng (Của TV5)
    // 1. Route đếm số lượng đơn chờ (Dành cho Chuông thông báo)
    Route::get('/orders/pending-count', [OrderController::class, 'getPendingCount']); 
    
    // 2. Route lấy danh sách và cập nhật trạng thái
    Route::get('/orders', [OrderController::class, 'adminIndex']); 
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']); 
});