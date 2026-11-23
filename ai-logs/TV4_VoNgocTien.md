# AI log – TV4 – Võ Ngọc Tiên

> Mỗi thành viên một tệp trong `ai-logs/`. Ghi một mục ngay sau mỗi lần dùng AI có ảnh hưởng đến sản phẩm, commit cùng thay đổi liên quan. Cả đồ án tối thiểu 6 mục có nội dung thực chất. Mã mục tăng dần: AI-01, AI-02, ...

| Mục             | Thông tin                                                   |
| :-------------- | :---------------------------------------------------------- |
| Họ tên, MSSV    | Võ Ngọc Tiên – 0306241411                                   |
| Nhóm, đề tài    | Nhóm 09 – Thương mại điện tử (Cửa hàng bán sách "Mọt Sách") |
| Vai trò         | TV4 – Backend (Database)                                    |
| Công cụ AI dùng | Gemini                                                      |

## Bảng tổng hợp

| Mã    | Ngày  | Giai đoạn | Nội dung                                                                                                         | Commit / PR                          |
| :---- | :---- | :-------- | :--------------------------------------------------------------------------------------------------------------- | :----------------------------------- |
| AI-01 | 10/11 | Thiết kế  | Chuẩn hóa ERD v2 (3NF), tạo file mo-ta-bang.md và giải thích lưu price ở order_item                              | docs: erd v2 chuan hoa 3nf \| PR #01 |
| AI-02 | 11/11 | Lập trình | Sinh dữ liệu mẫu Seeder (30 sách Tiếng Việt, 10 đơn hàng, 11 users) và xử lý lỗi thứ tự Migration                | feat(db): seed du lieu mau \| PR #02 |
| AI-03 | 11/11 | Tài liệu  | Đối chiếu ERD v2 với Migration, hoàn thiện docs CSDL, chuẩn bị kịch bản thuyết trình 2 phút & xử lý Git workflow | docs: erd final \| PR #03            |
| AI-04 | 22/11 | Lập trình | Xây dựng Validation tiếng Việt và chặn tràn số CSDL cho form Quản lý Danh mục & Sản phẩm                         | fix/validate-admin                   |
| AI-05 | 22/11 | Dữ liệu   | Mở rộng Seeder lên 100 đầu sách, 5 danh mục, ảnh bìa nội bộ (`public/imgs/`) và đơn hàng nhiều trạng thái        | feat/seed-100-books                  |
| AI-06 | 22/11 | Kiểm thử  | Chạy kiểm thử tự động `CategoryServiceTest`, xử lý Git merge vào `develop` và đồng bộ tài liệu nhánh             | fix/validate-admin                   |
| AI-07 | 23/11 | Lập trình | Xây dựng giao diện Admin Tổng quan (Dashboard), API lọc thống kê đa năm, kiểm duyệt đánh giá & đồng bộ Seeder     | feat/reviews-and-dashboard           |

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
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 65%
- Điều học được: Khóa ngoại trong DBML nếu không khai báo not null sẽ mặc định là Nullable, dẫn đến lệch chuẩn với toán tử quan hệ >; hiểu rõ tầm quan trọng của việc lưu snapshot giá trong thiết kế hóa đơn bán hàng.

---

### [AI-02] Sinh dữ liệu mẫu Seeder và xử lý lỗi thứ tự chạy Migration

- Ngày / Người dùng: 2026/11/11 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: [DB] Migration & seed / b245805 / PR #02
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

---

### [AI-03] Đối chiếu ERD v2 với Migration, chuẩn bị kịch bản thuyết trình ERD và xử lý Git workflow

- Ngày / Người dùng: 2026/11/11 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Tài liệu & Bảo vệ
- Task / Commit / PR: [DB] ERD / e126e52 / PR #03
- Mục đích: Đối chiếu tính nhất quán giữa sơ đồ ERD và các file Migration Laravel; sinh kịch bản thuyết trình 2 phút giải thích logic 3NF (tách `order_items` và lưu giá snapshot); hỗ trợ câu lệnh Git lấy thư mục tài liệu từ nhánh cũ sang nhánh mới dựa trên `develop`.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Tôi là TV4. Hãy giúp tôi rà soát tính nhất quán giữa ERD và Migration Laravel, chuẩn bị kịch bản thuyết trình 2 phút giải thích lý do tách order_items và lưu giá snapshot lúc mua, đồng thời hướng dẫn quy trình Git checkout/push file tài liệu lên nhánh docs/erd-final."
- Kết quả AI trả về (tóm tắt):
  - Rà soát xác nhận tính nhất quán giữa 7 bảng Migration thực tế và sơ đồ ERD final.
  - Sinh kịch bản thuyết trình 2 phút cô đọng, nhấn mạnh 2 luận điểm cốt lõi: Triệt tiêu quan hệ N-N đưa về chuẩn 3NF và bảo vệ tính toàn vẹn lịch sử hóa đơn tài chính khi giá sản phẩm biến động.
  - Hướng dẫn chi tiết lệnh `git checkout origin/docs/erd -- docs/database/` bốc thư mục tài liệu từ nhánh cũ sang nhánh `docs/erd-final` mới mà không dính xung đột lịch sử commit với `develop`.
