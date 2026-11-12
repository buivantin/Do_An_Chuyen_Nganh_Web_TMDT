# AI log – TV1 – Nguyễn Văn A

> Mỗi thành viên một tệp trong `ai-logs/`. Ghi một mục ngay sau mỗi lần dùng AI có ảnh hưởng đến sản phẩm, commit cùng thay đổi liên quan. Cả đồ án tối thiểu 6 mục có nội dung thực chất. Mã mục tăng dần: AI-01, AI-02, ...

| Mục | Thông tin |
| :---- | :---- |
| Họ tên, MSSV | Nguyễn Văn A – \[MSSV\] |
| Nhóm, đề tài | Nhóm \[số\] – \[Đề tài\] |
| Vai trò | TV1 – LE (Leader) |
| Công cụ AI dùng | \[ChatGPT / Claude / Gemini / GitHub Copilot / Cursor\] |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| :---- | :---- | :---- | :---- | :---- |
| AI-01 | \[dd/mm\] | Phân tích yêu cầu | Brainstorm chức năng và rủi ro | \[PR \#...\] |
| AI-02 | \[dd/mm\] | Lập kế hoạch | Rà soát user story, chia sprint S1 | \[PR \#...\] |

---

### \[AI-01\] Brainstorm chức năng và rủi ro của đề tài

- Ngày / Người dùng: \[2026-11-9\] / Võ Trần Đỉnh Sơn
- Công cụ: \[Claude (Sonet 5.5)\]  
- Giai đoạn: Phân tích yêu cầu  
- Task / Commit / PR: \[DOC\] Đề cương / \[a1b2c3d\] / \[PR \#2\]  
- Mục đích: Liệt kê chức năng cần có và rủi ro khi làm đề tài \[Thương mại điện tử\] trong 3 tuần với 5 người.  
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Nhóm 5 sinh viên làm website \[BookStore\] trong 3 tuần bằng \[Laravel\]. Liệt kê chức năng cho khách và quản trị, chia mức bắt buộc/tùy chọn, và 5 rủi ro lớn nhất kèm cách phòng tránh."  
- Kết quả AI trả về (tóm tắt): \[AI đề xuất 15 chức năng, 3 rủi ro\]  
- Đánh giá: \[Đúng một phần. Nhóm Must khớp phần lớn đặc tả, nhưng nhiều mục Could nằm ngoài đặc tả và AI chưa nêu rủi ro về phân quyền/lộ dữ liệu giữa người dùng và lệch giá trong đơn hàng.\]  
- Đã chỉnh sửa gì: \[Giữ TM-01 → TM-08, TM-11 → TM-14 chức năng khớp đặc tả đề tài, loại wishlist, quên mật khẩu qua email, email xác nhận đơn, upload nhiều ảnh; bổ sung rủi ro lộ đơn hàng khi đổi ID trên URL (TM-NFR4) và lệch giá/dùng float cho tiền (TM-NFR2, TM-NFR3)\]  
- Cách kiểm chứng: Đối chiếu danh sách chức năng bắt buộc trong đặc tả đề tài; thảo luận nhóm ở tiết 2; GV duyệt đề cương tiết 5
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): \[60\]%  
- Điều học được: \[Prompt cần nêu rõ giới hạn thời gian và số người để AI không đề xuất quá phạm vi\]

### \[AI-02\] Rà soát user story và chia sprint S1

- Ngày / Người dùng: \[yyyy-mm-dd\] / Nguyễn Văn A  
- Công cụ: \[...\]  
- Giai đoạn: Lập kế hoạch  
- Task / Commit / PR: \[...\] / \[...\] / \[...\]  
- Mục đích: \[...\]  
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): \[...\]  
- Kết quả AI trả về (tóm tắt): \[...\]  
- Đánh giá: \[Đúng / Sai / Thiếu – vì sao\]  
- Đã chỉnh sửa gì: \[...\]  
- Cách kiểm chứng: \[...\]  
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): \[...\]%  
- Điều học được: \[...\]



### [AI-02] Cấu hình kết nối CSDL và khung lớp cơ sở (Laravel)
- Ngày / Người dùng: 10/11/2026 / TV2
- Công cụ: Claude
- Giai đoạn: Lập trình
- Task / Commit / PR: Thẻ [DB] Khung dự án / commit "chore: cau hinh ket noi csdl" (mã commit: ...) / PR: (dán link), reviewer TV4
- Mục đích: Cấu hình kết nối MySQL qua .env không lộ mật khẩu, tạo lớp cơ sở BaseRepository/BaseService cho TM-04 và TM-06 kế thừa, tạo trang kiểm tra kết nối và viết mục "Cài đặt" trong README.
- Prompt chính: "Cấu hình kết nối CSDL qua .env", "Tạo lớp cơ sở BaseRepository/Service"và nội dung README, .env.example để nhờ rà soát.
- Kết quả AI trả về (tóm tắt): Hướng dẫn cấu hình DB_* trong .env. Code BaseRepository và BaseService . Route /db-check kiểm tra kết nối. Góp ý README: bọc lệnh trong khối code, thêm bước migrate; góp ý .env.example: bỏ dấu # ở các dòng DB_*.
- Đánh giá: Đúng. Thiếu ở bản đầu: README chưa có bước migrate và .env.example còn comment các dòng DB_*, được phát hiện khi gặp lỗi và rà soát lại.
- Đã chỉnh sửa gì: Đặt DB_DATABASE=bookstore và thông tin máy mình trong .env; để giá trị mẫu, không có mật khẩu thật trong .env.example; thêm bước migrate vào README; tạo thêm BaseService; chỉ in tên database ở /db-check, không in thông tin nhạy cảm.
- Cách kiểm chứng: /db-check báo kết nối thành công; php artisan migrate chạy không lỗi; php -l báo "No syntax errors detected" cho BaseService.php; dir app\Repositories thấy BaseRepository.php; git status trước khi commit không có .env (điền kết quả thật); TV5 clone repo vào máy sạch làm theo README (điền kết quả nếu đã có).
- Tỷ lệ mã AI còn giữ lại (ước lượng): 65%
- Điều học được: Chỉ đọc env() trong config\, còn lại dùng config(); Laravel mới mặc định lưu session trong database nên phải migrate; .env không được commit, còn .env.example phải đủ biến để người khác biết cần điền gì; README phải làm theo được trên máy sạch.

