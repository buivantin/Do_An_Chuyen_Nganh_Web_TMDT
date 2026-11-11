# AI log – TV5 – [Họ và Tên Của Bạn]

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