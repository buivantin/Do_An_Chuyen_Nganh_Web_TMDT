# AI log – TV5 – Bùi Văn Tín

| Mục | Thông tin |
| :---- | :---- |
| Họ tên, MSSV | Bùi Văn Tín – 0306241414 |
| Nhóm, đề tài | Nhóm [Số Nhóm] – Thương mại điện tử (Website bán sách) |
| Vai trò | TV5 – Git & QA (Kiểm thử) |
| Công cụ AI dùng | [Gemini / ChatGPT] |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| :---- | :---- | :---- | :---- | :---- |
| AI-01 | [10/11] | Khởi tạo | Cấu hình .gitignore cho Laravel + React | PR #2 |
| AI-02 | [10/11] | Quy trình | Thiết lập Branch Protection và PR Template | PR #3 |
| AI-03 | [10/11] | Gỡ lỗi | Xử lý lỗi Git "not a git repository" | Commit trực tiếp |

---

### [AI-01] Cấu hình file .gitignore cho dự án kết hợp Laravel và React
- Ngày / Người dùng: 10/11/2026 / Bùi Văn Tín
- Công cụ: [Gemini / ChatGPT]
- Giai đoạn: Khởi tạo dự án
- Task / Commit / PR: Tạo file .gitignore / [Mã commit] / PR #2
- Mục đích: Ngăn chặn việc commit nhầm các thư mục rác (`vendor`, `node_modules`) và các file chứa thông tin bảo mật (`.env`) khi kết hợp cả Backend và Frontend trong cùng một repository.
- Prompt chính: "Viết file .gitignore cho dự án kết hợp Laravel 10+ (backend) và React (frontend). Giải thích từng mục."
- Kết quả AI trả về: Cung cấp đầy đủ các file cần ignore cho cả PHP và Node.js, kèm chú thích rõ ràng.
- Đánh giá: Đúng hoàn toàn. AI hiểu rõ cấu trúc thư mục của cả hai framework.
- Đã chỉnh sửa gì: Giữ nguyên nội dung, chỉ gộp lại thành một file chung cho gọn.
- Cách kiểm chứng: Đối chiếu với file mẫu .gitignore chính thức trên GitHub của Laravel và Vite/React.
- Tỷ lệ nội dung AI còn giữ lại: 70%
- Điều học được: AI rất giỏi trong việc tạo các file cấu hình boilerplate (mẫu) nhanh chóng, giúp tiết kiệm thời gian.

### [AI-02] Thiết lập quy tắc bảo vệ nhánh (Branch Protection) và mẫu PR
- Ngày / Người dùng: 10/11/2026 / Bùi Văn Tín
- Công cụ: [Gemini / ChatGPT]
- Giai đoạn: Quản lý dự án
- Task / Commit / PR: Tạo file pull_request_template.md / [Mã commit] / PR #3
- Mục đích: Đảm bảo mọi thành viên không push trực tiếp vào nhánh `main`/`develop`, bắt buộc phải tạo Pull Request (PR) và có người review.
- Prompt chính: "Làm thế nào để thiết lập Git Flow cơ bản cho nhóm 5 người mới làm quen, kết hợp với thẻ Trello để tránh xung đột code? Cách viết mẫu PR."
- Kết quả AI trả về: Hướng dẫn bật tính năng "Require a pull request before merging" trên GitHub Settings. Gợi ý nội dung mẫu PR gồm: Mô tả thay đổi, Loại thay đổi, Checklist.
- Đánh giá: Đúng ý tưởng. Tuy nhiên, AI chưa tính đến việc Trưởng nhóm (Admin) sẽ bị chặn nếu tự merge PR của mình.
- Đã chỉnh sửa gì: Áp dụng quy tắc đặt tên nhánh theo mã chức năng (VD: `feature/TM-05-gio-hang`). Thêm tùy chọn **Bypass list** cho tài khoản Admin trên GitHub để có thể merge PR khẩn cấp.
- Cách kiểm chứng: Đọc lại file `Huong_dan_Trello_01_ThuongMaiDienTu.pdf` của giảng viên và thử nghiệm tạo PR thực tế.
- Tỷ lệ nội dung AI còn giữ lại: 75%
- Điều học được: Việc bảo vệ nhánh giúp lịch sử commit sạch sẽ, nhưng cần linh hoạt cấp quyền Admin để không bị kẹt công việc.

