<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'shipping_provider')) {
                $table->string('shipping_provider')->nullable()->after('note');
            }
            if (!Schema::hasColumn('orders', 'tracking_code')) {
                $table->string('tracking_code')->nullable()->after('shipping_provider');
            }
            if (!Schema::hasColumn('orders', 'shipper_info')) {
                $table->string('shipper_info')->nullable()->after('tracking_code');
            }
            if (!Schema::hasColumn('orders', 'delivery_note')) {
                $table->text('delivery_note')->nullable()->after('shipper_info');
            }
            if (!Schema::hasColumn('orders', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('delivery_note');
            }
            if (!Schema::hasColumn('orders', 'return_type')) {
                $table->string('return_type', 30)->nullable()->after('completed_at'); // refund | exchange
            }
            if (!Schema::hasColumn('orders', 'return_reason')) {
                $table->text('return_reason')->nullable()->after('return_type');
            }
            if (!Schema::hasColumn('orders', 'return_images')) {
                $table->json('return_images')->nullable()->after('return_reason');
            }
            if (!Schema::hasColumn('orders', 'return_requested_at')) {
                $table->timestamp('return_requested_at')->nullable()->after('return_images');
            }
            if (!Schema::hasColumn('orders', 'admin_return_note')) {
                $table->text('admin_return_note')->nullable()->after('return_requested_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $cols = array_filter([
                'shipping_provider',
                'tracking_code',
                'shipper_info',
                'delivery_note',
                'completed_at',
                'return_type',
                'return_reason',
                'return_images',
                'return_requested_at',
                'admin_return_note',
            ], fn ($col) => Schema::hasColumn('orders', $col));

            if ($cols) {
                $table->dropColumn($cols);
            }
        });
    }
};