# Đề cương đồ án – Nhóm Nóm 9

## 1. Thông tin chung

| Mục | Nội dung |
| --- | --- |
| Đề tài | Thương mại điện tử |
| Tên sản phẩm | Website bán sách "Mọt Sách" |
| Lớp, nhóm | CĐ CNTT 24WEBD – Nhóm TLS |
| Repository | [https://github.com/buivantin/Do_An_Chuyen_Nganh_Web_TMDT] (Private, đã mời GV) |
| Board Trello | [https://trello.com/b/mLdq6ncl/da-tmdt-bookstore] (đã mời GV) |
| Ngày lập | 09/11/2026 |

## 2. Thành viên và vai trò

| Mã | Họ tên | MSSV | Vai trò | Email | Phụ trách chính |
| --- | --- | --- | --- | --- | --- |
| TV1 | BÙI VĂN TÍN | 0306241414 | LE – Leader (trưởng nhóm) | 0306241414@caothang.edu.vn | Quản lý dự án, Trello, TM-14, TM-08 |
| TV2 | VÕ TRẦN ĐỈNH SƠN | 0306241398 | BE 1 – Backend 1 | 03062413982@caothang.edu.vn | Xác thực, nghiệp vụ chính, TM-04, TM-06 |
| TV3 | NGUYỄN TRỌNG LAM | 0306241377 | FE – Frontend | 0306241377@caothang.edu.vn | Giao diện người dùng, TM-01, TM-02, TM-03 |
| TV4 | VÕ NGỌC TIÊN | 0306241411 | BE 2 – Backend 2 (CSDL) | 0306241411@caothang.edu.vn | ERD, migration, quản trị, TM-11, TM-12 |
| TV5 | BÙI VĂN TÍN | 0306241414 | GT – Git & Tester | 0306241414@caothang.edu.vn | Quy tắc Git, review PR, kiểm thử, TM-05, TM-07, TM-13 |

## 3. Công nghệ

| Thành phần | Lựa chọn | Lý do chọn |
| --- | --- | --- |
| Backend | Laravel 10+ | Nhóm đã được học và tiếp xúc. Laravel là framework PHP phổ biến, tách biệt MVC giúp code có tổ chức, dễ bảo trì. Có sẵn bảo vệ chống CSRF, SQL Injection, XSS, mã hóa mật khẩu an toàn. |
| Frontend | ReactJS + Tailwind CSS | Chia nhỏ ứng dụng thành các component độc lập. Tailwind giúp viết CSS nhanh, xử lý Responsive tốt, hệ sinh thái thư viện khổng lồ. |
| Cơ sở dữ liệu | MySQL | Hiệu suất cao, ổn định, bảo mật tốt. Đảm bảo tính toàn vẹn dữ liệu cho các giao dịch mua bán. |
| Kiến trúc | Controller – Service – Repository | Tách biệt nghiệp vụ, dễ dàng viết Unit Test và bảo trì. |
| Công cụ | Git/GitHub, Trello, VS Code, AI (Gemini/ChatGPT) | Quản lý mã nguồn, quản lý tiến độ và hỗ trợ lập trình. |

## 4. Phạm vi chức năng

**Bắt buộc (Must):**
| Mã | Chức năng | Người phụ trách |
| --- | --- | --- |
| TM-01 | Trang chủ hiển thị sản phẩm mới và theo danh mục | TV3 |
| TM-02 | Tìm kiếm, lọc sản phẩm (phân trang server) | TV3 |
| TM-03 | Xem chi tiết sản phẩm | TV3 |
| TM-04 | Đăng ký, đăng nhập, phân quyền | TV2 |
| TM-05 | Quản lý giỏ hàng (Thêm, sửa, xóa, chặn vượt tồn kho) | TV5 |
| TM-06 | Đặt hàng (COD), tạo đơn trong transaction | TV2 |
| TM-07 | Đơn hàng của tôi (Xem danh sách, chi tiết, hủy đơn) | TV5 |
| TM-08 | Hồ sơ cá nhân (Sửa thông tin, đổi mật khẩu) | TV1 |
| TM-11 | Quản lý danh mục (CRUD, chặn xóa nếu có sản phẩm) | TV4 |
| TM-12 | Quản lý sản phẩm (CRUD, tải ảnh, tìm kiếm, phân trang) | TV4 |
| TM-13 | Quản lý đơn hàng (Cập nhật trạng thái) | TV5 |
| TM-14 | Quản lý người dùng (Danh sách, tìm kiếm, khóa/mở khóa) | TV1 |

**Cộng điểm (Could), làm khi còn thời gian:**
* TM-09: Đánh giá sản phẩm (1-5 sao).
* TM-10: Thanh toán online thử (VNPay/MoMo sandbox).
* TM-15: Thống kê doanh thu.
* TM-16: Mã giảm giá.

**Ngoài phạm vi (Không làm):** Nhiều người bán (marketplace), biến thể sản phẩm (size, màu), tích hợp đơn vị vận chuyển, hoàn tiền, chat với người bán.

## 5. Rủi ro và cách xử lý

| Rủi ro | Mức độ | Cách phòng tránh / xử lý |
| --- | --- | --- |
| Thành viên chưa quen công nghệ đã chọn | Cao | Chia sẻ tài liệu, hỗ trợ chéo (Pair-programming) trong tuần đầu tiên. |
| Xung đột mã nguồn (Conflict) khi nhiều người sửa cùng tệp | Trung bình | Tuân thủ quy tắc Git: Tạo nhánh riêng cho từng chức năng, pull `develop` mỗi ngày. |
| Trễ tiến độ chức năng nghiệp vụ chính (Giỏ hàng, Đặt hàng) | Cao | Ưu tiên làm sớm ở Sprint S2, S3. TV1 và TV5 hỗ trợ review code kỹ lưỡng. |

## 6. Kế hoạch sprint

| Sprint | Thời gian | Mục tiêu |
| --- | --- | --- |
| S1 | Buổi 1 → Buổi 2 | Thiết kế (ERD, use case, wireframe), khung dự án, đăng ký/đăng nhập; tag `v0.1` |
| S2 – S3 | Buổi 2 → Buổi 4 | CRUD cơ bản, Trang chủ, Giỏ hàng, Quản lý người dùng; demo 70%; tag `v0.5` |
| S4 – S5 | Buổi 4 → Buổi 6 | Hoàn thiện Đặt hàng, Quản lý đơn, unit test, kiểm thử chéo, báo cáo; tag `v1.0` |

## 7. Duyệt đề cương

- Ý kiến giảng viên: [Giảng viên điền]
- Kết quả: ☐ Duyệt  ☐ Duyệt có chỉnh sửa  ☐ Làm lại
