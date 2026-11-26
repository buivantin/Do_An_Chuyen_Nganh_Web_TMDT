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

        // 1. Danh sách khách hàng dùng chung đồng nhất cho cả bảng users, orders và reviews
        $customers = [
            [
                'name' => 'Nguyễn Minh Anh',
                'email' => 'khachhang1@gmail.com',
                'phone' => '0901234501',
                'address' => '120 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
                'status' => 'active',
            ],
            [
                'name' => 'Trần Quốc Bảo',
                'email' => 'khachhang2@gmail.com',
                'phone' => '0901234502',
                'address' => '45 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội',
                'status' => 'active',
            ],
            [
                'name' => 'Lê Thị Thu Hà',
                'email' => 'khachhang3@gmail.com',
                'phone' => '0901234503',
                'address' => '88 Trần Phú, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng',
                'status' => 'active',
            ],
            [
                'name' => 'Phạm Hoàng Nam',
                'email' => 'khachhang4@gmail.com',
                'phone' => '0901234504',
                'address' => '215 Cách Mạng Tháng 8, Phường 4, Quận 3, TP.HCM',
                'status' => 'active',
            ],
            [
                'name' => 'Võ Thị Thanh Thảo',
                'email' => 'khachhang5@gmail.com',
                'phone' => '0901234505',
                'address' => '19 Phan Đình Phùng, Phường Quán Thánh, Quận Ba Đình, Hà Nội',
                'status' => 'active',
            ],
            [
                'name' => 'Đặng Minh Quân',
                'email' => 'khachhang6@gmail.com',
                'phone' => '0901234506',
                'address' => '302 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM',
                'status' => 'active',
            ],
            [
                'name' => 'Bùi Ngọc Ánh',
                'email' => 'khachhang7@gmail.com',
                'phone' => '0901234507',
                'address' => '74 Nguyễn Văn Linh, Phường Hưng Lợi, Quận Ninh Kiều, Cần Thơ',
                'status' => 'active',
            ],
            [
                'name' => 'Hoàng Gia Huy',
                'email' => 'khachhang8@gmail.com',
                'phone' => '0901234508',
                'address' => '56 Lý Thường Kiệt, Phường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
                'status' => 'active',
            ],
            [
                'name' => 'Đỗ Thị Mai Linh',
                'email' => 'khachhang9@gmail.com',
                'phone' => '0901234509',
                'address' => '142 Hoàng Diệu, Phường Bình Thuận, Quận Hải Châu, Đà Nẵng',
                'status' => 'active',
            ],
            [
                'name' => 'Ngô Quang Khải',
                'email' => 'khachhang10@gmail.com',
                'phone' => '0901234510',
                'address' => '95 Phan Xích Long, Phường 2, Quận Phú Nhuận, TP.HCM',
                'status' => 'inactive',
            ],
        ];

        // Tài khoản Admin (id = 1)
        DB::table('users')->insert([
            'username' => 'admin',
            'email' => 'admin@bookstore.com',
            'phone' => '0901000000',
            'address' => '01 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'total_spent' => 0,
            'membership_tier' => 1,
            'created_at' => $now->copy()->subYears(5),
            'updated_at' => $now->copy()->subYears(5),
        ]);

        // 10 Tài khoản Khách hàng (id = 2..11)
        foreach ($customers as $customer) {
            $userCreated = $now->copy()->subYears(4)->subMonths(rand(1, 10))->subDays(rand(1, 20));

            DB::table('users')->insert([
                'username' => $customer['name'],
                'email' => $customer['email'],
                'phone' => $customer['phone'],
                'address' => $customer['address'],
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'status' => $customer['status'],
                'total_spent' => 0,
                'membership_tier' => 1,
                'created_at' => $userCreated,
                'updated_at' => $userCreated,
            ]);
        }

        // 2 & 3. Seed 5 Danh mục kèm đúng 100 Đầu sách (đầy đủ NXB, năm XB, số trang)
        $publishersByCategory = [
            'Văn học' => ['NXB Hội Nhà Văn', 'NXB Trẻ', 'NXB Văn Học', 'Nhã Nam'],
            'Kinh tế & Quản lý' => ['NXB Trẻ', 'NXB Tổng Hợp TP.HCM', 'NXB Thế Giới', 'Alpha Books'],
            'Kỹ năng sống' => ['NXB Tổng Hợp TP.HCM', 'NXB Trẻ', 'First News - Trí Việt', 'NXB Thế Giới'],
            'Công nghệ thông tin' => ['NXB Khoa Học & Kỹ Thuật', 'NXB Thông Tin & Truyền Thông', 'NXB Đại Học Quốc Gia', 'O\'Reilly Media'],
            'Sách thiếu nhi' => ['NXB Kim Đồng', 'NXB Trẻ', 'NXB Phụ Nữ Việt Nam', 'Nhã Nam'],
        ];

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
                'created_at' => $now->copy()->subYears(5),
                'updated_at' => $now->copy()->subYears(5),
            ]);

            $categoryPublishers = $publishersByCategory[$categoryName];

            foreach ($books as [$name, $author, $image]) {
                $bookIndex++;
                $prodYearOffset = ($bookIndex - 1) % 5; // 0 => 2026, 1 => 2025, 2 => 2024, 3 => 2023, 4 => 2022
                $productCreated = $now->copy()
                    ->subYears($prodYearOffset)
                    ->subMonths(rand(0, 9))
                    ->subDays(rand(1, 20));

                $stock = match ($bookIndex) {
                    1 => 1,         // 1 sản phẩm sắp hết (1 cuốn)
                    2 => 0,         // 1 sản phẩm hết hàng (0 cuốn)
                    default => rand(10, 100),
                };

                DB::table('products')->insert([
                    'name' => $name,
                    'author' => $author,
                    'publisher' => $categoryPublishers[$bookIndex % count($categoryPublishers)],
                    'published_year' => rand(2016, 2026),
                    'page_count' => rand(160, 620),
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

        // 3.5. Seed danh sách Voucher khớp với 5 cấp bậc thành viên (1..5)
        DB::table('vouchers')->insert([
            [
                'id' => 1,
                'name' => 'Chào Mầm Sách - Giảm 20K',
                'code' => 'MAMSACH20',
                'discount_amount' => 20000,
                'min_order_value' => 150000,
                'min_spent' => 0,
                'membership_tier' => 1, // 01. Mầm Sách (từ 0đ)
                'status' => 'active',
                'start_date' => $now->copy()->subMonths(6),
                'expiration_date' => $now->copy()->addMonths(6),
                'requirement' => 'Áp dụng cho thành viên từ cấp 01. Mầm Sách trở lên, đơn từ 150.000đ.',
                'created_at' => $now->copy()->subMonths(6),
                'updated_at' => $now->copy()->subMonths(6),
            ],
            [
                'id' => 2,
                'name' => 'Ưu Đãi Người Đọc - Giảm 35K',
                'code' => 'NGUOIDOC35',
                'discount_amount' => 35000,
                'min_order_value' => 200000,
                'min_spent' => 300000,
                'membership_tier' => 2, // 02. Người Đọc (từ 300.000đ)
                'status' => 'active',
                'start_date' => $now->copy()->subMonths(3),
                'expiration_date' => $now->copy()->addMonths(6),
                'requirement' => 'Dành cho cấp 02. Người Đọc trở lên (tích lũy từ 300.000đ), đơn từ 200.000đ.',
                'created_at' => $now->copy()->subMonths(3),
                'updated_at' => $now->copy()->subMonths(3),
            ],
            [
                'id' => 3,
                'name' => 'Đặc Quyền Tri Thức - Giảm 60K',
                'code' => 'TRITHUC60',
                'discount_amount' => 60000,
                'min_order_value' => 300000,
                'min_spent' => 800000,
                'membership_tier' => 3, // 03. Tri Thức (từ 800.000đ)
                'status' => 'active',
                'start_date' => $now->copy()->subMonths(3),
                'expiration_date' => $now->copy()->addMonths(6),
                'requirement' => 'Dành cho cấp 03. Tri Thức trở lên (tích lũy từ 800.000đ), đơn từ 300.000đ.',
                'created_at' => $now->copy()->subMonths(3),
                'updated_at' => $now->copy()->subMonths(3),
            ],
            [
                'id' => 4,
                'name' => 'Ưu Đãi Học Giả - Giảm 100K',
                'code' => 'HOCGIA100',
                'discount_amount' => 100000,
                'min_order_value' => 450000,
                'min_spent' => 1800000,
                'membership_tier' => 4, // 04. Học Giả (từ 1.800.000đ)
                'status' => 'active',
                'start_date' => $now->copy()->subMonths(3),
                'expiration_date' => $now->copy()->addMonths(6),
                'requirement' => 'Dành cho cấp 04. Học Giả trở lên (tích lũy từ 1.800.000đ), đơn từ 450.000đ.',
                'created_at' => $now->copy()->subMonths(3),
                'updated_at' => $now->copy()->subMonths(3),
            ],
            [
                'id' => 5,
                'name' => 'VIP Đại Sứ Tri Thức - Giảm 180K',
                'code' => 'DAISU180',
                'discount_amount' => 180000,
                'min_order_value' => 600000,
                'min_spent' => 3500000,
                'membership_tier' => 5, // 05. Đại Sứ Tri Thức (từ 3.500.000đ)
                'status' => 'active',
                'start_date' => $now->copy()->subMonths(3),
                'expiration_date' => $now->copy()->addMonths(6),
                'requirement' => 'Dành riêng cho cấp 05. Đại Sứ Tri Thức (tích lũy từ 3.500.000đ), đơn từ 600.000đ.',
                'created_at' => $now->copy()->subMonths(3),
                'updated_at' => $now->copy()->subMonths(3),
            ],
        ]);

        // 4. Seed 25 Đơn hàng rải đều 2022–2026 (khớp đúng tên, SĐT, địa chỉ & sách của người đánh giá)
        $reviewedBooksByOrder = [
            1 => 1,   // Nguyễn Minh Anh (user_id = 2) mua Nhà Giả Kim (product_id = 1)
            2 => 3,   // Trần Quốc Bảo (user_id = 3) mua Tôi Thấy Hoa Vàng Trên Cỏ Xanh (product_id = 3)
            3 => 39,  // Lê Thị Thu Hà (user_id = 4) mua Đắc Nhân Tâm (product_id = 39)
            4 => 62,  // Phạm Hoàng Nam (user_id = 5) mua Tối Ưu Hóa CSDL Với MySQL (product_id = 62)
            5 => 63,  // Võ Thị Thanh Thảo (user_id = 6) mua Lập Trình Web Với Laravel (product_id = 63)
            6 => 83,  // Đặng Minh Quân (user_id = 7) mua Dế Mèn Phiêu Lưu Ký (product_id = 83)
            7 => 1,   // Bùi Ngọc Ánh (user_id = 8) mua Nhà Giả Kim (product_id = 1)
        ];

        $sampleNotes = [
            'Giao giờ hành chính giúp mình nhé.',
            'Gọi điện trước khi giao 15 phút.',
            'Đóng gói chống sốc kỹ giúp mình vì mua làm quà tặng.',
            null,
            'Để hàng ở quầy lễ tân tòa nhà nếu mình không nghe máy.',
        ];

        for ($i = 1; $i <= 25; $i++) {
            $yearOffset = ($i - 1) % 5; // 0 => 2026, 1 => 2025, 2 => 2024, 3 => 2023, 4 => 2022
            $customerIdx = ($i - 1) % count($customers); // 0..9
            $customer = $customers[$customerIdx];
            $userId = $customerIdx + 2; // user_id = 2..11

            if ($i <= 7) {
                $status = 'completed';
            } elseif ($yearOffset === 0) {
                $status = match ($i) {
                    11 => 'pending',
                    16 => 'shipping',
                    default => 'cancelled',
                };
            } else {
                $status = ($i % 3 === 0) ? 'cancelled' : 'completed';
            }

            if ($yearOffset === 0) {
                $orderCreated = match ($i) {
                    1  => $now->copy()->subDays(10),                  // Tháng 11/2026 (completed)
                    6  => $now->copy()->subMonths(4)->subDays(5),    // Tháng 07/2026 (completed)
                    11 => $now->copy()->subDays(2),                   // Tháng 11/2026 (pending)
                    16 => $now->copy()->subDays(4),                   // Tháng 11/2026 (shipping)
                    default => $now->copy()->subMonths(7)->subDays(8), // Tháng 04/2026 (cancelled)
                };
            } else {
                $orderCreated = $now->copy()
                    ->subYears($yearOffset)
                    ->subMonths(rand(0, 9))
                    ->subDays(rand(1, 20))
                    ->subHours(rand(1, 12));
            }

            $orderUpdated = $status === 'pending'
                ? $orderCreated
                : $orderCreated->copy()->addHours(rand(2, 48));

            $shippingFee = ($i % 4 === 0) ? 0 : 30000;

            $orderId = DB::table('orders')->insertGetId([
                'receiver_name' => $customer['name'],
                'status' => $status,
                'address' => $customer['address'],
                'note' => $sampleNotes[$i % count($sampleNotes)],
                'phone' => $customer['phone'],
                'payment_method' => $i % 2 == 0 ? 'COD' : 'VNPAY',
                'shipping_fee' => $shippingFee,
                'total_amount' => 0,
                'user_id' => $userId,
                'voucher_id' => ($i % 5 === 0) ? 1 : null,
                'created_at' => $orderCreated,
                'updated_at' => $orderUpdated,
            ]);

            $subtotal = 0;
            $itemCount = rand(1, 3);
            for ($j = 0; $j < $itemCount; $j++) {
                $productId = ($j === 0 && isset($reviewedBooksByOrder[$i]))
                    ? $reviewedBooksByOrder[$i]
                    : rand(1, 100);

                $price = rand(60, 200) * 1000;
                $qty = rand(1, 2);
                $subtotal += $price * $qty;

                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $productId,
                    'price' => $price,
                    'quantity' => $qty,
                    'created_at' => $orderCreated,
                    'updated_at' => $orderCreated,
                ]);
            }

            $voucherDiscount = ($i % 5 === 0) ? 20000 : 0;
            $finalTotal = max(0, $subtotal - $voucherDiscount) + $shippingFee;

            DB::table('orders')->where('id', $orderId)->update(['total_amount' => $finalTotal]);
        }

        // 4.5. Tự động tính lại tổng chi tiêu tích lũy (total_spent) và hạng VIP (1..5) cho từng khách hàng
        for ($uid = 2; $uid <= 11; $uid++) {
            $spent = (float) DB::table('orders')
                ->where('user_id', $uid)
                ->where('status', 'completed')
                ->sum('total_amount');

            $tier = match (true) {
                $spent >= 3500000 => 5, // 05. Đại Sứ Tri Thức
                $spent >= 1800000 => 4, // 04. Học Giả
                $spent >= 800000  => 3, // 03. Tri Thức
                $spent >= 300000  => 2, // 02. Người Đọc
                default           => 1, // 01. Mầm Sách
            };

            DB::table('users')->where('id', $uid)->update([
                'total_spent' => $spent,
                'membership_tier' => $tier,
            ]);
        }

        // 5. Seed 7 Đánh giá sản phẩm khớp đúng 7 khách hàng đã mua sách ở trên
        $sampleReviews = [
            [
                'user_id' => 2,      // Nguyễn Minh Anh
                'product_id' => 1,   // Nhà Giả Kim
                'rating' => 5,
                'comment' => 'Sách in sắc nét, đóng gói chống sốc rất kỹ. Giao hàng nhanh.',
                'status' => 'visible',
                'created_at' => $now->copy()->subDays(1),
                'updated_at' => $now->copy()->subDays(1),
            ],
            [
                'user_id' => 3,      // Trần Quốc Bảo
                'product_id' => 3,   // Tôi Thấy Hoa Vàng Trên Cỏ Xanh
                'rating' => 5,
                'comment' => 'Truyện nhẹ nhàng, sâu lắng, bìa sách rất đẹp.',
                'status' => 'visible',
                'created_at' => $now->copy()->subMonths(4),
                'updated_at' => $now->copy()->subMonths(4),
            ],
            [
                'user_id' => 4,      // Lê Thị Thu Hà
                'product_id' => 39,  // Đắc Nhân Tâm
                'rating' => 4,
                'comment' => 'Nội dung kinh điển, giao hàng đúng hẹn.',
                'status' => 'visible',
                'created_at' => $now->copy()->subYear()->subMonths(2),
                'updated_at' => $now->copy()->subYear()->subMonths(2),
            ],
            [
                'user_id' => 5,      // Phạm Hoàng Nam
                'product_id' => 62,  // Tối Ưu Hóa CSDL Với MySQL
                'rating' => 5,
                'comment' => 'Kiến thức về index và tối ưu truy vấn rất thực tế, dễ áp dụng.',
                'status' => 'visible',
                'created_at' => $now->copy()->subYears(2)->subMonths(3),
                'updated_at' => $now->copy()->subYears(2)->subMonths(3),
            ],
            [
                'user_id' => 6,      // Võ Thị Thanh Thảo
                'product_id' => 63,  // Lập Trình Web Với Laravel
                'rating' => 4,
                'comment' => 'Tài liệu chi tiết, phù hợp làm đồ án web thương mại điện tử.',
                'status' => 'visible',
                'created_at' => $now->copy()->subYears(3)->subMonths(4),
                'updated_at' => $now->copy()->subYears(3)->subMonths(4),
            ],
            [
                'user_id' => 7,      // Đặng Minh Quân
                'product_id' => 83,  // Dế Mèn Phiêu Lưu Ký
                'rating' => 5,
                'comment' => 'Tranh minh họa sinh động, bé nhà mình rất thích.',
                'status' => 'visible',
                'created_at' => $now->copy()->subYears(4)->subMonths(2),
                'updated_at' => $now->copy()->subYears(4)->subMonths(2),
            ],
            [
                'user_id' => 8,      // Bùi Ngọc Ánh
                'product_id' => 1,   // Nhà Giả Kim
                'rating' => 2,
                'comment' => 'Đơn vị vận chuyển giao trễ hơn dự kiến 1 ngày.',
                'status' => 'hidden',
                'created_at' => $now->copy()->subYears(4)->subMonths(6),
                'updated_at' => $now->copy()->subYears(4)->subMonths(5),
            ],
        ];

        DB::table('reviews')->insert($sampleReviews);

        // 6. Seed danh sách Hero Banner trang chủ
        DB::table('banners')->insert([
            [
                'badge_text'  => 'TUYỂN CHỌN THÁNG 11',
                'title'       => 'Mỗi trang sách mở ra một chân trời mới',
                'description' => 'Khám phá không gian sách tinh tuyển tại Mọt Sách BookHouse – nơi hội tụ những tác phẩm văn học kinh điển, tư duy kinh tế hiện đại và ấn phẩm thiếu nhi đầy cảm hứng.',
                'image'       => '/imgs/banners/hero-bookstore-1.jpg',
                'promo_label' => 'Văn học',
                'product_id'  => 1, // Nhà Giả Kim - Paulo Coelho
                'sort_order'  => 1,
                'status'      => 'active',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'badge_text'  => 'GÓC TRÍCH DẪN HAY',
                'title'       => 'Đừng bao giờ đánh giá thấp sức mạnh của sự thấu cảm',
                'description' => '“Thành công trong giao tiếp đến từ việc chân thành đặt mình vào vị trí của người khác để lắng nghe và sẻ chia.”',
                'image'       => '/imgs/banners/hero-bookstore-2.jpg',
                'promo_label' => 'Kỹ năng sống',
                'product_id'  => 39, // Đắc Nhân Tâm - Dale Carnegie
                'sort_order'  => 2,
                'status'      => 'active',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'badge_text'  => 'TỦ SÁCH THIẾU NHI',
                'title'       => 'Nuôi dưỡng trí tưởng tượng bay bổng cho trẻ thơ',
                'description' => '“Người lớn ai cũng từng là trẻ con, nhưng rất ít người trong số họ còn nhớ điều đó.”',
                'image'       => '/imgs/banners/hero-bookstore-3.jpg',
                'promo_label' => 'Sách thiếu nhi',
                'product_id'  => 85, // Hoàng Tử Bé - Antoine de Saint-Exupéry
                'sort_order'  => 3,
                'status'      => 'active',
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
        ]);
    }
}