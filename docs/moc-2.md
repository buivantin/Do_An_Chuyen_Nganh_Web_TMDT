# BÁO CÁO TIẾN ĐỘ MỐC 2 - NHÓM 09

**Thời điểm báo cáo:** 23:00 Ngày 9 (chủ nhật)
**Người lập:** TV1 - Bùi Văn Tín

## 1. Bảng tổng hợp tiến độ các chức năng (Sprint S3)

| Mã | Tên chức năng | Người phụ trách | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| TM-01 | Trang chủ | TV3 | Đã merge | Hoàn thiện |
| TM-02 | Tìm kiếm, lọc | TV3 | Đã merge | Phân trang server |
| TM-03 | Chi tiết sản phẩm | TV3 | Đã merge | Có nút thêm vào giỏ |
| TM-04 | Đăng ký, đăng nhập | TV2 | Đã merge | Phân quyền Admin/Customer |
| TM-05 | Giỏ hàng | TV5 | Đã merge | Chặn vượt tồn kho |
| TM-06 | Đặt hàng (COD) | TV2 | Đã merge | Có transaction |
| TM-07 | Đơn hàng của tôi | TV5 | Đang review | Đã có nút Hủy đơn |
| TM-08 | Hồ sơ cá nhân | TV1 | Đã merge | Có đổi mật khẩu, up avatar |
| TM-11 | Quản lý danh mục | TV4 | Đã merge | Chặn xóa danh mục có sách |
| TM-12 | Quản lý sản phẩm | TV4 | Đã merge | CRUD + Upload ảnh |
| TM-13 | Quản lý đơn hàng | TV5 | Đang review | Chờ test chuyển trạng thái |
| TM-14 | Quản lý người dùng | TV1 | Đã merge | Chặn tự khóa mình |

**Tổng kết:** Đã merge 10/12 chức năng bắt buộc (Đạt 83% - Vượt mục tiêu 9/12).
**Rủi ro:** Không có rủi ro lớn. Các PR còn lại (TM-07, TM-13) sẽ được merge trước 21:00.

## 2. Kịch bản Demo thử nội bộ (20:30)
*(Xem chi tiết tại file `docs/meetings/04.md`)*
- **TV3:** Trang chủ -> Tìm kiếm -> Chi tiết.
- **TV5:** Thêm vào giỏ -> Vào giỏ -> Đặt hàng (Khách).
- **TV2:** Xem đơn hàng vừa đặt.
- **TV5:** Hủy đơn -> Kiểm tra Admin xem đơn.
- **TV1:** Đăng nhập Admin -> Khóa tài khoản -> Xem thống kê.