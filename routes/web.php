<?php

use Illuminate\Support\Facades\DB;

Route::get('/db-check', function () {
    try {
        DB::connection()->getPdo();
        return 'Kết nối CSDL thành công: ' . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Kết nối thất bại: ' . $e->getMessage();
    }
});