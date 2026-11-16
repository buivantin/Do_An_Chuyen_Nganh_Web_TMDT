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

        // 2. Seed 5 Danh mục sách
        $categories = ['Văn học', 'Kinh tế & Quản lý', 'Kỹ năng sống', 'Công nghệ thông tin', 'Sách thiếu nhi'];
        foreach ($categories as $cat) {
            DB::table('categories')->insert([
                'name' => $cat,
                'description' => "Các đầu sách thuộc thể loại $cat",
                'status' => 'active',
            ]);
        }

        // 3. Seed 30 Đầu sách tiếng Việt kèm tác giả và đường dẫn ảnh chính xác
        $books = [
            'Đắc Nhân Tâm', 'Nhà Giả Kim', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Hành Trình Về Phương Đông', 'Tối Ưu Hóa CSDL Với MySQL',
            'Lập Trình Web Với Laravel', 'Cấu Trúc Dữ Liệu Và Giải Thuật', 'Cha Giàu Cha Nghèo', 'Khởi Nghiệp Tinh Gọn', 'Tư Duy Nhanh Và Chậm',
            'Dế Mèn Phiêu Lưu Ký', 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Mắt Biếc', 'Cây Cam Ngọt Của Tôi', 'Đọc Vị Bất Kỳ Ai',
            'Sức Mạnh Của Hiện Tại', 'Đánh Thức Con Người Phi Thường Trong Bạn', 'Kinh Tế Học Hài Hước', 'Quản Trị Nhân Sự 4.0', 'Clean Code Trong Thực Tế',
            'Lịch Sử Loài Người Sapiens', 'Vũ Trụ Trong Vỏ Hạt Dẻ', 'Thuật Quản Lý Thời Gian', 'Tâm Lý Học Đám Đông', 'Chiến Thắng Con Quỷ Trong Bạn',
            'Khai Phá Dữ Liệu Lớn', 'Thiết Kế Hệ Thống Phân Tán', 'Búp Sen Xanh', 'Hoàng Tử Bé', 'Chuyện Con Mèo Dạy Hải Âu Bay'
        ];

        $authors = [
            'Dale Carnegie', 'Paulo Coelho', 'Rosie Nguyễn', 'Baird T. Spalding', 'Baron Schwartz',
            'Matt Stauffer', 'Lê Minh Hoàng', 'Robert T. Kiyosaki', 'Eric Ries', 'Daniel Kahneman',
            'Tô Hoài', 'Nguyễn Nhật Ánh', 'Nguyễn Nhật Ánh', 'José Mauro de Vasconcelos', 'David J. Lieberman',
            'Eckhart Tolle', 'Anthony Robbins', 'Steven D. Levitt', 'Dave Ulrich', 'Robert C. Martin',
            'Yuval Noah Harari', 'Stephen Hawking', 'Brian Tracy', 'Gustave Le Bon', 'Napoleon Hill',
            'Foster Provost', 'Martin Kleppmann', 'Sơn Tùng', 'Antoine de Saint-Exupéry', 'Luis Sepúlveda'
        ];

        $images = [
            '/imgs/dac-nhan-tam.jpg', '/imgs/nha-gia-kim.jpg', '/imgs/tuoi-tre-dang-gia-bao-nhieu.jpg', '/imgs/hanh-trinh-ve-phuong-dong.jpg', '/imgs/toi-uu-hoa-csdl-voi-mysql.jpg',
            '/imgs/lap-trinh-web-voi-laravel.jpg', '/imgs/cau-truc-du-lieu-va-giai-thuat.jpg', '/imgs/cha-giau-cha-ngheo.jpg', '/imgs/khoi-nghiep-tinh-gon.jpg', '/imgs/tu-duy-nhanh-va-cham.jpg',
            '/imgs/de-men-phieu-luu-ky.jpg', '/imgs/toi-thay-hoa-vang-tren-co-xanh.jpg', '/imgs/mat-biec.jpg', '/imgs/cay-cam-ngot-cua-toi.jpg', '/imgs/doc-vi-bat-ky-ai.jpg',
            '/imgs/suc-manh-cua-hien-tai.jpg', '/imgs/danh-thuc-con-nguoi-phi-thuong-trong-ban.jpg', '/imgs/kinh-te-hoc-hai-huoc.jpg', '/imgs/quan-tri-nhan-su-40.jpg', '/imgs/clean-code-trong-thuc-te.jpg',
            '/imgs/lich-su-loai-nguoi-sapiens.jpg', '/imgs/vu-tru-trong-vo-hat-de.jpg', '/imgs/thuat-quan-ly-thoi-gian.jpg', '/imgs/tam-ly-hoc-dam-dong.jpg', '/imgs/chien-thang-con-quy-trong-ban.jpg',
            '/imgs/khai-pha-du-lieu-lon.jpg', '/imgs/thiet-ke-he-thong-phan-tan.jpg', '/imgs/bup-sen-xanh.jpg', '/imgs/hoang-tu-be.jpg', '/imgs/chuyen-con-meo-day-hai-au-bay.jpg'
        ];


        for ($i = 0; $i < 30; $i++) {
            DB::table('products')->insert([
                'name' => $books[$i],
                'author' => $authors[$i],
                'description' => "Cuốn sách {$books[$i]} mang lại nhiều giá trị tri thức và cảm xúc cho người đọc.",
                'status' => 'active',
                'price' => rand(50, 350) * 1000,
                'category_id' => rand(1, 5),
                'image' => $images[$i],
                'stock' => rand(10, 100),
            ]);
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