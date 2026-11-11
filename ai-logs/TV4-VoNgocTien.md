# AI log – TV4 – Võ Ngọc Tiên

> Mỗi thành viên một tệp trong `ai-logs/`. Ghi một mục ngay sau mỗi lần dùng AI có ảnh hưởng đến sản phẩm, commit cùng thay đổi liên quan. Cả đồ án tối thiểu 6 mục có nội dung thực chất. Mã mục tăng dần: AI-01, AI-02, ...

| Mục | Thông tin |
| :---- | :---- |
| Họ tên, MSSV | Võ Ngọc Tiên – 0306241411 |
| Nhóm, đề tài | Nhóm 09 – Thương mại điện tử (Cửa hàng bán sách "Mọt Sách") |
| Vai trò | TV4 – Backend (Database) |
| Công cụ AI dùng | Gemini |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| :---- | :---- | :---- | :---- | :---- |
| AI-01 | 10/11 | Thiết kế | Chuẩn hóa ERD v2 (3NF), tạo file mo-ta-bang.md và giải thích lưu price ở order_item | docs: erd v2 chuan hoa 3nf | PR #01 |
| AI-02 | 11/11 | Lập trình | Sinh dữ liệu mẫu Seeder (30 sách Tiếng Việt, 10 đơn hàng, 11 users) và xử lý lỗi thứ tự Migration | feat(db): seed du lieu mau | PR #02 |

---

### [AI-01] Chuẩn hóa ERD v2 (3NF), giải thích logic lưu giá và viết tài liệu mô tả bảng
- Ngày / Người dùng: 2026/11/10 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Thiết kế
- Task / Commit / PR: [DB] ERD / aa81087 / docs: erd v2 chuan hoa 3nf / PR #01
- Mục đích: Bổ sung các ràng buộc (NOT NULL, UNIQUE, CHECK), chỉ mục (indexes) cho 7 bảng; giải thích lý do order_item cần lưu giá tại thời điểm mua và sinh nội dung file docs/database/mo-ta-bang.md.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Tôi là TV4. Hãy phân tích các bước chuẩn hóa ERD đến 3NF, giải thích lý do vì sao order_item cần lưu giá tại thời điểm mua, thiết kế chỉ mục cho products(name), products(category_id), orders(user_id, status) và tạo giúp tôi nội dung file docs/database/mo-ta-bang.md hoàn chỉnh."
- Kết quả AI trả về (tóm tắt):
  - Giải thích 2 lý do cốt lõi lưu price ở order_item: đảm bảo tính toàn vẹn lịch sử giao dịch khi giá sản phẩm biến động và tính độc lập dữ liệu của hóa đơn đơn hàng.
  - Cung cấp đoạn mã DBML v2 hoàn chỉnh đã sửa các cảnh báo mismatched optional ref constraints bằng cách thêm not null.
  - Sinh sẵn toàn bộ file Markdown mo-ta-bang.md chi tiết 7 bảng kèm theo các ràng buộc và chỉ mục.
- Đánh giá: Đúng hoàn toàn về mặt lý thuyết CSDL 3NF và nghiệp vụ Thương mại điện tử. AI chỉ ra đúng lỗi thiếu cột price trong lịch sử mua và giúp tối ưu các câu lệnh tạo chỉ mục.
- Đã chỉnh sửa gì: Giữ nguyên 100% lập luận lưu giá và cấu trúc mô tả 7 bảng do AI tạo; kiểm tra lại tên cột (created_at, voucher_id) khớp với mã DBML trên dbdiagram.io.
- Cách kiểm chứng:
  - Nhập mã DBML lên dbdiagram.io kiểm tra không còn báo lỗi/cảnh báo vàng.
  - Gán thành viên TV2 review thẻ [DB] ERD trên Trello và đối chiếu danh sách User Story TM-11, TM-12.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 90%
- Điều học được: Khóa ngoại trong DBML nếu không khai báo not null sẽ mặc định là Nullable, dẫn đến lệch chuẩn với toán tử quan hệ >; hiểu rõ tầm quan trọng của việc lưu snapshot giá trong thiết kế hóa đơn bán hàng.

---

### [AI-02] Sinh dữ liệu mẫu Seeder và xử lý lỗi thứ tự chạy Migration
- Ngày / Người dùng: 2026/11/11 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: [DB] Migration & seed / feat(db): seed du lieu mau / PR #02
- Mục đích: Viết code `DatabaseSeeder.php` tạo dữ liệu thử nghiệm chuẩn cho 7 bảng (1 Admin, 10 Khách hàng, 5 Danh mục, 30 Sách tiếng Việt, 10 Đơn hàng) và xử lý lỗi dính khóa ngoại `errno: 150` khi chạy Migration.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Hướng dẫn tôi viết DatabaseSeeder trong Laravel nạp 1 admin, 10 khách hàng, 5 danh mục, 30 sách tiếng Việt và 10 đơn hàng mẫu nhiều trạng thái; đồng thời hỗ trợ sửa lỗi SQLSTATE[HY000]: 1005 Can't create table cart_items khi chạy migrate:fresh."
- Kết quả AI trả về (tóm tắt):
  - Sinh bộ mã `DatabaseSeeder.php` sử dụng `DB::table()` nạp dữ liệu mảng ngẫu nhiên cho sách, danh mục và đơn hàng kèm logic tự động tính `total_amount` cho hóa đơn.
  - Phân tích nguyên nhân lỗi Migration do Laravel chạy theo thứ tự thời gian trong tên file (file `cart_items` chạy trước file `products`), đồng thời hướng dẫn đổi tiền tố timestamp trong tên file migration để chuẩn hóa thứ tự tạo bảng.
  - Giải thích cơ chế tắt/bật kiểm tra khóa ngoại (`SET FOREIGN_KEY_CHECKS`) và tối ưu lệnh thi hành.
- Đánh giá: Rất chính xác và bám sát thực tế. Dữ liệu tiếng Việt đa dạng, logic liên kết giữa `orders` và `order_items` hợp lý. Việc phát hiện nguyên nhân lỗi thứ tự file Migration giúp giải quyết sự cố ngay lập tức.
- Đã chỉnh sửa gì:
  - Đổi lại tên 6 tệp migration theo thứ tự thời gian tăng dần (131738 -> 131743) để bảng cha tạo trước bảng con.
  - Rút gọn file `DatabaseSeeder.php` loại bỏ các câu lệnh `TRUNCATE` thừa khi kết hợp với `php artisan migrate:fresh --seed`.
- Cách kiểm chứng:
  - Chạy lại lệnh `php artisan migrate:fresh --seed` thành công 100% không phát sinh lỗi khóa ngoại.
  - Mở phpMyAdmin kiểm tra CSDL `bookstore` ghi nhận đủ 30 sản phẩm sách, 11 tài khoản người dùng và 10 đơn hàng đa dạng trạng thái.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 65%
- Điều học được: Hiểu rõ cơ chế sắp xếp thứ tự chạy Migration trong Laravel dựa trên chuỗi thời gian của tên file; nắm vững cách sử dụng Seeder để khởi tạo dữ liệu mẫu phức tạp phục vụ kiểm thử ứng dụng.