- Đánh giá: Kịch bản thuyết trình ngắn gọn, chuẩn chuyên môn CSDL. Câu lệnh Git giải quyết chính xác sự cố lệch commit giữa các nhánh và lỗi `invalid reference`.
- Đã chỉnh sửa gì: Giữ nguyên 100% kịch bản thuyết trình và bộ lệnh Git thực thi trên Terminal.
- Cách kiểm chứng:
  - Mở file `erd-final.png` đối chiếu từng tên cột/khóa ngoại với các file migration trong `database/migrations/` chạy khớp 100%.
  - Thực thi thành công lệnh `git checkout origin/docs/erd -- docs/database/`, push nhánh `docs/erd-final` và tạo Pull Request PR #03 thành công trên GitHub.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 65%
- Điều học được: Nắm vững kỹ năng thuyết trình bảo vệ kiến trúc CSDL trước giảng viên và thành thạo thao tác bốc thư mục tài liệu giữa các nhánh trong Git.

---

### [AI-04] Xây dựng Validation tiếng Việt và chặn tràn số CSDL cho form Quản lý Danh mục & Sản phẩm

- Ngày / Người dùng: 2026/11/22 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: [DB] Validate / fix/validate-admin
- Mục đích: Bổ sung kiểm tra dữ liệu đầu vào (Validation) kèm thông báo lỗi tiếng Việt rõ ràng cho chức năng Thêm/Sửa Danh mục và Sản phẩm, đồng thời chặn dữ liệu vượt ngưỡng gây lỗi tràn số (`Out of range`) trong MySQL.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Hỗ trợ tôi viết quy tắc validation tiếng Việt cho form Thêm/Sửa Danh mục và Sản phẩm trong Laravel (CategoryController, ProductController), kiểm tra tên trùng lặp, định dạng ảnh JPG/PNG tối đa 2MB, giá bán lớn hơn 0 và chặn vượt ngưỡng gây lỗi tràn số database."
- Kết quả AI trả về (tóm tắt):
  - Bổ sung rule `unique:categories,name` (kèm ngoại lệ ID hiện tại khi cập nhật), giới hạn độ dài tên (tối đa 255 ký tự) và mô tả (tối đa 1000 ký tự).
  - Thiết lập kiểm tra giá bán (`numeric|min:1000|max:999999999`), tồn kho (`integer|min:0|max:1000000`), kiểm tra khóa ngoại `exists:categories,id` và định dạng file ảnh `mimes:jpg,jpeg,png|max:2048`.
  - Định nghĩa mảng thông báo lỗi tiếng Việt thân thiện cho từng trường hợp vi phạm.
- Đánh giá: Đúng nghiệp vụ và xử lý triệt để lỗi sập trang (HTTP 500) khi người dùng nhập số quá lớn hoặc bỏ trống trường bắt buộc trên giao diện Admin.
- Đã chỉnh sửa gì: Điều chỉnh thông báo lỗi tiếng Việt khớp với nhãn hiển thị trên form React và kiểm tra lại đường dẫn lưu ảnh tải lên.
- Cách kiểm chứng:
  - Nhập thử giá trị âm, chuỗi ký tự, tên danh mục trùng và số vượt ngưỡng 1 tỷ trên form Thêm/Sửa; hệ thống trả về thông báo lỗi tiếng Việt chuẩn xác và không ghi dữ liệu rác vào CSDL.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 70%
- Điều học được: Hiểu rõ tầm quan trọng của việc giới hạn ngưỡng `max` ở tầng ứng dụng (Validation) để khớp với kiểu dữ liệu `DECIMAL` / `INT` trong MySQL.

---

