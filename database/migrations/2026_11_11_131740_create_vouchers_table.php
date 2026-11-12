<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // Mã giảm giá duy nhất
            $table->decimal('discount_amount', 12, 2);
            $table->string('status')->default('active');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('expiration_date')->nullable();
            $table->string('requirement')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
