<?php

use Illuminate\Http\Request;
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

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');

// Route trang chủ & danh mục (Của TV3 & TV4)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/home', [HomeController::class, 'index']);
Route::get('/products', [ProductController::class, 'search']); // Tìm kiếm sản phẩm
Route::get('/products/{id}', [ProductController::class, 'showPublic'])->whereNumber('id'); // Chi tiết sản phẩm

// --- AUTHENTICATED ROUTES (Bắt buộc đăng nhập - Dành cho Khách hàng & Admin) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', fn (Request $request) => $request->user());

    // TM-06: Đặt hàng (Của TV2)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

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

    // TM-14: Quản lý người dùng (Của TV1)
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    
    // CRUD Quản lý danh mục cho Admin (Của TV4)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // CRUD Quản lý sản phẩm (Của TV4)
    Route::apiResource('products', ProductController::class);

});