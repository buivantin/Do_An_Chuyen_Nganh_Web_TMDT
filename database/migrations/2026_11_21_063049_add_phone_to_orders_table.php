<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Đặt ngay sau cột address để dễ quản lý thông tin giao hàng
            // Dùng nullable() để không làm lỗi các Seeder cũ chưa truyền cột phone
            $table->string('phone', 20)->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }
};