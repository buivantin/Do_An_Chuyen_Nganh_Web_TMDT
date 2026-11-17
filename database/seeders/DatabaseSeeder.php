<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed 1 Admin & 10 Khách hàng
        DB::table('users')->insert([
            'username' => 'admin',
            'email' => 'admin@bookstore.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'created_at' => now(),
        ]);

        for ($i = 1; $i <= 10; $i++) {
            DB::table('users')->insert([
                'username' => "customer$i",
                'email' => "khachhang$i@gmail.com",
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'status' => 'active',
                'created_at' => now(),
            ]);
        }

        // 2 & 3. Seed 5 Danh mục kèm đúng 30 Đầu sách (tác giả + ảnh chuẩn)
        $catalog = [
            'Văn học' => [
                ['Nhà Giả Kim', 'Paulo Coelho', '/imgs/nha-gia-kim.jpg'],
                ['Hành Trình Về Phương Đông', 'Baird T. Spalding', '/imgs/hanh-trinh-ve-phuong-dong.jpg'],
                ['Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Nguyễn Nhật Ánh', '/imgs/toi-thay-hoa-vang-tren-co-xanh.jpg'],
                ['Mắt Biếc', 'Nguyễn Nhật Ánh', '/imgs/mat-biec.jpg'],
                ['Cây Cam Ngọt Của Tôi', 'José Mauro de Vasconcelos', '/imgs/cay-cam-ngot-cua-toi.jpg'],
                ['Lịch Sử Loài Người Sapiens', 'Yuval Noah Harari', '/imgs/lich-su-loai-nguoi-sapiens.jpg'],
            ],
            'Kinh tế & Quản lý' => [
                ['Cha Giàu Cha Nghèo', 'Robert T. Kiyosaki', '/imgs/cha-giau-cha-ngheo.jpg'],
                ['Khởi Nghiệp Tinh Gọn', 'Eric Ries', '/imgs/khoi-nghiep-tinh-gon.jpg'],
                ['Kinh Tế Học Hài Hước', 'Steven D. Levitt', '/imgs/kinh-te-hoc-hai-huoc.jpg'],
                ['Quản Trị Nhân Sự 4.0', 'Dave Ulrich', '/imgs/quan-ly-nhan-su-4.0.jpg'],
            ],
            'Kỹ năng sống' => [
                ['Đắc Nhân Tâm', 'Dale Carnegie', '/imgs/dac-nhan-tam.jpg'],
                ['Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Rosie Nguyễn', '/imgs/tuoi-tre-dang-gia-bao-nhieu.jpg'],
                ['Tư Duy Nhanh Và Chậm', 'Daniel Kahneman', '/imgs/tu-duy-nhanh-va-cham.jpg'],
                ['Đọc Vị Bất Kỳ Ai', 'David J. Lieberman', '/imgs/doc-vi-bat-ky-ai.jpg'],
                ['Sức Mạnh Của Hiện Tại', 'Eckhart Tolle', '/imgs/suc-manh-cua-hien-tai.jpg'],
                ['Đánh Thức Con Người Phi Thường Trong Bạn', 'Anthony Robbins', '/imgs/danh-thuc-con-nguoi-phi-thuong.jpg'],
                ['Thuật Quản Lý Thời Gian', 'Brian Tracy', '/imgs/thuat-quan-ly-thoi-gian.jpg'],
                ['Tâm Lý Học Đám Đông', 'Gustave Le Bon', '/imgs/tam-ly-hoc-dam-dong.jpg'],
                ['Chiến Thắng Con Quỷ Trong Bạn', 'Napoleon Hill', '/imgs/chien-thang-con-quy-trong-ban.jpg'],
            ],
            'Công nghệ thông tin' => [
                ['Tối Ưu Hóa CSDL Với MySQL', 'Baron Schwartz', '/imgs/toi-uu-hoa-csdl.jpg'],
                ['Lập Trình Web Với Laravel', 'Matt Stauffer', '/imgs/lap-trinh-web-voi-laravel.jpg'],
                ['Cấu Trúc Dữ Liệu Và Giải Thuật', 'Lê Minh Hoàng', '/imgs/cau-truc-du-lieu-giai-thuat.jpg'],
                ['Clean Code Trong Thực Tế', 'Robert C. Martin', '/imgs/clean-code-trong-thuc-te.jpg'],
                ['Vũ Trụ Trong Vỏ Hạt Dẻ', 'Stephen Hawking', '/imgs/vu-tru-trong-vo-hat-de.jpg'],
                ['Khai Phá Dữ Liệu Lớn', 'Foster Provost', '/imgs/khai-pha-du-lieu-lon.jpg'],
                ['Thiết Kế Hệ Thống Phân Tán', 'Martin Kleppmann', '/imgs/thiet-ke-he-thong-phan-tan.jpg'],
            ],
            'Sách thiếu nhi' => [
                ['Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', '/imgs/de-men-phieu-luu-ky.jpg'],
                ['Búp Sen Xanh', 'Sơn Tùng', '/imgs/bup-sen-xanh.jpg'],
                ['Hoàng Tử Bé', 'Antoine de Saint-Exupéry', '/imgs/hoang-tu-be.jpg'],
                ['Chuyện Con Mèo Dạy Hải Âu Bay', 'Luis Sepúlveda', '/imgs/chuyen-con-meo-day-hai-au-bay.jpg'],
            ],
        ];

        foreach ($catalog as $categoryName => $books) {
            $categoryId = DB::table('categories')->insertGetId([
                'name' => $categoryName,
                'description' => "Các đầu sách thuộc thể loại $categoryName",
                'status' => 'active',
            ]);

            foreach ($books as [$name, $author, $image]) {
                DB::table('products')->insert([
                    'name' => $name,
                    'author' => $author,
                    'description' => "Cuốn sách {$name} mang lại nhiều giá trị tri thức và cảm xúc cho người đọc.",
                    'status' => 'active',
                    'price' => rand(50, 350) * 1000,
                    'category_id' => $categoryId,
                    'image' => $image,
                    'stock' => rand(10, 100),
                ]);
            }
        }

        // 4. Seed 10 Đơn hàng mẫu nhiều trạng thái
        $statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        for ($i = 1; $i <= 10; $i++) {
            $orderId = DB::table('orders')->insertGetId([
                'status' => $statuses[array_rand($statuses)],
                'address' => "$i Đường Nguyễn Huệ, Quận 1, TP.HCM",
                'payment_method' => $i % 2 == 0 ? 'COD' : 'VNPAY',
                'total_amount' => 0,
                'user_id' => rand(2, 11),
                'created_at' => now(),
            ]);

            // Mỗi đơn hàng có 1-3 sản phẩm
            $total = 0;
            $itemCount = rand(1, 3);
            for ($j = 0; $j < $itemCount; $j++) {
                $productId = rand(1, 30);
                $price = rand(60, 200) * 1000;
                $qty = rand(1, 2);
                $total += $price * $qty;

                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $productId,
                    'price' => $price, // Giá snapshot tại thời điểm mua
                    'quantity' => $qty,
                ]);
            }

            // Cập nhật lại tổng tiền đơn hàng
            DB::table('orders')->where('id', $orderId)->update(['total_amount' => $total]);
        }
    }
}