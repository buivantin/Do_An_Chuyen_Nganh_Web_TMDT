# MÔ TẢ CHI TIẾT CƠ SỞ DỮ LIỆU (ERD V3 - 3NF)

## 1. Lý do thiết kế và chuẩn hóa dữ liệu (3NF)
- **Tính toàn vẹn lịch sử giao dịch (`order_items.price` & `orders.shipping_fee`):** Giá sản phẩm trong bảng `products` và phí vận chuyển có thể bị biến động theo thời gian (tăng/giảm giá, khuyến mãi). Việc lưu cố định `price` tại thời điểm mua vào `order_items` và `shipping_fee` vào `orders` giúp hóa đơn lịch sử độc lập, không bị tính sai lệch khi dữ liệu gốc thay đổi trong tương lai.
- **Bảo vệ dữ liệu lịch sử & Chống xóa nhầm (`is_deleted` & `RESTRICT`):** Áp dụng cờ xóa mềm (`is_deleted`) cho bảng `products` và ràng buộc `RESTRICT ON DELETE` cho khóa ngoại liên kết sản phẩm/danh mục, ngăn chặn việc xóa mất thông tin sách đã tồn tại trong các đơn hàng cũ.
- **Tích hợp điều kiện thành viên VIP vào hệ thống khuyến mãi (`users` & `vouchers`):** Lưu trực tiếp tổng chi tiêu tích lũy (`total_spent`) và hạng thành viên (`membership_tier`) trên bảng `users`, kết hợp điều kiện áp dụng (`min_spent`, `membership_tier`, `min_order_value`) ngay trong bảng `vouchers` giúp giảm số lượng bảng trung gian mà vẫn kiểm soát chặt chẽ quyền lợi từng cấp bậc khách hàng.

---

## 2. Danh sách bảng và thuộc tính

### 2.1 Bảng `users` (Người dùng)
- **`id`** (INT, PK, Auto Increment): Mã người dùng.
- **`username`** (NVARCHAR, NOT NULL): Tên tài khoản.
- **`email`** (VARCHAR, NOT NULL, UNIQUE): Email (Ràng buộc: Duy nhất).
- **`password`** (VARCHAR, NOT NULL): Mật khẩu mã hóa.
- **`phone`** (VARCHAR): Số điện thoại mặc định.
- **`address`** (NVARCHAR): Địa chỉ giao hàng mặc định.
- **`total_spent`** (DECIMAL): Tổng tiền tích lũy từ các đơn hàng hoàn thành.
- **`membership_tier`** (NVARCHAR): Hạng thành viên hiện tại (`regular`, `silver`, `gold`, `diamond`).
- **`status`** (NVARCHAR): Trạng thái tài khoản (Active/Inactive).
- **`image_path`** (VARCHAR): Đường dẫn ảnh đại diện.
- **`role`** (VARCHAR): Vai trò (Admin/Customer).
- **`created_at`** (TIMESTAMP): Thời gian tạo.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.

### 2.2 Bảng `categories` (Danh mục)
- **`id`** (INT, PK, Auto Increment): Mã danh mục.
- **`name`** (NVARCHAR, NOT NULL, UNIQUE): Tên danh mục (Ràng buộc: Duy nhất).
- **`description`** (NVARCHAR): Mô tả danh mục.
- **`status`** (NVARCHAR): Trạng thái danh mục.
- **`created_at`** (TIMESTAMP): Thời gian tạo.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.

### 2.3 Bảng `products` (Sản phẩm)
- **`id`** (INT, PK, Auto Increment): Mã sản phẩm.
- **`name`** (NVARCHAR, NOT NULL): Tên sản phẩm. (Có **Index**)
- **`author`** (NVARCHAR): Tên tác giả cuốn sách.
- **`publisher`** (NVARCHAR): Nhà xuất bản cuốn sách.
- **`published_year`** (INT): Năm xuất bản.
- **`page_count`** (INT): Số trang sách.
- **`description`** (NVARCHAR): Mô tả sản phẩm.
- **`status`** (NVARCHAR): Trạng thái ẩn/hiện.
- **`price`** (DECIMAL, NOT NULL): Giá bán hiện tại.
- **`category_id`** (INT, FK, NOT NULL): Mã danh mục liên kết. (Có **Index**)
- **`image`** (VARCHAR): Đường dẫn ảnh đại diện.
- **`stock`** (INT, NOT NULL): Số lượng tồn kho (Ràng buộc: `stock >= 0`).
- **`is_deleted`** (BOOLEAN): Cờ đánh dấu xóa mềm sản phẩm ngừng kinh doanh.
- **`created_at`** (TIMESTAMP): Thời gian tạo.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.