### [AI-03] Sơ đồ kiến trúc tổng thể
- Ngày / Người dùng: 11/11/2026 / TV2
- Công cụ: Claude
- Giai đoạn: Thiết kế
- Task / Commit / PR: Thẻ [TM-04a] / commit docs: so do kien truc / PR: <dán link>
- Mục đích: Rà soát sơ đồ kiến trúc bản đầu và xuất ảnh docs/architecture.png
- Prompt chính: Đưa ảnh sơ đồ bản đầu rồi nhờ chỉnh cho đúng dự án Laravel; sau đó yêu cầu xuất lại thành ảnh PNG
- Kết quả AI trả về (tóm tắt): Chỉ ra các chỗ không khớp (khối REST/JSON, DTO, thiếu Blade View, đường trả về), đưa bản Mermaid chỉnh và xuất ảnh PNG
- Đánh giá: Đúng một phần – AI chưa biết ERD của nhóm nên ghi sẵn tên bảng giả định, tôi phải đối chiếu lại
- Đã chỉnh sửa gì: Thay khối API bằng Routes + Middleware, điền tên bảng theo ERD v2 <điền sau khi sửa>
- Cách kiểm chứng: Đối chiếu từng khối với luồng request thật của dự án (routes → Controller → Service → Repository → Model → MySQL)
- Tỷ lệ mã AI còn giữ lại (ước lượng): 60%
- Điều học được: Phải đưa ERD và công nghệ thật cho AI trước, nếu không nó vẽ theo mẫu chung

### [AI-xy] Đăng ký tài khoản (Model, Repository, AuthService, Request, Controller)
- Ngày / Người dùng: 11/11/2026 / TV2
- Công cụ: Claude
- Giai đoạn: Lập trình
- Task / Commit / PR: Thẻ [TM-04a] / commit feat(TM-04): dang ky tai khoan bam mat khau / PR: <dán link>
- Mục đích: Sinh UserRepository, AuthService.register() (kiểm tra email trùng, băm mật khẩu), RegisterRequest với lỗi tiếng Việt, RegisterController
- Prompt chính: "Tạo model User, UserRepository, AuthService.register(): kiểm tra email trùng, băm mật khẩu (bcrypt/Identity)" và "Form đăng ký phía server: kiểm tra dữ liệu, thông báo lỗi tiếng Việt"
- Kết quả AI trả về (tóm tắt): Code dùng Hash::make() (bcrypt), kiểm tra trùng email, RegisterRequest với messages() tiếng Việt
- Đánh giá: Sai ở bản đầu – AI dùng cột name và phone, trong khi ERD v2 là username và không có phone, nên tinker báo lỗi cột. Cũng thiếu cấu hình UPDATED_AT vì bảng chỉ có created_at. authorize() mặc định là false gây lỗi 403
- Đã chỉnh sửa gì: Đổi sang username, bỏ phone, thêm const UPDATED_AT = null, bỏ Factory, đổi authorize() thành true, gán role = customer và status = active theo seeder của TV4
- Cách kiểm chứng: Chạy register() trong tinker (lần 1 tạo user, lần 2 báo trùng email), kiểm tra bảng users có mật khẩu bắt đầu $2y$, test form với các trường hợp lỗi
- Tỷ lệ mã AI còn giữ lại (ước lượng): 70%
- Điều học được: Phải đối chiếu code AI sinh với ERD và seeder thật trước khi chạy, và nên đưa ERD cho AI từ đầu
<!-- Mẫu mục mới: chép khối dưới, đổi mã AI-xx

### [AI-xx] Tiêu đề ngắn
- Ngày / Người dùng:
- Công cụ:
- Giai đoạn: Phân tích yêu cầu | Lập kế hoạch | Thiết kế | Lập trình | Kiểm thử | Tài liệu
- Task / Commit / PR:
- Mục đích:
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
- Kết quả AI trả về (tóm tắt):
- Đánh giá: Đúng / Sai / Thiếu – vì sao
- Đã chỉnh sửa gì:
- Cách kiểm chứng:
- Tỷ lệ mã AI còn giữ lại (ước lượng): ...%
- Điều học được:
-->