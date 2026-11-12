<?php

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;

Route::get('/register', [RegisterController::class, 'showForm'])->name('register');
Route::post('/register', [RegisterController::class, 'store']);
Route::get('/login', [LoginController::class, 'showForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
Route::get('/', fn () => 'Trang admin'); // tạm, sau thay bằng controller admin
});
Route::get('/', fn () => view('welcome'));

Route::get('/db-check', function () {
    try {
        DB::connection()->getPdo();
        return 'Kết nối CSDL thành công: ' . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Kết nối thất bại: ' . $e->getMessage();
    }
});
Route::get('/', function () {
    return view('welcome'); 
});