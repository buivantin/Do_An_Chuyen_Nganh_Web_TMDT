<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\Admin\UserController; // Thêm import này

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');

// --- AUTHENTICATED ROUTES (Bắt buộc đăng nhập) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', fn (Request $request) => $request->user());
});

// --- ADMIN ROUTES (Bắt buộc đăng nhập VÀ phải là Admin) ---
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    
    // Route test (có thể giữ hoặc xóa)
    Route::get('/', fn () => response()->json(['message' => 'Chào mừng Admin']));

    // TM-14: Quản lý người dùng (Đã đưa vào đúng nhóm bảo mật)
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    
});