### [AI-05] Mở rộng Seeder lên 100 đầu sách, 5 danh mục và ảnh bìa nội bộ phục vụ Demo

- Ngày / Người dùng: 2026/11/22 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Dữ liệu & Lập trình
- Task / Commit / PR: [DB] Seed 100 books / feat/seed-100-books
- Mục đích: Mở rộng `DatabaseSeeder.php` nạp đủ 100 đầu sách tiếng Việt thuộc 5 danh mục chuyên biệt, cấu hình đường dẫn ảnh bìa nội bộ (`public/imgs/`) thay cho link ngoài, tạo các trạng thái tồn kho đặc biệt (hết hàng, sắp hết hàng) và đơn hàng đa trạng thái.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Giúp tôi mở rộng DatabaseSeeder lên đúng 100 đầu sách tiếng Việt chia đều cho 5 danh mục (Văn học, Kinh tế & Quản lý, Kỹ năng sống, Công nghệ thông tin, Sách thiếu nhi), trỏ ảnh bìa về thư mục nội bộ /imgs/ và thiết lập sẵn sản phẩm hết hàng (stock = 0), sắp hết hàng (stock = 1) để phục vụ demo."
- Kết quả AI trả về (tóm tắt):
  - Tạo danh sách mảng cấu trúc `$catalog` gồm 5 thể loại và chính xác 100 cuốn sách tiếng Việt có tên tác giả, mô tả và slug ảnh nội bộ `/imgs/<ten-sach>.jpg`.
  - Thiết lập kịch bản tồn kho đặc biệt cho 2 đầu sách đầu tiên (`stock = 1` và `stock = 0`) để kiểm thử hiển thị cảnh báo hết hàng trên trang chủ và chi tiết sản phẩm.
  - Ràng buộc 10 khách hàng dùng chung thông tin (tên, SĐT, địa chỉ) đồng nhất xuyên suốt 3 bảng `users`, `orders` và `reviews`.
- Đánh giá: Dữ liệu phong phú, thực tế, giúp đội ngũ Frontend kiểm thử phân trang, tìm kiếm, lọc danh mục và hiển thị giao diện giỏ hàng/đơn hàng mượt mà.
- Đã chỉnh sửa gì: Rà soát lại toàn bộ tên file ảnh khớp với bộ ảnh bìa đã lưu trong thư mục `public/imgs/`.
- Cách kiểm chứng:
  - Chạy `php artisan migrate:fresh --seed`, kiểm tra bảng `products` có đúng 100 bản ghi, ảnh bìa hiển thị đầy đủ trên trình duyệt mà không phụ thuộc mạng internet.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 75%
- Điều học được: Cách tổ chức dữ liệu Seeder theo cấu trúc mảng phân cấp giúp dễ bảo trì, tái sử dụng và đảm bảo tính nhất quán khóa ngoại giữa các bảng liên quan.

---

### [AI-06] Chạy kiểm thử tự động CategoryServiceTest và xử lý quy trình Git merge vào develop

- Ngày / Người dùng: 2026/11/22 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Kiểm thử & Git Workflow
- Task / Commit / PR: [DB] Validate / fix/validate-admin
- Mục đích: Chạy kiểm thử tự động toàn bộ Unit Test (`CategoryServiceTest`) và Feature Test (`OrderServiceTest`), đảm bảo tính toàn vẹn mã nguồn khi gộp các nhánh tính năng vào `develop`.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Hướng dẫn tôi chạy kiểm thử tự động php artisan test cho CategoryServiceTest, kiểm tra sự tồn tại của các file test khi gộp nhánh feat/seed-100-books và fix/validate-admin vào develop."
- Kết quả AI trả về (tóm tắt):
  - Cung cấp lệnh chạy lọc riêng từng bộ kiểm thử (`php artisan test --filter=CategoryServiceTest`) và chạy toàn bộ test suite (`php artisan test`).
  - Hướng dẫn quy trình kiểm tra diff và lịch sử file trong `tests/` trước và sau khi tạo Pull Request để tránh vô tình ghi đè file test của thành viên khác.
- Đánh giá: Quy trình rõ ràng, giúp phát hiện sớm các lỗi hồi quy (regression) trước khi đưa code lên nhánh chung `develop`.
- Đã chỉnh sửa gì: Thực thi trực tiếp các lệnh kiểm thử trên Terminal và đối chiếu kết quả từng test case.
- Cách kiểm chứng:
  - Toàn bộ các test case trong `CategoryServiceTest` và `OrderServiceTest` đều đạt trạng thái `PASS` (xanh).
  - Xác nhận file `tests/Unit/CategoryServiceTest.php` còn nguyên vẹn trên nhánh `develop`.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 65%
