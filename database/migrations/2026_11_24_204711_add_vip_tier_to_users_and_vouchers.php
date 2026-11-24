<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('total_spent', 12, 2)->default(0)->after('address');
            $table->unsignedTinyInteger('membership_tier')->default(1)->after('total_spent'); // 1: Mầm Sách -> 5: Đại Sứ Tri Thức
        });

        Schema::table('vouchers', function (Blueprint $table) {
            $table->decimal('min_order_value', 12, 2)->default(0)->after('discount_amount');
            $table->decimal('min_spent', 12, 2)->default(0)->after('min_order_value');
            $table->unsignedTinyInteger('membership_tier')->nullable()->after('min_spent'); // null = mọi khách | 1..5: từ cấp tương ứng trở lên
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['total_spent', 'membership_tier']);
        });

        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropColumn(['min_order_value', 'min_spent', 'membership_tier']);
        });
    }
};