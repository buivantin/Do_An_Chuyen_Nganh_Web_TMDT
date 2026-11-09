# Đề cương đồ án – Nhóm TLS

> Mẫu đề cương 1 trang, nộp ở tiết 5 buổi 1 để giảng viên duyệt. Thay mọi chỗ trong `[...]`, xóa các dòng ghi chú bắt đầu bằng `>` trước khi commit.

## 1. Thông tin chung

| Mục | Nội dung |
| --- | --- |
| Đề tài |Thương mại điện tử|
| Tên sản phẩm | Website bán sách BookStore|
| Lớp, nhóm | CĐ CNTT 24WEBD – Nhóm TLS |
| Repository | [https://github.com/...] (Private, đã mời GV) |
| Board Trello | [https://trello.com/b/...] (đã mời GV) |
| Ngày lập | 09/11/2026 |

## 2. Thành viên và vai trò

| Mã | Họ tên | MSSV | Vai trò | Email | Phụ trách chính |
| --- | --- | --- | --- | --- | --- |
| TV1 | BÙI VĂN TÍN | 0306241414 | LE – Leader (trưởng nhóm) | 0306241414@caothang.edu.vn | Quản lý dự án, Trello, [mã chức năng] |
| TV2 | VÕ TRẦN ĐỈNH SƠN | 0306241398 | BE 1 – Backend 1 | 03062413982@caothang.edu.vn | Xác thực, nghiệp vụ chính, [mã] |
| TV3 | NGUYỄN TRỌNG LAM | 0306241377 | FE – Frontend | 030624177@caothang.edu.vn | Giao diện người dùng, [mã] |
| TV4 | VÕ NGỌC TIÊN | 0306241411 | BE 2 – Backend 2 (CSDL) |  0306241411@caothang.edu.vn | ERD, migration, quản trị, [mã] |
| TV5 | BÙI VĂN TÍN | 0306241414 | GT – Git & Tester | 0306241414@caothang.edu.vn | Quy tắc Git, review PR, kiểm thử, [mã] |

## 3. Công nghệ

| Thành phần | Lựa chọn | Lý do chọn |
| --- | --- | --- |
| Backend | Laravel 10+ | Nhóm đã được học, tiếp xúc và làm việc trên Laravel. Laravel là framework PHP phổ biến nhất hiện nay.Tách biệt Model, View, Controller giúp code có tổ chức, dễ bảo trì và làm việc nhóm.Code gọn gàng, dễ đọc, có tài liệu chính thức rất đầy đủ và cộng đồng lớn nên dễ tìm hướng dẫn khi gặp lỗi.Có sẵn bảo vệ chống CSRF, SQL Injection, XSS, mã hóa mật khẩu bằng bcrypt/Argon2, cùng hệ thống xác thực|
| Frontend | ReactJS + Tailwind | Nhóm đã được học, tiếp xúc và làm việc trên React, React chia nhỏ ứng dụng thành các component độc lập, trong khi Tailwind cho phép viết trực tiếp các lớp tiện ích (utility classes) vào thẻ HTML/JSX.Tốc độ phát triển vượt trộ. Hiệu suất và dung lượng file tối ưu. Xử lý Responsive và Trạng thái trực qua. Hệ thống thiết kế (Design System) nhất quán. Hệ sinh thái thư viện khổng lồ|
| Cơ sở dữ liệu | MySQL | Nhóm đã được học, tiếp xúc và làm việc trên MySQL. Hiệu suất cao và cực kỳ ổn định. Tính bảo mật cao. Khả năng mở rộng (Scalability) mạnh mẽ. Mã nguồn mở và tối ưu chi phí.Đảm bảo tính toàn vẹn dữ liệu. |
| Kiến trúc | Controller – Service – Repository | Tách nghiệp vụ, dễ viết unit test |
| Công cụ | Git/GitHub, Trello, [VS Code], [AI: ChatGPT/Claude/Copilot] | |

## 4. Phạm vi chức năng

Bắt buộc (Must) – mã theo đặc tả đề tài:

| Mã | Chức năng | Người phụ trách |
| --- | --- | --- |
| [XX-01] | [...] | [TV...] |
| [XX-02] | [...] | [TV...] |
| ... | ... | ... |

Cộng điểm (Could), làm khi còn thời gian: [XX-.., XX-..]

Ngoài phạm vi (không làm): [thanh toán thật, ứng dụng di động, ...]

## 5. Rủi ro và cách xử lý

| Rủi ro | Mức độ | Cách phòng tránh / xử lý |
| --- | --- | --- |
| [Thành viên chưa quen công nghệ đã chọn] | [Cao] | [Pair-programming tuần 1, dùng mẫu khung dự án chung] |
| [Xung đột Git khi nhiều người sửa cùng tệp] | [Trung bình] | [Nhánh nhỏ theo chức năng, pull `develop` mỗi ngày] |
| [Trễ tiến độ chức năng nghiệp vụ chính] | [Cao] | [Ưu tiên làm sớm ở sprint S2, có người dự phòng] |

## 6. Kế hoạch sprint

| Sprint | Thời gian | Mục tiêu |
| --- | --- | --- |
| S1 | Buổi 1 → Buổi 2 | Thiết kế (ERD, use case, wireframe), khung dự án, đăng ký/đăng nhập; tag `v0.1` |
| S2 – S3 | Buổi 2 → Buổi 4 | CRUD, tìm kiếm, nghiệp vụ chính; demo 70%; tag `v0.5` |
| S4 – S5 | Buổi 4 → Buổi 6 | Hoàn thiện, unit test, kiểm thử chéo, báo cáo; tag `v1.0` |

## 7. Duyệt đề cương

- Ý kiến giảng viên: [...]
- Kết quả: ☐ Duyệt  ☐ Duyệt có chỉnh sửa  ☐ Làm lại
