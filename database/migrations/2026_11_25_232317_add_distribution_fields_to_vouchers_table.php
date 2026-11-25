<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            if (!Schema::hasColumn('vouchers', 'discount_type')) {
                $table->enum('discount_type', ['fixed', 'percent'])->default('fixed')->after('code');
            }
            if (!Schema::hasColumn('vouchers', 'max_discount')) {
                $table->decimal('max_discount', 12, 2)->default(0)->after('discount_amount');
            }
            if (!Schema::hasColumn('vouchers', 'usage_limit')) {
                $table->unsignedInteger('usage_limit')->default(0)->after('membership_tier'); // 0 = không giới hạn
            }
            if (!Schema::hasColumn('vouchers', 'used_count')) {
                $table->unsignedInteger('used_count')->default(0)->after('usage_limit');
            }
            if (!Schema::hasColumn('vouchers', 'target_tiers')) {
                // Lưu danh sách cấp bậc được chọn, VD: [4, 5] hoặc null
                $table->json('target_tiers')->nullable()->after('used_count');
            }
            if (!Schema::hasColumn('vouchers', 'distribution_mode')) {
                // 'all_eligible' | 'priority_high_tier' | 'random'
                $table->string('distribution_mode', 30)->default('all_eligible')->after('target_tiers');
            }
            if (!Schema::hasColumn('vouchers', 'is_exclusive')) {
                // true = chỉ những user được gán trong bảng user_vouchers mới được dùng
                $table->boolean('is_exclusive')->default(false)->after('distribution_mode');
            }
        });

        if (!Schema::hasTable('user_vouchers')) {
            Schema::create('user_vouchers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('voucher_id')->constrained('vouchers')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('assigned_at')->useCurrent();
                $table->timestamp('used_at')->nullable();
                $table->timestamps();

                $table->unique(['voucher_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_vouchers');
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type',
                'max_discount',
                'usage_limit',
                'used_count',
                'target_tiers',
                'distribution_mode',
                'is_exclusive',
            ]);
        });
    }
};