# Mẫu Test Case - Hệ thống Thương mại điện tử (Mọt Sách)

## Thông tin chung
- **Tên hệ thống:** Website Bán Sách Mọt Sách
- **Người thực hiện:** Bùi Văn Tín (TV5 - QA)
- **Ngày cập nhật:** 11/11/2026

## 1. Test Case cho chức năng TM-05: Quản lý Giỏ hàng
*(Tiêu chí: Thêm, sửa số lượng, xóa; không cho vượt tồn kho; tính tổng tiền; lưu CSDL)*

| ID | Mã chức năng | Bước thực hiện | Dữ liệu | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | TM-05 | 1. Đăng nhập.<br>2. Vào trang chi tiết sản phẩm.<br>3. Nhấn nút "Thêm vào giỏ hàng". | Sản phẩm A (Giá: 50.000đ, Tồn kho: 10). Giỏ hàng đang trống. | 1. Hệ thống báo thêm thành công.<br>2. Icon giỏ hàng hiển thị số 1.<br>3. CSDL lưu bản ghi mới vào bảng `cart_items`. | *(Chờ test)* |
| **TC-02** | TM-05 | 1. Đăng nhập.<br>2. Vào trang chi tiết sản phẩm.<br>3. Nhấn nút "Thêm vào giỏ hàng" (Lần 2). | Sản phẩm B (Tồn kho: 1). Khách đã thêm SP B vào giỏ 1 lần trước đó. | 1. Hệ thống báo lỗi "Số lượng vượt quá tồn kho".<br>2. Không thêm được SP B vào giỏ (số lượng vẫn giữ nguyên là 1). | *(Chờ test)* |
| **TC-03** | TM-05 | 1. Đăng nhập.<br>2. Mở trang Giỏ hàng.<br>3. Sửa số lượng từ 1 thành 3.<br>4. Nhấn nút "Cập nhật". | Sản phẩm A (Giá: 50.000đ). Giỏ hàng đang có 1 SP A. Tồn kho hiện tại là 10. | 1. Số lượng SP A cập nhật thành 3.<br>2. Tổng tiền giỏ hàng tự động tính lại thành 150.000đ.<br>3. CSDL cập nhật lại cột `quantity` = 3. | *(Chờ test)* |
| **TC-04** | TM-05 | 1. Đăng nhập.<br>2. Mở trang Giỏ hàng.<br>3. Sửa số lượng từ 1 thành 15.<br>4. Nhấn nút "Cập nhật". | Sản phẩm A (Tồn kho: 10). Giỏ hàng đang có 1 SP A. | 1. Hệ thống báo lỗi "Số lượng vượt quá tồn kho (Chỉ còn 10)".<br>2. Số lượng trong giỏ giữ nguyên là 1.<br>3. Tổng tiền không thay đổi. | *(Chờ test)* |
| **TC-05** | TM-05 | 1. Đăng nhập.<br>2. Mở trang Giỏ hàng.<br>3. Nhấn nút "Xóa" ở sản phẩm.<br>4. Nhấn "Đồng ý". | Sản phẩm A trong giỏ. | 1. Sản phẩm A biến mất khỏi giỏ hàng.<br>2. Tổng tiền giỏ hàng giảm đi tương ứng.<br>3. CSDL xóa bản ghi tương ứng trong bảng `cart_items`. | *(Chờ test)* |