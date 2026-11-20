<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\OrderController;

// Controllers
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
<<<<<<< Updated upstream
use App\Http\Controllers\Api\Admin\UserController; 
use App\Http\Controllers\Api\CartController;      
=======
use App\Http\Controllers\ProductController;
>>>>>>> Stashed changes

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');

// Route trang chủ & danh mục (Của TV3 & TV4)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/home', [HomeController::class, 'index']);

// --- AUTHENTICATED ROUTES (Bắt buộc đăng nhập) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', fn (Request $request) => $request->user());

    // TM-06: Đặt hàng
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
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

<<<<<<< Updated upstream
=======
    // CRUD Quản lý sản phẩm cho Admin (/api/admin/products)
    Route::apiResource('products', ProductController::class);
>>>>>>> Stashed changes
});