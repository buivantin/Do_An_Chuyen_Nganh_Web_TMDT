# AI log – TV1 – Bùi Văn Tín

> Mỗi thành viên một tệp trong `ai-logs/`. Ghi một mục ngay sau mỗi lần dùng AI có ảnh hưởng đến sản phẩm, commit cùng thay đổi liên quan. Cả đồ án tối thiểu 6 mục có nội dung thực chất. Mã mục tăng dần: AI-01, AI-02, ...

| Mục | Thông tin |
| :---- | :---- |
| Họ tên, MSSV | Bùi Văn Tín – 0306241414 |
| Nhóm, đề tài | Nhóm 09 – Thương mại điện tử (Cửa hàng bán sách "Mọt Sách" |
| Vai trò | TV1 – LE (Leader) |
| Công cụ AI dùng | ChatGPT / Gemini / Claude |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| :---- | :---- | :---- | :---- | :---- |
| AI-01 | 10/11/2026 | Phân tích yêu cầu | Brainstorm chức năng và rủi ro | PR #1 |
| AI-02 | 10/11/2026 | Lập kế hoạch | Rà soát user story, chia sprint S1 | PR #2 |
| AI-03 | 10/11/2026 | Lập kế hoạch | Rà soát quy trình Trello & Git | PR #3 |

---

### \[AI-01\] Brainstorm chức năng và rủi ro của đề tài

- Ngày / Người dùng: \10/11/2026/ Bùi Văn Tín 
- Công cụ: \[Gemini/ChatGPT\]  
- Giai đoạn: Phân tích yêu cầu  
- Task / Commit / PR: \[DOC\] Đề cương / b9251f8 / PR #1 
- Mục đích: Liệt kê chức năng cần có và rủi ro khi làm đề tài website bán sách trong 3 tuần với 4 người.  
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Nhóm 4 sinh viên làm website bán sách trong 3 tuần bằng Laravel và React. Liệt kê chức năng cho khách và quản trị, chia mức bắt buộc/tùy chọn, và 3 rủi ro lớn nhất kèm cách phòng tránh."  
- Kết quả AI trả về: AI liệt kê 15 chức năng (đăng nhập, giỏ hàng, thanh toán, quản lý kho...). Rủi ro: Quá tải tính năng, xung đột code, thiếu thời gian test.
- Đánh giá: Đúng một phần – AI đề xuất thêm các chức năng ngoài phạm vi như "đa người bán" và "đánh giá shipper", không phù hợp với yêu cầu môn học.  
- Đã chỉnh sửa gì: Loại bỏ các chức năng ngoài phạm vi, chỉ giữ lại 12 chức năng mức B (Must) và 4 chức năng mức C (Could) đúng theo file `01_Dac_ta_yeu_cau_6_de_tai.pdf`. Bổ sung rủi ro "xung đột Git" vào đề cương.  
- Cách kiểm chứng: Đối chiếu danh sách chức năng bắt buộc trong đặc tả đề tài; thảo luận nhóm ở tiết 2; GV duyệt đề cương tiết 5  
- Tỷ lệ nội dung AI còn giữ lại: 60%  
- Điều học được: Cần giới hạn rõ phạm vi (single-vendor) trong prompt để AI không đề xuất lan man.

### \[AI-02\] Thiết lập cấu hình Git (.gitignore) cho dự án

- Ngày / Người dùng: \10/11/2026 / Bùi Văn Tín 
- Công cụ: Gemini/ChatGPT  
- Giai đoạn: Lập kế hoạch  
- Task / Commit / PR: Tạo file .gitignore /  / PR #2  
- Mục đích: Viết file .gitignore để tránh commit nhầm các file rác (vendor, node_modules, .env) khi kết hợp Laravel và React.
- Prompt chính: "Viết file .gitignore cho dự án kết hợp Laravel 10+ (backend) và React (frontend). Giải thích từng mục."
- Kết quả AI trả về: Cung cấp đầy đủ các file cần ignore cho cả PHP và Node.js, kèm chú thích rõ ràng.
- Đánh giá: Đúng hoàn toàn. AI hiểu rõ cấu trúc thư mục của cả hai framework.
- Đã chỉnh sửa gì: Giữ nguyên nội dung, chỉ gộp lại thành một file chung.
- Cách kiểm chứng: Đối chiếu với file mẫu .gitignore chính thức trên GitHub của Laravel và Vite/React.
- Tỷ lệ nội dung AI còn giữ lại: 90%
- Điều học được: AI rất giỏi trong việc tạo các file cấu hình boilerplate (mẫu) nhanh chóng.

### \[AI-03\] Rà soát quy trình Trello & Git
- Ngày / Người dùng: 10/11/2026 / Bùi Văn Tín
- Công cụ: Gemini/ChatGPT
- Giai đoạn: Lập kế hoạch
- Task / Commit / PR: Tạo file quy tắc Git /  / PR #3
- Mục đích: Đảm bảo quy trình làm việc nhóm qua Trello và Git không bị chồng chéo, dễ quản lý cho 5 người.
- Prompt chính: "Gợi ý quy trình Git Flow cơ bản cho nhóm 5 người mới làm quen, kết hợp với thẻ Trello để tránh xung đột code."
- Kết quả AI trả về: Đề xuất mô hình rẽ nhánh: main -> develop -> feature/xxx. Khuyên dùng Pull Request và review chéo.
- Đánh giá: Đúng ý tưởng, nhưng cần điều chỉnh cho khớp với yêu cầu 7 cột trên Trello của môn học.
- Đã chỉnh sửa gì: Áp dụng quy tắc đặt tên nhánh theo mã chức năng (VD: `feature/TM-05-gio-hang`) và quy định kéo thẻ Trello đúng trạng thái (Đang làm -> Chờ review -> Done).
- Cách kiểm chứng: Đọc lại file `Huong_dan_Trello_01_ThuongMaiDienTu.pdf` của giảng viên.
- Tỷ lệ nội dung AI còn giữ lại: 70%
- Điều học được: Quy trình làm việc cần được thống nhất ngay từ ngày đầu tiên để tránh việc mỗi người làm một kiểu.
-->
