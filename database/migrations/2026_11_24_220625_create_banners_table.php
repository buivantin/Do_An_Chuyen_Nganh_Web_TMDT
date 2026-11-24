<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('badge_text')->nullable();         // Nhãn bên trái: "TUYỂN CHỌN THÁNG 11"
            $table->string('title');                          // Tiêu đề lớn: "Mỗi trang sách mở ra một chân trời mới"
            $table->text('description')->nullable();          // Mô tả ngắn hoặc câu nói nổi tiếng
            $table->string('image');                          // Ảnh nền bên phải
            $table->string('promo_label')->nullable();        // Nhãn trên thẻ sách: "SÁCH CỦA TUẦN · GIẢM 20%"
            $table->foreignId('product_id')                   // Sách nổi bật: "Nhà Giả Kim"
                  ->nullable()
                  ->constrained('products')
                  ->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);// Thứ tự hiển thị
            $table->string('status')->default('active');      // active | inactive
            $table->timestamps();

            $table->index(['status', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};