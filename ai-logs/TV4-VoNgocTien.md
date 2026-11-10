# AI log – TV4 – Võ Ngọc Tiên

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
| AI-01 | 10/11 | Thiết kế | Chuẩn hóa ERD v2 (3NF), tạo file mo-ta-bang.md và giải thích lưu price ở order_item | docs: erd v2 chuan hoa 3nf  |  PR#1|

---

### \[AI-01\] Chuẩn hóa ERD v2 (3NF), giải thích logic lưu giá và viết tài liệu mô tả bảng
* Ngày / Người dùng: 2026/11/10 / Võ Ngọc Tiên
Công cụ: Gemini
* Giai đoạn: Thiết kế
* Task / Commit / PR: \[DB\] ERD / aa81087 / docs: erd v2 chuan hoa 3nf / PR #01
* Mục đích: Bổ sung các ràng buộc (NOT NULL, UNIQUE, CHECK), chỉ mục (indexes) cho 7 bảng; giải thích lý do order_item cần lưu giá tại thời điểm mua và sinh nội dung file docs/database/mo-ta-bang.md.
* Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Tôi là TV4. Hãy phân tích các bước chuẩn hóa ERD đến 3NF, giải thích lý do vì sao order_item cần lưu giá tại thời điểm mua, thiết kế chỉ mục cho products(name), products(category_id), orders(user_id, status) và tạo giúp tôi nội dung file docs/database/mo-ta-bang.md hoàn chỉnh."
* Kết quả AI trả về (tóm tắt):
  - Giải thích 2 lý do cốt lõi lưu price ở order_item: đảm bảo tính toàn vẹn lịch sử giao dịch khi giá sản phẩm biến động và tính độc lập dữ liệu của hóa đơn đơn hàng.
  - Cung cấp đoạn mã DBML v2 hoàn chỉnh đã sửa các cảnh báo mismatched optional ref constraints bằng cách thêm not null.
  - Sinh sẵn toàn bộ file Markdown mo-ta-bang.md chi tiết 7 bảng kèm theo các ràng buộc và chỉ mục.
* Đánh giá: Đúng hoàn toàn về mặt lý thuyết CSDL 3NF và nghiệp vụ Thương mại điện tử. AI chỉ ra đúng lỗi thiếu cột price trong lịch sử mua và giúp tối ưu các câu lệnh tạo chỉ mục.
* Đã chỉnh sửa gì: Giữ nguyên 100% lập luận lưu giá và cấu trúc mô tả 7 bảng do AI tạo; kiểm tra lại tên cột (created_at, voucher_id) khớp với mã DBML trên dbdiagram.io.
* Cách kiểm chứng:
  - Nhập mã DBML lên dbdiagram.io kiểm tra không còn báo lỗi/cảnh báo vàng.
  - Gán thành viên TV2 review thẻ [DB] ERD trên Trello và đối chiếu danh sách User Story TM-11, TM-12.
* Tỷ lệ nội dung AI còn giữ lại (ước lượng): 90%
* Điều học được: Khóa ngoại trong DBML nếu không khai báo not null sẽ mặc định là Nullable, dẫn đến lệch chuẩn với toán tử quan hệ >; hiểu rõ tầm quan trọng của việc lưu snapshot giá trong thiết kế hóa đơn bán hàng.