### [AI-03] Gỡ lỗi Git "not a git repository"
- Ngày / Người dùng: 11/11/2026 / Bùi Văn Tín
- Công cụ: [Gemini / ChatGPT]
- Giai đoạn: Lập trình
- Task / Commit / PR: Sửa lỗi Terminal / [Mã commit] / Commit trực tiếp
- Mục đích: Khắc phục lỗi không thể chạy lệnh `git pull` hoặc `git checkout` khi mới mở Terminal trong VS Code.
- Prompt chính: "Terminal báo lỗi `fatal: not a git repository (or any of the parent directories): .git` khi chạy lệnh git checkout develop. Cách sửa?"
- Kết quả AI trả về: Giải thích lỗi do Terminal đang đứng ở thư mục cha (bên ngoài thư mục chứa file `.git`). Hướng dẫn dùng lệnh `cd` để di chuyển vào đúng thư mục dự án.
- Đánh giá: Đúng hoàn toàn.
- Đã chỉnh sửa gì: Chạy lệnh `cd Do_An_Chuyen_Nganh_Web_TMDT` để trỏ đúng vào thư mục gốc của dự án.
- Cách kiểm chứng: Chạy lại lệnh `git status` và thấy thông báo đang ở nhánh `develop`.
- Tỷ lệ nội dung AI còn giữ lại: 65%
- Điều học được: Luôn kiểm tra đường dẫn hiện tại của Terminal (dấu nhắc lệnh) trước khi chạy các lệnh Git.


### [AI-04] Tạo mẫu Test Case cho chức năng TM-05
- Ngày / Người dùng: 11/11/2026 / Bùi Văn Tín
- Công cụ: Gemini
- Giai đoạn: Kiểm thử
- Task / Commit / PR: Tạo file test-cases.md / [Mã commit] / PR #...
- Mục đích: Tạo 5 test case mẫu cho chức năng Giỏ hàng (TM-05) dựa trên tiêu chí chấp nhận.
- Prompt chính: "Tạo 5 test case mẫu cho chức năng Giỏ hàng trong website thương mại điện tử. Bao gồm các trường: ID, Mã chức năng, Bước thực hiện, Dữ liệu, Kết quả mong đợi."
- Kết quả AI trả về: AI đưa ra 5 kịch bản (thêm thành công, thêm vượt tồn kho, sửa số lượng, sửa vượt tồn kho, xóa).
- Đánh giá: Đúng ý tưởng, nhưng cần điều chỉnh lại cột "Dữ liệu" để khớp với đặc tả của nhóm (VD: Sản phẩm A giá 50k).
- Đã chỉnh sửa gì: Thêm dữ liệu giả định cụ thể, sửa lại các bước cho rõ ràng hơn.
- Cách kiểm chứng: Đối chiếu với tiêu chí chấp nhận của TM-05 trong file `01_Dac_ta_yeu_cau...pdf`.
- Điều học được: AI tạo kịch bản test rất nhanh, nhưng người test (QA) phải là người cung cấp dữ liệu đầu vào (Data) thực tế cho chuẩn.

### [AI-04] Tạo Test Case cho chức năng TM-04 (Đăng ký)
- Ngày / Người dùng: 12/11/2026 / Bùi Văn Tín
- Công cụ: Gemini
- Giai đoạn: Kiểm thử (QA)
- Task / Commit / PR: Cập nhật file test-cases.md / [Mã commit] / PR #...
- Mục đích: Viết các kịch bản kiểm thử (Test Case) cho chức năng Đăng ký tài khoản, bao phủ các trường hợp biên và bảo mật.
- Prompt chính: "Hãy tạo 5 test case cho chức năng Đăng ký tài khoản (email duy nhất, mật khẩu >= 8 ký tự). Gồm các trường: ID, Tên test, Điều kiện, Các bước, Kết quả mong đợi. Nhớ có trường hợp nhập email đã tồn tại và mật khẩu quá ngắn."
- Kết quả AI trả về: 5 kịch bản test rất chi tiết (đăng ký thành công, bỏ trống, sai định dạng pass, sai xác nhận pass, trùng email).
- Đánh giá: Đúng, bao quát được các trường hợp cơ bản (happy path và edge cases).
- Đã chỉnh sửa gì: Thêm bước kiểm tra "Mật khẩu phải được băm (bcrypt) dưới CSDL" vào kết quả mong đợi của TC-04-01 để tăng tính bảo mật.
- Cách kiểm chứng: Đối chiếu với danh sách tiêu chí chấp nhận (Acceptance Criteria) của TM-04 trong file PDF.
- Điều học được: AI viết test case rất nhanh, nhưng vai trò của QA là phải bổ sung các góc nhìn về bảo mật và trải nghiệm người dùng mà AI có thể bỏ sót.