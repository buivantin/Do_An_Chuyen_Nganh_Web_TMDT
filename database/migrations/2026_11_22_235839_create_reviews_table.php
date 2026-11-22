<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->restrictOnDelete();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->restrictOnDelete();
            $table->unsignedTinyInteger('rating'); // Số sao từ 1 đến 5
            $table->text('comment')->nullable();   // Nội dung nhận xét
            $table->enum('status', ['visible', 'hidden'])->default('visible');
            $table->timestamps();

            // Mỗi khách hàng chỉ được đánh giá 1 lần trên mỗi đầu sách (chống spam)
            $table->unique(['user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};