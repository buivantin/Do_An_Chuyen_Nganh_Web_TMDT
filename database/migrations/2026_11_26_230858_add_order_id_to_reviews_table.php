<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'order_id')) {
                $table->unsignedBigInteger('order_id')->nullable()->after('product_id');
                $table->index('order_id');
            }
        });

        // Tạo index riêng cho user_id trước để khóa ngoại không còn phụ thuộc vào index unique (user_id, product_id)
        $hasUserIdIndex = collect(DB::select("SHOW INDEX FROM reviews WHERE Key_name = 'reviews_user_id_index'"))->isNotEmpty();
        if (!$hasUserIdIndex) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->index('user_id', 'reviews_user_id_index');
            });
        }

        // Gỡ ràng buộc unique cũ (user_id, product_id)
        $indexes = DB::select("SHOW INDEX FROM reviews WHERE Non_unique = 0 AND Key_name != 'PRIMARY'");
        $indexNames = collect($indexes)->pluck('Key_name')->unique();

        Schema::table('reviews', function (Blueprint $table) use ($indexNames) {
            foreach ($indexNames as $name) {
                if (str_contains($name, 'user_id') && str_contains($name, 'product_id')) {
                    $table->dropUnique($name);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'order_id')) {
                $table->dropIndex(['order_id']);
                $table->dropColumn('order_id');
            }
        });
    }
};