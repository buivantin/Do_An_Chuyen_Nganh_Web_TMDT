<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/{any?}', fn () => view('welcome'))->where('any', '^(?!api).*$');

Route::get('/db-check', function () {
    try {
        DB::connection()->getPdo();
        return 'Kết nối CSDL thành công: ' . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Kết nối thất bại: ' . $e->getMessage();
    }
});