### 2.4 Bảng `cart_items` (Giỏ hàng)
- **`id`** (INT, PK, Auto Increment): Mã dòng giỏ hàng.
- **`user_id`** (INT, FK, NOT NULL): Mã người dùng sở hữu.
- **`product_id`** (INT, FK, NOT NULL): Mã sản phẩm chọn mua.
- **`quantity`** (INT, NOT NULL): Số lượng mua.
- **`created_at`** (TIMESTAMP): Thời gian thêm vào giỏ.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.
*(Có **Composite Unique Index**: `(user_id, product_id)` để chống lưu trùng cùng một sản phẩm trong giỏ hàng)*

### 2.5 Bảng `vouchers` (Mã giảm giá & Ưu đãi thành viên)
- **`id`** (INT, PK, Auto Increment): Mã voucher.
- **`name`** (NVARCHAR, NOT NULL): Tên chương trình khuyến mãi / ưu đãi hạng.
- **`code`** (VARCHAR, NOT NULL, UNIQUE): Mã giảm giá (Ràng buộc: Duy nhất).
- **`discount_amount`** (DECIMAL, NOT NULL): Số tiền giảm.
- **`min_order_value`** (DECIMAL): Giá trị đơn hàng tối thiểu để áp mã.
- **`min_spent`** (DECIMAL): Tổng chi tiêu tích lũy tối thiểu của khách hàng để đủ điều kiện nhận mã.
- **`membership_tier`** (NVARCHAR): Hạng thành viên VIP được áp dụng (`NULL` = mọi khách hàng; `silver` / `gold` / `diamond` = theo hạng).
- **`status`** (NVARCHAR): Trạng thái áp dụng (Active/Inactive/Expired).
- **`start_date`** (DATETIME, NOT NULL): Thời gian bắt đầu hiệu lực.
- **`expiration_date`** (DATETIME, NOT NULL): Thời gian kết thúc hiệu lực.
- **`requirement`** (NVARCHAR): Mô tả điều kiện áp dụng.
- **`created_at`** (TIMESTAMP): Thời gian tạo.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.

### 2.6 Bảng `orders` (Đơn hàng)
- **`id`** (INT, PK, Auto Increment): Mã đơn hàng.
- **`receiver_name`** (NVARCHAR, NOT NULL): Tên người nhận hàng thực tế.
- **`phone`** (VARCHAR, NOT NULL): Số điện thoại người nhận hàng.
- **`address`** (NVARCHAR, NOT NULL): Địa chỉ giao hàng.
- **`note`** (NVARCHAR): Ghi chú đơn hàng của khách.
- **`status`** (NVARCHAR, NOT NULL): Trạng thái đơn (Chờ duyệt/Đang giao/Đã hủy/Hoàn thành).
- **`payment_method`** (NVARCHAR, NOT NULL): Phương thức thanh toán (COD, VNPAY, MOMO, BANKING).
- **`shipping_fee`** (DECIMAL): Phí vận chuyển áp dụng cho đơn hàng.
- **`total_amount`** (DECIMAL, NOT NULL): Tổng tiền hóa đơn.
- **`user_id`** (INT, FK, NOT NULL): Mã người mua hàng.
- **`voucher_id`** (INT, FK, NULLABLE): Mã voucher áp dụng (nếu có).
- **`created_at`** (TIMESTAMP): Thời gian đặt hàng.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.
*(Có **Composite Index**: `(user_id, status)` để tăng tốc độ tra cứu lịch sử mua hàng theo trạng thái)*

### 2.7 Bảng `order_items` (Chi tiết đơn hàng)
- **`id`** (INT, PK, Auto Increment): Mã chi tiết đơn hàng.
- **`order_id`** (INT, FK, NOT NULL): Mã đơn hàng liên kết.
- **`product_id`** (INT, FK, NOT NULL): Mã sản phẩm liên kết.
- **`price`** (DECIMAL, NOT NULL): Giá bán tại thời điểm đặt hàng.
- **`quantity`** (INT, NOT NULL): Số lượng đã mua.
- **`created_at`** (TIMESTAMP): Thời gian tạo.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.

### 2.8 Bảng `reviews` (Đánh giá sản phẩm)
- **`id`** (INT, PK, Auto Increment): Mã đánh giá.
- **`user_id`** (INT, FK, NOT NULL): Mã người dùng đánh giá.
- **`product_id`** (INT, FK, NOT NULL): Mã sản phẩm được đánh giá.
- **`rating`** (INT, NOT NULL): Số sao đánh giá (Ràng buộc: từ 1 đến 5).
- **`comment`** (NVARCHAR): Nội dung nhận xét chi tiết.
- **`status`** (VARCHAR): Trạng thái hiển thị kiểm duyệt (Visible/Hidden).
- **`created_at`** (TIMESTAMP): Thời gian gửi đánh giá.
- **`updated_at`** (TIMESTAMP): Thời gian cập nhật.
*(Có **Composite Unique Index**: `(user_id, product_id)` đảm bảo mỗi khách hàng chỉ đánh giá 1 lần trên mỗi sản phẩm)*