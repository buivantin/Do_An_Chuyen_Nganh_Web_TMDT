<?php

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Auth\RegisterController;   

Route::get('/register', [RegisterController::class, 'showForm'])->name('register');
Route::post('/register', [RegisterController::class, 'store']);

Route::get('/db-check', function () {
    try {
        DB::connection()->getPdo();
        return 'Kết nối CSDL thành công: ' . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Kết nối thất bại: ' . $e->getMessage();
    }
});