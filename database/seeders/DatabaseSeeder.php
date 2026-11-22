<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // 1. Seed 1 Admin & 10 Khách hàng (customer10 bị khóa tài khoản)
        $userAddresses = [
            '120 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
            '45 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội',
            '88 Trần Phú, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng',
            '215 Cách Mạng Tháng 8, Phường 4, Quận 3, TP.HCM',
            '19 Phan Đình Phùng, Phường Quán Thánh, Quận Ba Đình, Hà Nội',
            '302 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM',
            '74 Nguyễn Văn Linh, Phường Hưng Lợi, Quận Ninh Kiều, Cần Thơ',
            '56 Lý Thường Kiệt, Phường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
            '142 Hoàng Diệu, Phường Bình Thuận, Quận Hải Châu, Đà Nẵng',
            '95 Phan Xích Long, Phường 2, Quận Phú Nhuận, TP.HCM',
        ];

        DB::table('users')->insert([
            'username' => 'admin',
            'email' => 'admin@bookstore.com',
            'phone' => '0901000000',
            'address' => '01 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'created_at' => $now->copy()->subMonths(6),
            'updated_at' => $now->copy()->subMonths(6),
        ]);

        for ($i = 1; $i <= 10; $i++) {
            $userCreated = $now->copy()->subDays(rand(30, 150));

            DB::table('users')->insert([
                'username' => "customer$i",
                'email' => "khachhang$i@gmail.com",
                'phone' => '09010000' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'address' => $userAddresses[$i - 1],
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'status' => $i === 10 ? 'inactive' : 'active',
                'created_at' => $userCreated,
                'updated_at' => $userCreated,
            ]);
        }

        // 2 & 3. Seed 5 Danh mục kèm đúng 100 Đầu sách (sách 1 còn 1 cuốn, sách 2 hết hàng = 0)
        $catalog = [
            'Văn học' => [
                ['Nhà Giả Kim', 'Paulo Coelho', '/imgs/nha-gia-kim.jpg'],
                ['Hành Trình Về Phương Đông', 'Baird T. Spalding', '/imgs/hanh-trinh-ve-phuong-dong.jpg'],
                ['Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Nguyễn Nhật Ánh', '/imgs/toi-thay-hoa-vang-tren-co-xanh.jpg'],
                ['Mắt Biếc', 'Nguyễn Nhật Ánh', '/imgs/mat-biec.jpg'],
                ['Cây Cam Ngọt Của Tôi', 'José Mauro de Vasconcelos', '/imgs/cay-cam-ngot-cua-toi.jpg'],
                ['Lịch Sử Loài Người Sapiens', 'Yuval Noah Harari', '/imgs/lich-su-loai-nguoi-sapiens.jpg'],
                ['Rừng Na Uy', 'Haruki Murakami', '/imgs/rung-na-uy.jpg'],
                ['Kafka Bên Bờ Biển', 'Haruki Murakami', '/imgs/kafka-ben-bo-bien.jpg'],
                ['Trăm Năm Cô Đơn', 'Gabriel García Márquez', '/imgs/tram-nam-co-don.jpg'],
                ['Bố Già', 'Mario Puzo', '/imgs/bo-gia.jpg'],
                ['Cuốn Theo Chiều Gió', 'Margaret Mitchell', '/imgs/cuon-theo-chieu-gio.jpg'],
                ['Kiêu Hãnh Và Định Kiến', 'Jane Austen', '/imgs/kieu-hanh-va-dinh-kien.jpg'],
                ['Ông Già Và Biển Cả', 'Ernest Hemingway', '/imgs/ong-gia-va-bien-ca.jpg'],
                ['Hai Số Phận', 'Jeffrey Archer', '/imgs/hai-so-phan.jpg'],
                ['Bắt Trẻ Đồng Xanh', 'J.D. Salinger', '/imgs/bat-tre-dong-xanh.jpg'],
                ['Người Đua Diều', 'Khaled Hosseini', '/imgs/nguoi-dua-dieu.jpg'],
                ['Ngàn Mặt Trời Rực Rỡ', 'Khaled Hosseini', '/imgs/ngan-mat-troi-ruc-ro.jpg'],
                ['Tội Ác Và Hình Phạt', 'Fyodor Dostoevsky', '/imgs/toi-ac-va-hinh-phat.jpg'],
                ['1984', 'George Orwell', '/imgs/1984.jpg'],
                ['Trại Súc Vật', 'George Orwell', '/imgs/trai-suc-vat.jpg'],
            ],
            'Kinh tế & Quản lý' => [
                ['Cha Giàu Cha Nghèo', 'Robert T. Kiyosaki', '/imgs/cha-giau-cha-ngheo.jpg'],
                ['Khởi Nghiệp Tinh Gọn', 'Eric Ries', '/imgs/khoi-nghiep-tinh-gon.jpg'],
                ['Kinh Tế Học Hài Hước', 'Steven D. Levitt', '/imgs/kinh-te-hoc-hai-huoc.jpg'],
                ['Quản Trị Nhân Sự 4.0', 'Dave Ulrich', '/imgs/quan-tri-nhan-su-40.jpg'],
                ['Từ Tốt Đến Vĩ Đại', 'Jim Collins', '/imgs/tu-tot-den-vi-dai.jpg'],
                ['Xây Dựng Để Trường Tồn', 'Jim Collins & Jerry I. Porras', '/imgs/xay-dung-de-truong-ton.jpg'],
                ['Không Đến Một (Zero to One)', 'Peter Thiel', '/imgs/khong-den-mot.jpg'],
                ['Chiến Lược Đại Dương Xanh', 'W. Chan Kim & Renée Mauborgne', '/imgs/chien-luoc-dai-duong-xanh.jpg'],
                ['Nhà Đầu Tư Thông Minh', 'Benjamin Graham', '/imgs/nha-dau-tu-thong-minh.jpg'],
                ['Tâm Lý Học Về Tiền', 'Morgan Housel', '/imgs/tam-ly-hoc-ve-tien.jpg'],
                ['Người Giàu Có Nhất Thành Babylon', 'George S. Clason', '/imgs/nguoi-giau-co-nhat-thanh-babylon.jpg'],
                ['Bí Mật Tư Duy Triệu Phú', 'T. Harv Eker', '/imgs/bi-mat-tu-duy-trieu-phu.jpg'],
                ['Tuần Làm Việc 4 Giờ', 'Timothy Ferriss', '/imgs/tuan-lam-viec-4-gio.jpg'],
                ['Những Kẻ Xuất Chúng', 'Malcolm Gladwell', '/imgs/nhung-ke-xuat-chung.jpg'],
                ['Điểm Bùng Phát', 'Malcolm Gladwell', '/imgs/diem-bung-phat.jpg'],
                ['Tỷ Phú Bán Giày', 'Tony Hsieh', '/imgs/ty-phu-ban-giay.jpg'],
                ['Quốc Gia Khởi Nghiệp', 'Dan Senor & Saul Singer', '/imgs/quoc-gia-khoi-nghiep.jpg'],
                ['Nguyên Lý Marketing', 'Philip Kotler', '/imgs/nguyen-ly-marketing.jpg'],
            ],
            'Kỹ năng sống' => [
                ['Đắc Nhân Tâm', 'Dale Carnegie', '/imgs/dac-nhan-tam.jpg'],
                ['Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Rosie Nguyễn', '/imgs/tuoi-tre-dang-gia-bao-nhieu.jpg'],
                ['Tư Duy Nhanh Và Chậm', 'Daniel Kahneman', '/imgs/tu-duy-nhanh-va-cham.jpg'],
                ['Đọc Vị Bất Kỳ Ai', 'David J. Lieberman', '/imgs/doc-vi-bat-ky-ai.jpg'],
                ['Sức Mạnh Của Hiện Tại', 'Eckhart Tolle', '/imgs/suc-manh-cua-hien-tai.jpg'],
                ['Đánh Thức Con Người Phi Thường Trong Bạn', 'Anthony Robbins', '/imgs/danh-thuc-con-nguoi-phi-thuong-trong-ban.jpg'],
                ['Thuật Quản Lý Thời Gian', 'Brian Tracy', '/imgs/thuat-quan-ly-thoi-gian.jpg'],
                ['Tâm Lý Học Đám Đông', 'Gustave Le Bon', '/imgs/tam-ly-hoc-dam-dong.jpg'],
                ['Chiến Thắng Con Quỷ Trong Bạn', 'Napoleon Hill', '/imgs/chien-thang-con-quy-trong-ban.jpg'],
                ['Thay Đổi Tí Hon Hiệu Quả Bất Ngờ (Atomic Habits)', 'James Clear', '/imgs/atomic-habits.jpg'],
                ['7 Thói Quen Hiệu Quả', 'Stephen R. Covey', '/imgs/7-thoi-quen-hieu-qua.jpg'],
                ['Làm Ra Làm Chơi Ra Chơi (Deep Work)', 'Cal Newport', '/imgs/deep-work.jpg'],
                ['Nghệ Thuật Tinh Tế Của Việc Đếch Quan Tâm', 'Mark Manson', '/imgs/nghe-thuat-tinh-te-cua-viec-dech-quan-tam.jpg'],
                ['Đi Tìm Lẽ Sống', 'Viktor E. Frankl', '/imgs/di-tim-le-song.jpg'],
                ['Nghĩ Giàu Và Làm Giàu', 'Napoleon Hill', '/imgs/nghi-giau-va-lam-giau.jpg'],
                ['Quẳng Gánh Lo Đi Và Vui Sống', 'Dale Carnegie', '/imgs/quang-ganh-lo-di-va-vui-song.jpg'],
                ['Đời Thay Đổi Khi Chúng Ta Thay Đổi', 'Andrew Matthews', '/imgs/doi-thay-doi-khi-chung-ta-thay-doi.jpg'],
                ['Ikigai - Bí Mật Sống Trường Thọ Của Người Nhật', 'Héctor García & Francesc Miralles', '/imgs/ikigai.jpg'],
                ['Dám Bị Ghét', 'Ichiro Kishimi & Fumitake Koga', '/imgs/dam-bi-ghet.jpg'],
                ['Sức Mạnh Của Thói Quen', 'Charles Duhigg', '/imgs/suc-manh-cua-thoi-quen.jpg'],
                ['Bắt Đầu Với Câu Hỏi Tại Sao', 'Simon Sinek', '/imgs/bat-dau-voi-cau-hoi-tai-sao.jpg'],
                ['Tâm Lý Học Thành Công (Mindset)', 'Carol S. Dweck', '/imgs/mindset.jpg'],
                ['Những Đòn Tâm Lý Trong Thuyết Phục', 'Robert B. Cialdini', '/imgs/nhung-don-tam-ly-trong-thuyet-phuc.jpg'],
            ],
            'Công nghệ thông tin' => [
                ['Tối Ưu Hóa CSDL Với MySQL', 'Baron Schwartz', '/imgs/toi-uu-hoa-csdl-voi-mysql.jpg'],
                ['Lập Trình Web Với Laravel', 'Matt Stauffer', '/imgs/lap-trinh-web-voi-laravel.jpg'],
                ['Cấu Trúc Dữ Liệu Và Giải Thuật', 'Lê Minh Hoàng', '/imgs/cau-truc-du-lieu-va-giai-thuat.jpg'],
                ['Clean Code Trong Thực Tế', 'Robert C. Martin', '/imgs/clean-code-trong-thuc-te.jpg'],
                ['Vũ Trụ Trong Vỏ Hạt Dẻ', 'Stephen Hawking', '/imgs/vu-tru-trong-vo-hat-de.jpg'],
                ['Khai Phá Dữ Liệu Lớn', 'Foster Provost', '/imgs/khai-pha-du-lieu-lon.jpg'],
                ['Thiết Kế Hệ Thống Phân Tán', 'Martin Kleppmann', '/imgs/thiet-ke-he-thong-phan-tan.jpg'],
                ['Lập Trình Viên Thực Dụng (The Pragmatic Programmer)', 'Andrew Hunt & David Thomas', '/imgs/the-pragmatic-programmer.jpg'],
                ['Kiến Trúc Sạch (Clean Architecture)', 'Robert C. Martin', '/imgs/clean-architecture.jpg'],
                ['Tái Cấu Trúc Mã Nguồn (Refactoring)', 'Martin Fowler', '/imgs/refactoring.jpg'],
                ['Mẫu Thiết Kế Hướng Đối Tượng (Design Patterns)', 'Erich Gamma', '/imgs/design-patterns.jpg'],
                ['Nhập Môn Giải Thuật (Introduction to Algorithms)', 'Thomas H. Cormen', '/imgs/introduction-to-algorithms.jpg'],
                ['Giải Thuật Trong Lập Trình (Grokking Algorithms)', 'Aditya Bhargava', '/imgs/grokking-algorithms.jpg'],
                ['Bộ Mã Hoàn Hảo (Code Complete)', 'Steve McConnell', '/imgs/code-complete.jpg'],
                ['Lập Trình Python Cấp Tốc (Python Crash Course)', 'Eric Matthes', '/imgs/python-crash-course.jpg'],
                ['Trí Tuệ Nhân Tạo Hiện Đại (AI: A Modern Approach)', 'Stuart Russell & Peter Norvig', '/imgs/ai-a-modern-approach.jpg'],
                ['Học Máy Thực Hành Với Scikit-Learn & TensorFlow', 'Aurélien Géron', '/imgs/hands-on-machine-learning.jpg'],
                ['Mạng Máy Tính Từ Trên Xuống (Computer Networking)', 'James F. Kurose & Keith W. Ross', '/imgs/computer-networking.jpg'],
                ['Cấu Trúc Và Diễn Giải Chương Trình Máy Tính (SICP)', 'Harold Abelson & Gerald Jay Sussman', '/imgs/sicp.jpg'],
                ['Lập Trình Căn Bản Với Ngôn Ngữ C', 'Brian W. Kernighan & Dennis M. Ritchie', '/imgs/lap-trinh-can-ban-voi-c.jpg'],
                ['Nghệ Thuật Tàng Hình (The Art of Invisibility)', 'Kevin Mitnick', '/imgs/the-art-of-invisibility.jpg'],
            ],
            'Sách thiếu nhi' => [
                ['Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', '/imgs/de-men-phieu-luu-ky.jpg'],
                ['Búp Sen Xanh', 'Sơn Tùng', '/imgs/bup-sen-xanh.jpg'],
                ['Hoàng Tử Bé', 'Antoine de Saint-Exupéry', '/imgs/hoang-tu-be.jpg'],
                ['Chuyện Con Mèo Dạy Hải Âu Bay', 'Luis Sepúlveda', '/imgs/chuyen-con-meo-day-hai-au-bay.jpg'],
                ['Harry Potter Và Hòn Đá Phù Thủy', 'J.K. Rowling', '/imgs/harry-potter-1.jpg'],
                ['Harry Potter Và Phòng Chứa Bí Mật', 'J.K. Rowling', '/imgs/harry-potter-2.jpg'],
                ['Harry Potter Và Tên Tù Nhân Ngục Azkaban', 'J.K. Rowling', '/imgs/harry-potter-3.jpg'],
                ['Charlie Và Nhà Máy Sôcôla', 'Roald Dahl', '/imgs/charlie-va-nha-may-socola.jpg'],
                ['Matilda - Cô Bé Thông Minh', 'Roald Dahl', '/imgs/matilda.jpg'],
                ['Mạng Nhện Của Charlotte', 'E.B. White', '/imgs/mang-nhen-cua-charlotte.jpg'],
                ['Alice Ở Xứ Sở Thần Tiên', 'Lewis Carroll', '/imgs/alice-o-xu-so-than-tien.jpg'],
                ['Những Cuộc Phiêu Lưu Của Tom Sawyer', 'Mark Twain', '/imgs/nhung-cuoc-phieu-luu-cua-tom-sawyer.jpg'],
                ['Đảo Giấu Vàng', 'Robert Louis Stevenson', '/imgs/dao-gia-vang.jpg'],
                ['Pippi Tất Dài', 'Astrid Lindgren', '/imgs/pippi-tat-dai.jpg'],
                ['Biên Niên Sử Narnia: Sư Tử, Phù Thủy Và Cái Tủ Áo', 'C.S. Lewis', '/imgs/bien-nien-su-narnia.jpg'],
                ['Chú Sâu Háu Ăn', 'Eric Carle', '/imgs/chu-sau-hau-an.jpg'],
                ['Gấu Paddington', 'Michael Bond', '/imgs/gau-paddington.jpg'],
                ['Anh Chàng Hobbit', 'J.R.R. Tolkien', '/imgs/anh-chang-hobbit.jpg'],
            ],
        ];

        $bookIndex = 0;

        foreach ($catalog as $categoryName => $books) {
            $categoryId = DB::table('categories')->insertGetId([
                'name' => $categoryName,
                'description' => "Các đầu sách thuộc thể loại $categoryName",
                'status' => 'active',
                'created_at' => $now->copy()->subMonths(6),
                'updated_at' => $now->copy()->subMonths(6),
            ]);

            foreach ($books as [$name, $author, $image]) {
                $bookIndex++;
                $productCreated = $now->copy()->subDays(101 - $bookIndex);

                $stock = match ($bookIndex) {
                    1 => 1,         // 1 sản phẩm có số lượng ít (1 cuốn)
                    2 => 0,         // 1 sản phẩm hết hàng (0 cuốn)
                    default => rand(10, 100),
                };

                DB::table('products')->insert([
                    'name' => $name,
                    'author' => $author,
                    'description' => "Cuốn sách {$name} mang lại nhiều giá trị tri thức và cảm xúc cho người đọc.",
                    'status' => 'active',
                    'price' => rand(50, 350) * 1000,
                    'category_id' => $categoryId,
                    'image' => $image,
                    'stock' => $stock,
                    'created_at' => $productCreated,
                    'updated_at' => $productCreated,
                ]);
            }
        }

        // 4. Seed 10 Đơn hàng theo luồng 4 trạng thái & rải ngày giờ qua 6 tháng
        $orderAddresses = [
            '18 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM',
            '210 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
            '64 Bạch Đằng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng',
            '412 Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP.HCM',
            '89 Giảng Võ, Phường Cát Linh, Quận Đống Đa, Hà Nội',
            '155 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM',
            '33 Hòa Bình, Phường An Cư, Quận Ninh Kiều, Cần Thơ',
            '102 Phố Huế, Phường Ngô Thì Nhậm, Quận Hai Bà Trưng, Hà Nội',
            '27 Lê Duẩn, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng',
            '510 Sư Vạn Hạnh, Phường 9, Quận 10, TP.HCM',
        ];

        // Luồng: pending (Chờ xác nhận) -> shipping (Đang giao) -> completed (Hoàn thành) | cancelled (Đã hủy)
        $statuses = ['pending', 'shipping', 'completed', 'cancelled'];

        for ($i = 1; $i <= 10; $i++) {
            $status = $statuses[($i - 1) % count($statuses)];
            $orderCreated = $now->copy()->subMonths(($i - 1) % 6)->subDays(rand(1, 20))->subHours(rand(1, 12));
            $orderUpdated = $status === 'pending'
                ? $orderCreated
                : $orderCreated->copy()->addHours(rand(2, 48));

            $orderId = DB::table('orders')->insertGetId([
                'receiver_name' => "Nguyễn Văn $i",
                'status' => $status,
                'address' => $orderAddresses[$i - 1],
                'phone' => '09876543' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'payment_method' => $i % 2 == 0 ? 'COD' : 'VNPAY',
                'total_amount' => 0,
                'user_id' => rand(2, 10),
                'created_at' => $orderCreated,
                'updated_at' => $orderUpdated,
            ]);

            // Mỗi đơn hàng có 1-3 sản phẩm
            $total = 0;
            $itemCount = rand(1, 3);
            for ($j = 0; $j < $itemCount; $j++) {
                $productId = rand(3, 100);
                $price = rand(60, 200) * 1000;
                $qty = rand(1, 2);
                $total += $price * $qty;

                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $productId,
                    'price' => $price, // Giá snapshot tại thời điểm mua
                    'quantity' => $qty,
                    'created_at' => $orderCreated,
                    'updated_at' => $orderCreated,
                ]);
            }

            // Cập nhật lại tổng tiền đơn hàng
            DB::table('orders')->where('id', $orderId)->update(['total_amount' => $total]);
        }
    }
}