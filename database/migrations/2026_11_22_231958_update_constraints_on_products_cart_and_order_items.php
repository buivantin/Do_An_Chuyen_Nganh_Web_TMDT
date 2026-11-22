<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Chặn xóa danh mục đang có sản phẩm
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();
        });

        // 2. Chặn xóa sản phẩm đã nằm trong đơn hàng lịch sử
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->foreign('product_id')->references('id')->on('products')->restrictOnDelete();
        });

        // 3. Chống lưu trùng sản phẩm trong cùng một giỏ hàng
        Schema::table('cart_items', function (Blueprint $table) {
            $table->unique(['user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'product_id']);
        });
    }
};