- Điều học được: Thói quen chạy bộ kiểm thử tự động (`php artisan test`) như một bước bắt buộc trước mỗi lần commit/merge code lên nhánh chung của nhóm.

---

### [AI-07] Xây dựng giao diện Admin Tổng quan (Dashboard), API lọc thống kê đa năm & đồng bộ Seeder

- Ngày / Người dùng: 2026/11/23 / Võ Ngọc Tiên
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: [TM-15] Quản trị - Thống kê / 7ff374c / feat/reviews-and-dashboard
- Mục đích: Hoàn thiện giao diện Admin Tổng quan (`resources/js/pages/Admin/Dashboard.jsx`), xây dựng API lọc dữ liệu động theo khoảng thời gian (`GET /api/admin/dashboard`), tích hợp chức năng ẩn/hiện/xóa đánh giá sản phẩm và chuẩn hóa dữ liệu mẫu 5 năm (2022–2026) trong `DatabaseSeeder.php`.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Hỗ trợ tôi hoàn thiện trang Admin Dashboard hiển thị 4 thẻ KPI, biểu đồ cột doanh thu tự động gom nhóm theo Năm/Tháng/Ngày theo bộ lọc Từ ngày – Đến ngày, bảng phân bổ 4 trạng thái đơn hàng, Top 5 sách bán chạy, bảng danh sách đơn hàng, bảng kiểm duyệt đánh giá và đồng bộ dữ liệu mẫu 2022–2026 trong DatabaseSeeder.php."
- Kết quả AI trả về (tóm tắt):
  - Refactor route `GET /api/admin/dashboard` trong `routes/api.php` nhận tham số `start_date` và `end_date` để lọc đồng bộ 5 khối dữ liệu (`books_summary`, `orders`, `revenues`, `top_products`, `reviews`), tách biệt logic doanh thu chỉ tính đơn `completed` trong khi bảng đơn hàng hiển thị đủ 4 trạng thái; bổ sung endpoint `PATCH /api/admin/reviews/{id}/toggle` và `DELETE /api/admin/reviews/{id}`.
  - Xây dựng giao diện React `Dashboard.jsx` với 4 thẻ KPI, skeleton loading, thuật toán tự động gom nhóm cột biểu đồ doanh thu theo Năm (> 366 ngày), Tháng (46–366 ngày) hoặc Ngày (≤ 45 ngày), kèm bộ lọc trạng thái đơn hàng và lọc số sao đánh giá.
  - Cập nhật `DatabaseSeeder.php` phân bổ đồng nhất 10 khách hàng, 100 đầu sách, 25 đơn hàng và 7 đánh giá qua mốc thời gian 2022–2026.
- Đánh giá: Code React và Laravel Query Builder rõ ràng, xử lý tốt các trường hợp biên như tháng/năm không phát sinh doanh thu vẫn hiển thị cột nền `0đ` và nút đặt lại nhanh về "Năm nay".
- Đã chỉnh sửa gì:
  - Tinh chỉnh độ rộng tối thiểu của cột biểu đồ (`min-w-[44px]`) và cố định nút "Năm nay" trên thanh công cụ lọc để bố cục gọn gàng trên cùng một hàng ngang.
  - Rải lại ngày tạo đơn hàng năm 2026 trong `DatabaseSeeder.php` qua các tháng 04, 07, 11 để biểu đồ theo tháng hiển thị trực quan hơn.
- Cách kiểm chứng:
  - Chạy `php artisan migrate:fresh --seed` và kiểm tra trực tiếp trên giao diện `/admin` với các khoảng lọc 1 năm (`2026`) và 5 năm (`2022–2026`), xác nhận số liệu KPI, biểu đồ và bảng chi tiết khớp với MySQL.
  - Gộp nhánh `develop` mới nhất, chạy `php artisan test` thành công và đẩy code lên nhánh `feat/reviews-and-dashboard`.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 70%
- Điều học được: Nắm vững kỹ thuật tổng hợp và gom nhóm dữ liệu chuỗi thời gian (Time-series grouping) phía Frontend kết hợp Query Builder động trên Laravel, cũng như quy trình kéo nhánh `develop` về gộp trước khi push Pull Request.