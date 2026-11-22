# AI log – TV2 - VÕ TRẦN ĐỈNH SƠN

> Mỗi thành viên một tệp trong `ai-logs/`. Ghi một mục ngay sau mỗi lần dùng AI có ảnh hưởng đến sản phẩm, commit cùng thay đổi liên quan. Cả đồ án tối thiểu 6 mục có nội dung thực chất. Mã mục tăng dần: AI-01, AI-02, ...

| Mục | Thông tin |
| :---- | :---- |
| Họ tên, MSSV | Võ Trần Đỉnh Sươn – \[0306241398\] |
| Nhóm, đề tài | Nhóm \[9\] – \[Thương mại điện tử\] |
| Vai trò | TV2 – BE  |
| Công cụ AI dùng | \[ChatGPT / Claude / Gemini / GitHub Copilot / Cursor\] |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| :---- | :---- | :---- | :---- | :---- |
| AI-01 | \[9/11\] | Phân tích yêu cầu | Brainstorm chức năng và rủi ro | \[PR \#1\] |
| AI-02 | \[dd/mm\] | Lập kế hoạch | Rà soát user story, chia sprint S1 | \[PR \#...\] |

---

### \[AI-01\] Brainstorm chức năng và rủi ro của đề tài

- Ngày / Người dùng: \[2026-11-9\] / Võ Trần Đỉnh Sơn
- Công cụ: \[Claude (Sonet 5.5)\]  
- Giai đoạn: Phân tích yêu cầu  
- Task / Commit / PR: \[DOC\] Đề cương / \[1f79843\] / \[PR \#1\]  
- Mục đích: Liệt kê chức năng cần có và rủi ro khi làm đề tài \[Thương mại điện tử\] trong 3 tuần với 5 người.  
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Nhóm 5 sinh viên làm website \[BookStore\] trong 3 tuần bằng \[Laravel\]. Liệt kê chức năng cho khách và quản trị, chia mức bắt buộc/tùy chọn, và 5 rủi ro lớn nhất kèm cách phòng tránh."  
- Kết quả AI trả về (tóm tắt): \[AI đề xuất 15 chức năng, 3 rủi ro\]  
- Đánh giá: \[Đúng một phần. Nhóm Must khớp phần lớn đặc tả, nhưng nhiều mục Could nằm ngoài đặc tả và AI chưa nêu rủi ro về phân quyền/lộ dữ liệu giữa người dùng và lệch giá trong đơn hàng.\]  
- Đã chỉnh sửa gì: \[Giữ TM-01 → TM-08, TM-11 → TM-14 chức năng khớp đặc tả đề tài, loại wishlist, quên mật khẩu qua email, email xác nhận đơn, upload nhiều ảnh; bổ sung rủi ro lộ đơn hàng khi đổi ID trên URL (TM-NFR4) và lệch giá/dùng float cho tiền (TM-NFR2, TM-NFR3)\]  
- Cách kiểm chứng: Đối chiếu danh sách chức năng bắt buộc trong đặc tả đề tài; thảo luận nhóm ở tiết 2; GV duyệt đề cương tiết 5
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): \[60\]%  
- Điều học được: \[Prompt cần nêu rõ giới hạn thời gian và số người để AI không đề xuất quá phạm vi\]


### [AI-03] So sánh cách tổ chức thư mục 3 lớp cho dự án Laravel
- Ngày / Người dùng: 2026-11-09 / Võ Trần Đỉnh Sơn
- Công cụ: Claude (Sonnet 5.5)
- Giai đoạn: Thiết kế
- Task / Commit / PR: [DB] Khung dự án / <mã commit> / <PR>
- Mục đích: Chọn cách tổ chức thư mục 3 lớp (Controllers – Services – Repositories/Models) cho dự án Laravel quy mô nhỏ.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "So sánh cách tổ chức thư mục 3 lớp cho dự án Laravel quy mô nhỏ" / <link chia sẻ hội thoại>
- Kết quả AI trả về (tóm tắt): So sánh 4 cách (mặc định, Controller–Service–Model, có thêm Repository, theo module) và đề xuất cách có Repository ở dạng nhẹ.
- Đánh giá: <Đúng / Sai / Thiếu – vì sao, theo nhận xét của bạn>
- Đã chỉnh sửa gì: <cách nhóm chọn (B hoặc C) và phần bỏ, vì sao>
- Cách kiểm chứng: Đối chiếu tài liệu Laravel mục Directory Structure: xác nhận thư mục Services, Repositories do dự án tự tạo (app mặc định chỉ có Http, Models, Providers), namespace PSR-4 hợp lệ; tài liệu không quy định mô hình Service/Repository, đây là quy ước.
- Tỷ lệ mã AI còn giữ lại (ước lượng): <số>% (chưa có mã, phần giữ lại là cách tổ chức thư mục)
- Điều học được: <ví dụ: 3 lớp là quy ước của cộng đồng, framework không bắt buộc, nên cần nhóm thống nhất và ghi vào đề cương>

### [AI-04] Đăng ký tài khoản (Model, Repository, AuthService, Request, Controller)
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

### [AI-05] AuthService.login() và logout() cho TM-04b
- Ngày / Người dùng: 12/11/2026 / TV2
- Công cụ: Claude
- Giai đoạn: Lập trình
- Task / Commit / PR: [TM-04b] / [link commit] / [link PR]
- Mục đích: Viết đăng nhập, đăng xuất: kiểm tra email/mật khẩu, chặn tài khoản bị khóa, tạo session.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "AuthService.login(): kiểm tra email/mật khẩu; tạo session/JWT."
- Kết quả AI trả về (tóm tắt): Hàm login() dùng UserRepository::findByEmail, Hash::check, chặn khi status khác 'active', Auth::login kèm session regenerate; hàm logout() hủy session. Sai email hoặc sai mật khẩu dùng chung một thông báo lỗi.
- Đánh giá: Đúng, nhưng bản đầu giả định cột is_locked (Sai so với ERD, ERD dùng cột status), phải sửa lại.
- Đã chỉnh sửa gì: Đổi điều kiện khóa sang status !== 'active'; chuẩn hóa email chữ thường giống register(); tách LoginController và LoginRequest theo cấu trúc thư mục hiện có; đổi route sang /login, /logout cho thống nhất với /register.
- Cách kiểm chứng: Đăng nhập đúng; sai mật khẩu; email không tồn tại; đăng xuất rồi gõ /admin phải bị chuyển về /login.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 60%
- Điều học được: Phải đối chiếu tên cột với ERD thực tế trước khi dùng mã AI; đăng xuất phải là form POST có @csrf (gõ /logout trực tiếp báo 405).

### [AI-06] Middleware kiểm tra vai trò admin
- Ngày / Người dùng: 12/11/2026 / TV2
- Công cụ: Claude
- Giai đoạn: Lập trình, Kiểm thử
- Task / Commit / PR: [TM-04b] / [link commit] / [link PR]
- Mục đích: Chặn khách hàng truy cập /admin, điều hướng sau đăng nhập theo vai trò.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Đăng xuất; middleware/attribute kiểm tra đăng nhập và vai trò admin."
- Kết quả AI trả về (tóm tắt): Middleware EnsureUserIsAdmin trả 403 khi chưa đăng nhập hoặc không phải admin; đăng ký alias 'admin' trong bootstrap/app.php (Laravel 11+); gắn group route ['auth', 'admin']; thêm User::isAdmin().
- Đánh giá: Đúng. Lỗi phát sinh do tôi tự sửa: khi đổi sang isAdmin() tôi viết thiếu dấu "!" (!$user || $user->isAdmin()), làm admin bị 403. Phát hiện khi test.
- Đã chỉnh sửa gì: Sửa thành !$user || !$user->isAdmin(); dùng isAdmin() ở cả controller và middleware.
- Cách kiểm chứng: Theo gợi ý của tài liệu: đăng nhập tài khoản khách rồi gõ /admin phải ra 403. Test thêm: chưa đăng nhập vào /admin bị chuyển về /login; admin vào được; đăng xuất rồi bấm Back vẫn bị chặn.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 70%
- Điều học được: Mọi thay đổi ở middleware phân quyền phải được test lại bằng tài khoản khách, không chỉ tài khoản admin.

### [AI-07] Mã giả
- Ngày / Người dùng: 16/11/2026 / Võ Trần Đỉnh Sơn
- Công cụ: Claude
- Giai đoạn: Thiết kế
- Task / Commit / PR: [TM-06] Đặt hàng
- Mục đích: Viết mã giả và chia checklist cho TM-06 theo tài liệu Ngày 6
- Prompt chính: "Viết mã giả" 
- Kết quả AI trả về (tóm tắt): Mã giả 6 bước của placeOrder (đọc giỏ, khóa dòng sản phẩm, kiểm tra kho, tạo đơn, trừ kho, xóa giỏ); checklist 4 nhóm: Mã giả, Service + transaction, Form, Kiểm thử đồng thời
- Đánh giá: Đúng một phần. Checklist đầu tiên AI chia theo mẫu chung, chưa khớp 2 thẻ 06a/06b của nhóm; sau khi gửi ảnh thẻ thật thì AI đối chiếu lại và gợi ý gộp thành 1 thẻ TM-06
- Đã chỉnh sửa gì: Gộp 06a và 06b thành TM-06; thêm mục "Mã giả" và "Test hai người đặt cùng lúc"; gán phần Form cho TV3
- Cách kiểm chứng: Đối chiếu với tài liệu Ngày 6 và checklist thực tế trên Trello
- Tỷ lệ mã AI còn giữ lại (ước lượng): 70%
- Điều học được: Mã giả mô tả quy trình và điều kiện lỗi, không phụ thuộc cú pháp; chia việc theo người phụ trách để thẻ không dồn hết vào một người

### [AI-08] Khung OrderService()
- Ngày / Người dùng: 16/11/2026 / Võ Trần Đỉnh Sơn
- Công cụ: Claude
- Giai đoạn: Lập trình
- Task / Commit / PR: [TM-06] / feat(TM-06): khung OrderService / <PR>
- Mục đích: Viết khung service đặt hàng trong 1 transaction
- Prompt chính: "Thiết kế OrderService.placeOrder(): đọc giỏ, kiểm tra tồn kho, tạo order + order_items, trừ kho, xóa giỏ – trong 1 transaction" 
- Kết quả AI trả về (tóm tắt): Code dùng DB::transaction, lockForUpdate() (khóa theo thứ tự id), tính tổng tiền ở server, lưu giá lúc mua vào order_items, trừ kho, xóa giỏ
- Đánh giá: Thiếu/sai ban đầu: AI đề xuất chạy make:model -m trong khi nhóm đã có migration orders/order_items (sẽ tạo trùng bảng); dùng tên cột total, receiver_name, phone trong khi migration thật là total_amount và chỉ có address. Sau khi nhận migration thật, AI sửa lại cho khớp
- Đã chỉnh sửa gì: Đổi tên cột theo migration; voucher_id tạm để null; 
- Cách kiểm chứng: Đối chiếu tên cột với migration products, orders, order_items. Chưa chạy thử vì model Product và CartItem chưa có trong nhánh 
- Tỷ lệ mã AI còn giữ lại (ước lượng): 50%
- Điều học được: Gửi migration thật trước khi nhờ AI viết code để tránh sai tên cột; khóa dòng theo thứ tự id để tránh deadlock

### [AI-09] Unit test cho OrderService
- Ngày / Người dùng: 17/11/2026 / Vo Tran Dinh Son
- Công cụ: Claude
- Giai đoạn: Kiểm thử
- Task / Commit / PR: [TM-06] / test(TM06): dat hang thanh cong, vuot ton kho, rollback / <PR>
- Mục đích: Viết 2 unit test
- Prompt chính: Viet Unit test cho OrderService
- Kết quả AI trả về : OrderServiceTest.php gồm 3 test: đặt hàng thành công, vượt tồn kho bị từ chối, lỗi giữa chừng thì rollback (ném lỗi bằng sự kiện created của OrderItem);
- Đánh giá: Đúng. AI đoán tên cột của categories, users, cart_items
- Đã chỉnh sửa gì: <"không sửa">
- Cách kiểm chứng: php artisan test --filter=OrderServiceTest: 3 passed (17 assertions). Sau khi chạy, bảng products vẫn còn 30 dòng (test không xóa dữ liệu mẫu). Chưa kiểm tra khóa dòng khi hai người mua cùng lúc
- Tỷ lệ mã AI còn giữ lại (ước lượng): 80%
- Điều học được: Test tuần tự chứng minh logic và rollback chứ không chứng minh khóa dòng; kiểm tra phpunit.xml trước khi dùng RefreshDatabase

### [AI-10] Giải thích cơ chế khóa CSDL chống bán vượt tồn kho
- Ngày / Người dùng:22/11/2026 / Vo Tran Dinh Son
- Công cụ: Gemini
- Giai đoạn: Kiểm thử
- Task / Commit / PR: [TM-06] / nhánh fix/TM-06-dong-thoi / commit fix (TM-06): chong ban vuot ton kho
- Mục đích: Hiểu rõ cơ chế khóa giao dịch đồng thời trong CSDL để kiểm thử và đảm bảo chức năng đặt hàng COD (TM-06) không bị âm tồn kho khi hai khách cùng mua cuốn sách cuối cùng
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): giải thích cơ chế khóa trong CSDL
- Kết quả AI trả về (tóm tắt): Giải thích nguyên nhân gây tranh chấp dữ liệu (Race Condition) khi 2 phiên cùng đọc tồn kho và phân tích 2 giải pháp trong SQL transaction: Khóa bi quan (SELECT ... FOR UPDATE) và Cập nhật nguyên tử có điều kiện (UPDATE products SET stock = stock - qty WHERE id = ? AND stock >= qty)
- Đánh giá: Đúng / Giải thích rõ bản chất khóa dòng và cập nhật có điều kiện trong transaction, nhưng cần tự đối chiếu lại với cấu trúc bảng products và mã nguồn OrderService thực tế của nhóm
- Đã chỉnh sửa gì: Không chèn thêm code mới từ AI do đã rà soát lại transaction trong OrderService và xác nhận điều kiện trừ tồn kho đã chặn được giao dịch trùng
- Cách kiểm chứng: Chỉnh tồn kho cuốn Nhà Giả Kim về 1, mở 2 trình duyệt đăng nhập 2 tài khoản rồi bấm đặt hàng đồng thời. Kết quả chỉ 1 đơn tạo thành công phiên của customer1 bị chặn và hiển thị đúng thông báo "Sản phẩm Nhà Giả Kim không đủ số lượng."
- Tỷ lệ mã AI còn giữ lại (ước lượng): 0%
- Điều học được: Nắm được cách ngăn chặn lỗi Race Condition bằng transaction kết hợp điều kiện kiểm tra tồn kho tại thời điểm ghi để tồn kho không bao giờ bị âm.

### [AI-11] Unit Test cho AuthService
- Ngày / Người dùng: 22/11/2026
- Công cụ: Gemini
- Giai đoạn: Kiểm thử
- Task / Commit / PR: TM-04, TM-06 / nhánh test/TM-04-TM-06 / commit test (TM-04): them unit test cho AuthService va OrderService
- Mục đích: Tạo khung kiểm thử đơn vị cho AuthService để kiểm chứng việc từ chối đăng ký email trùng và chặn đăng nhập tài khoản bị khóa.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Khung UnitTest cho AuthServiceTest
- Kết quả AI trả về (tóm tắt): Hướng dẫn tạo khung Unit Test và hướng dẫn chi tiết cho nội dung khung
- Đánh giá: Thiếu – Đoạn mã gợi ý ban đầu chưa biết hàm khởi tạo UserRepository::__construct(User $model) và tệp phpunit.xml đang trỏ về CSDL trống sqlite :memory: nên phát sinh lỗi ArgumentCountError và no such table: users. Sau khi gửi log lỗi và đối chiếu với OrderServiceTest.php, AI đã hướng dẫn sửa lại chính xác.
- Đã chỉnh sửa gì: chuyển từ DatabaseTransactions sang RefreshDatabase để tự chạy migration trên SQLite :memory:, sửa các trường dữ liệu mẫu (username, status => 'locked') khớp với bảng users của dự án
- Cách kiểm chứng: Chạy lệnh php artisan test --filter AuthServiceTest và php artisan test trên terminal, xác nhận toàn bộ các ca kiểm thử của AuthServiceTest và OrderServiceTest đều báo PASS màu xanh
- Tỷ lệ mã AI còn giữ lại (ước lượng): 75%
- Điều học được: Cách sử dụng trait RefreshDatabase và Service Container (app(...)) trong Laravel để viết Unit Test độc lập, chạy được trên mọi máy sạch mà không làm ảnh hưởng dữ liệu demo.

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
