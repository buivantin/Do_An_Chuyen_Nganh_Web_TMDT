# MÔ TẢ CHI TIẾT CƠ SỞ DỮ LIỆU (ERD V2 - 3NF)

## 1. Lý do `order_item` cần lưu cột `price` (Giá tại thời điểm mua)
* **Tính toàn vẹn lịch sử giao dịch:** Giá sản phẩm trong bảng `products` có thể bị biến động theo thời gian (tăng/giảm giá, khuyến mãi). Nếu không lưu giá tại thời điểm mua vào `order_item`, khi giá sản phẩm thay đổi thì tổng giá trị các đơn hàng trong quá khứ sẽ bị tính sai lệch.
* **Tính độc lập dữ liệu:** Đơn hàng là một chứng từ hóa đơn cố định. Việc lưu `price` riêng giúp hóa đơn không bị phụ thuộc vào sự thay đổi dữ liệu danh mục trong tương lai.

---

## 2. Danh sách bảng và thuộc tính

### 2.1 Bảng `users` (Người dùng)
* **`id`** (INT, PK, Auto Increment): Mã người dùng.
* **`username`** (NVARCHAR, NOT NULL): Tên tài khoản.
* **`email`** (VARCHAR, NOT NULL, UNIQUE): Email (Ràng buộc: Duy nhất).
* **`password`** (VARCHAR, NOT NULL): Mật khẩu mã hóa.
* **`status`** (NVARCHAR): Trạng thái tài khoản (Active/Banned).
* **`image_path`** (VARCHAR): Đường dẫn ảnh đại diện.
* **`role`** (VARCHAR): Vai trò (Admin/Customer).
* **`created_at`** (TIMESTAMP): Thời gian tạo.

### 2.2 Bảng `categories` (Danh mục)
* **`id`** (INT, PK, Auto Increment): Mã danh mục.
* **`name`** (NVARCHAR, NOT NULL): Tên danh mục.
* **`description`** (NVARCHAR): Mô tả danh mục.
* **`status`** (NVARCHAR): Trạng thái danh mục.

### 2.3 Bảng `products` (Sản phẩm)
* **`id`** (INT, PK, Auto Increment): Mã sản phẩm.
* **`name`** (NVARCHAR, NOT NULL): Tên sản phẩm. (Có **Index**)
* **`description`** (NVARCHAR): Mô tả sản phẩm.
* **`status`** (NVARCHAR): Trạng thái ẩn/hiện.
* **`price`** (DECIMAL, NOT NULL): Giá bán hiện tại.
* **`category_id`** (INT, FK, NOT NULL): Mã danh mục liên kết. (Có **Index**)
* **`image`** (VARCHAR): Đường dẫn ảnh đại diện.
* **`stock`** (INT, NOT NULL): Số lượng tồn kho (Ràng buộc: `stock >= 0`).

### 2.4 Bảng `cart_item` (Giỏ hàng)
* **`id`** (INT, PK, Auto Increment): Mã dòng giỏ hàng.
* **`user_id`** (INT, FK, NOT NULL): Mã người dùng sở hữu.
* **`product_id`** (INT, FK, NOT NULL): Mã sản phẩm chọn mua.
* **`quantity`** (INT, NOT NULL): Số lượng mua.

### 2.5 Bảng `voucher` (Mã giảm giá)
* **`id`** (INT, PK, Auto Increment): Mã voucher.
* **`name`** (NVARCHAR): Tên chương trình.
* **`code`** (VARCHAR, NOT NULL, UNIQUE): Mã giảm giá (Ràng buộc: Duy nhất).
* **`discount_amount`** (DECIMAL): Số tiền giảm.
* **`status`** (NVARCHAR): Trạng thái áp dụng.
* **`start_date`** (DATETIME): Ngày bắt đầu.
* **`expiration_date`** (DATETIME): Ngày hết hạn.
* **`requirement`** (NVARCHAR): Điều kiện áp dụng.

### 2.6 Bảng `order` (Đơn hàng)
* **`id`** (INT, PK, Auto Increment): Mã đơn hàng.
* **`status`** (NVARCHAR, NOT NULL): Trạng thái đơn (Chờ duyệt/Đang giao/Đã hủy/Hoàn thành).
* **`address`** (NVARCHAR, NOT NULL): Địa chỉ giao hàng.
* **`payment_method`** (NVARCHAR, NOT NULL): Phương thức thanh toán (COD, VNPAY,...).
* **`total_amount`** (DECIMAL, NOT NULL): Tổng tiền hóa đơn.
* **`user_id`** (INT, FK, NOT NULL): Mã người mua hàng.
* **`voucher_id`** (INT, FK, NULLABLE): Mã voucher áp dụng (nếu có).
* **`created_at`** (TIMESTAMP): Thời gian đặt hàng.
*(Có **Composite Index**: `(user_id, status)` để tăng tốc độ tra cứu lịch sử mua hàng theo trạng thái)*

### 2.7 Bảng `order_item` (Chi tiết đơn hàng)
* **`id`** (INT, PK, Auto Increment): Mã chi tiết đơn hàng.
* **`order_id`** (INT, FK, NOT NULL): Mã đơn hàng liên kết.
* **`product_id`** (INT, FK, NOT NULL): Mã sản phẩm liên kết.
* **`price`** (DECIMAL, NOT NULL): Giá bán tại thời điểm đặt hàng.
* **`quantity`** (INT, NOT NULL): Số lượng đã mua.