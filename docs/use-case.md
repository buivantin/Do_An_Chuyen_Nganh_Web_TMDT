# ĐẶC TẢ YÊU CẦU CHỨC NĂNG (USE CASE SPECIFICATION)

## 0. Sơ đồ Use Case
![Sơ đồ Use Case](./use-case-diagram.png)

## 1. Danh sách Tác nhân (Actors)
- **Khách vãng lai (Guest):** Người chưa đăng nhập. Chỉ có quyền xem thông tin.
- **Khách hàng (Customer):** Người đã đăng nhập. Kế thừa quyền của Guest, có quyền mua hàng, quản lý giỏ hàng và tài khoản cá nhân.
- **Quản trị viên (Admin):** Người quản lý hệ thống. Có toàn quyền CRUD dữ liệu, quản lý đơn hàng và người dùng.

---

## 2. ĐẶC TẢ CHI TIẾT CÁC USE CASE (Dành cho Lập trình viên)

### 2.1. NHÓM CHỨC NĂNG KHÁCH VÃNG LAI (GUEST)

#### UC-G1: Xem trang chủ (TM-01)
- **Tác nhân:** Khách vãng lai (Guest), Khách hàng (Customer).
- **Mô tả:** Hiển thị giao diện chính bao gồm thanh menu danh mục, khối baner quảng cáo, khối sách bán chạy và sách mới.
- **Tiền điều kiện:** 
  - Người dùng truy cập vào đường dẫn `/`.
  - Cơ sở dữ liệu (CSDL) phải có sẵn dữ liệu ở các bảng: `categories` (status='active'), `products` (status='active', is_deleted=false).
- **Luồng chính:**
  1. Người dùng truy cập đường dẫn `/`. Frontend kích hoạt trạng thái hiển thị khung xương (Skeleton Loading).
  2. Hệ thống (Backend) truy vấn bảng `categories` để lấy danh sách các danh mục đang hoạt động (`status = 'active'`).
  3. Hệ thống truy vấn bảng `products` để lấy 8 sách mới nhất (sắp xếp theo `created_at` giảm dần, điều kiện `status = 'active'` và `is_deleted = false`).
  4. Hệ thống truy vấn kết hợp bảng `products` và `order_items` để tính tổng số lượng đã bán, lấy ra top 5 sách bán chạy nhất (điều kiện sách đang active).
  5. Hệ thống truy vấn bảng `reviews` để tính điểm trung bình (`AVG(rating)`) và tổng số lượt đánh giá (`COUNT(id)`) cho từng cuốn sách ở bước 3 và 4.
  6. Backend trả về dữ liệu (JSON) cho Frontend.
  7. Frontend hiển thị giao diện: Thanh Menu danh mục, khối "Sách mới nhất" (dạng Slider), khối "Sách bán chạy" (dạng Lưới). Giao diện tự động co giãn (Responsive) trên màn hình 360px đến 1366px.
- **Luồng ngoại lệ:**
  - **Mất kết nối API / Lỗi Server 500:** Hiển thị thông báo *"Không thể tải dữ liệu trang chủ. Vui lòng F5 để thử lại."*
  - **CSDL chưa có sách nào:** Ẩn các khối sách, hiển thị dòng chữ *"Chưa có sách nào được cập nhật."* (Không được để trắng trang).
  - **Sách chưa có đánh giá:** Nếu `reviews` trống, ẩn phần hiển thị ngôi sao, không hiển thị `0 sao`.
  - **Sách hết hàng (stock = 0):** Nút "Thêm vào giỏ" trên thẻ sách bị vô hiệu hóa (Disabled) và đổi chữ thành "Hết hàng".
  - **Khách chưa đăng nhập bấm "Thêm vào giỏ":** Không gọi API, hiển thị Popup yêu cầu đăng nhập.

#### UC-G2: Tìm kiếm / Lọc sản phẩm
- **Tác nhân:** Guest, Customer.
- **Mô tả:** Tìm sách theo tên, tác giả hoặc lọc theo danh mục/khoảng giá.
- **Luồng chính:**
  1. Người dùng nhập từ khóa vào ô tìm kiếm (hoặc chọn danh mục, kéo thanh trượt chọn giá).
  2. Hệ thống gọi API `/api/products?keyword=...&category_id=...&min_price=...&max_price=...&sort=...`.
  3. Backend thực hiện câu lệnh SQL `WHERE name LIKE %keyword%` kết hợp các điều kiện lọc.
  4. Trả về kết quả **phân trang (Pagination)** (VD: 12 sản phẩm/trang).
- **Luồng ngoại lệ:** Không tìm thấy kết quả -> Hiển thị màn hình "Không tìm thấy sản phẩm nào phù hợp".

#### UC-G3: Xem chi tiết sản phẩm
- **Tác nhân:** Guest, Customer.
- **Mô tả:** Xem thông tin chi tiết của một cuốn sách.
- **Luồng chính:**
  1. Người dùng click vào một thẻ sản phẩm.
  2. Hệ thống gọi API `/api/products/{id}`.
  3. Hiển thị: Ảnh, Tên, Tác giả, Giá, Mô tả, Số lượng tồn kho (`stock`), Danh mục.
  4. Có nút "Thêm vào giỏ hàng".
- **Luồng ngoại lệ:** Sản phẩm không tồn tại (`id` sai) -> Báo lỗi 404 "Sản phẩm không tồn tại hoặc đã bị ẩn".

#### UC-G4: Đăng ký tài khoản
- **Tác nhân:** Guest.
- **Mô tả:** Tạo tài khoản Khách hàng mới.
- **Luồng chính:**
  1. Người dùng nhập Họ tên, Email, Mật khẩu, Nhập lại mật khẩu.
  2. Frontend validate sơ bộ (định dạng email, mật khẩu >= 8 ký tự).
  3. Gọi API `/api/register`.
  4. Backend kiểm tra: 
     - Validate dữ liệu (NFR-05).
     - Kiểm tra email đã tồn tại trong CSDL chưa (Nếu có -> Báo lỗi "Email đã được sử dụng").
  5. Mã hóa mật khẩu bằng `bcrypt`.
  6. Tạo User mới với `role = 'customer'`, `status = 'active'`.
  7. Trả về thông báo thành công (không tự động đăng nhập, chuyển sang trang Login).

---

### 2.2. NHÓM CHỨC NĂNG KHÁCH HÀNG (CUSTOMER)

> **Lưu ý cho Dev:** Tất cả các API dưới đây đều phải gắn Middleware `auth:sanctum` để kiểm tra đăng nhập.

#### UC-C5: Đăng nhập (Dùng chung cho cả Admin)
- **Tác nhân:** Customer, Admin.
- **Mô tả:** Xác thực người dùng.
- **Luồng chính:**
  1. Người dùng nhập Email, Mật khẩu và nhấn "Đăng nhập".
  2. API `/api/login` kiểm tra email.
  3. Kiểm tra `status`: Nếu `status == 'locked'` -> Báo lỗi "Tài khoản đã bị khóa".
  4. So sánh mật khẩu (Hash check).
  5. Tạo Token (Laravel Sanctum). Trả về Token và thông tin User (`role`).
  6. Frontend lưu Token vào `localStorage`.
  7. **Điều hướng:** Nếu `role == 'admin'` -> chuyển hướng `/admin`. Nếu `role == 'customer'` -> chuyển hướng `/`.

#### UC-C1: Quản lý giỏ hàng
- **Tác nhân:** Customer.
- **Mô tả:** Thêm, sửa, xóa sản phẩm trong giỏ. Chặn vượt tồn kho.
- **Luồng chính (Thêm vào giỏ):**
  1. Tại trang chi tiết sản phẩm, khách nhấn "Thêm vào giỏ".
  2. Frontend kiểm tra `localStorage` có Token không. Nếu không -> Hiển thị popup yêu cầu Đăng nhập.
  3. Gọi API `POST /api/cart/add` (gửi `product_id`, `quantity`).
  4. Backend kiểm tra: Nếu `(Số lượng hiện có trong giỏ + quantity mới) > stock` -> Ném lỗi 400 "Số lượng vượt quá tồn kho".
  5. Nếu hợp lệ, `INSERT` hoặc `UPDATE` bảng `cart_items`.
- **Luồng sửa số lượng:** 
  - Cập nhật trực tiếp ở trang Giỏ hàng. Chặn nhập số âm hoặc vượt quá `stock`.
- **Luồng xóa:** 
  - Xóa bản ghi trong `cart_items`.

#### UC-C2: Đặt hàng (COD)
- **Tác nhân:** Customer.
- **Mô tả:** Chốt đơn hàng từ giỏ hàng.
- **Tiền điều kiện:** Giỏ hàng có ít nhất 1 sản phẩm.
- **Luồng chính:**
  1. Khách nhập Tên, SĐT, Địa chỉ nhận hàng. Nhấn "Đặt hàng".
  2. Backend mở **Database Transaction**.
  3. Kiểm tra lại tồn kho của tất cả sản phẩm trong giỏ một lần nữa. 
  4. Tạo Order mới (`status = 'pending'`, `total_amount = ...`).
  5. Copy dữ liệu từ `cart_items` sang `order_items` (Lưu lại giá tại thời điểm mua vào cột `price`).
  6. Trừ `stock` của bảng `products`.
  7. Xóa sạch giỏ hàng của User.
  8. **Commit Transaction**.
- **Luồng ngoại lệ:** Nếu bước 3 phát hiện có sản phẩm hết hàng -> **Rollback Transaction**, báo lỗi "Sản phẩm X không đủ số lượng".

#### UC-C3: Xem đơn hàng của tôi
- **Tác nhân:** Customer.
- **Mô tả:** Xem danh sách và chi tiết đơn hàng.
- **Luồng chính:**
  - Gọi API `GET /api/orders`. Backend chỉ `SELECT` các order có `user_id = Auth::id()` (Chặn xem đơn người khác - TM-NFR4).
- **Luồng Hủy đơn:**
  - Khách nhấn "Hủy đơn".
  - Backend kiểm tra: Chỉ cho phép hủy khi `status == 'pending'`.
  - Nếu hợp lệ: Chuyển `status = 'cancelled'` và **cộng lại `stock`** cho sản phẩm.

#### UC-C4: Xem hồ sơ cá nhân & Cập nhật
- **Tác nhân:** Customer.
- **Luồng chính:**
  - Hiển thị thông tin: Username, Email, SĐT, Địa chỉ, Ảnh đại diện.
- **Luồng cập nhật thông tin:**
  - Sửa Họ tên, SĐT. API `PUT /api/profile`.
- **Luồng cập nhật địa chỉ (Nâng cao):**
  - Sử dụng Dropdown 3 cấp gọi API của `provinces.open-api.vn` để lấy Tỉnh/Thành, Quận/Huyện, Phường/Xã. Kết hợp ô nhập Số nhà để tự động ghép thành 1 chuỗi địa chỉ hoàn chỉnh trước khi lưu vào CSDL.
- **Luồng upload ảnh (Nâng cao):**
  - Upload file ảnh (validate định dạng Image, <2MB). Backend lưu vào thư mục `public/avatars`, trả về URL và cập nhật cột `image_path`.
- **Luồng đổi mật khẩu:**
  - Bắt buộc nhập Mật khẩu cũ (để xác thực) + Mật khẩu mới (>=8 ký tự) + Nhập lại mật khẩu mới. API `PUT /api/profile/change-password`.

#### UC-C6: Đánh giá sản phẩm (Mức C)
- **Tác nhân:** Customer.
- **Luồng chính:**
  - Khách xem đơn hàng có trạng thái `completed` (Hoàn thành).
  - Cạnh mỗi sản phẩm có nút "Đánh giá".
  - Khách chọn 1-5 sao và nhập bình luận.
  - Hệ thống lưu vào bảng `reviews` (chỉ lưu 1 lần cho 1 sản phẩm trong 1 đơn).

---

### 2.3. NHÓM CHỨC NĂNG QUẢN TRỊ VIÊN (ADMIN)

> **Lưu ý cho Dev:** Tất cả API dưới đây phải gắn Middleware `auth:sanctum` + Middleware kiểm tra quyền Admin.

#### UC-A1: Quản lý danh mục (TM-11)
- **Tác nhân:** Quản trị viên (Admin).
- **Mô tả:** Xem danh sách, tìm kiếm, thêm mới, chỉnh sửa, ẩn/hiện và xóa danh mục sách trong hệ thống.
- **Tiền điều kiện:**
  - Người dùng đã đăng nhập với vai trò `admin` (token hợp lệ qua Middleware `auth:sanctum` và kiểm tra quyền Admin).
- **Luồng chính:**
  1. **Xem danh sách:** Admin truy cập trang Quản lý danh mục. Hệ thống gọi API `GET /api/admin/categories` để lấy danh sách danh mục kèm số lượng sản phẩm thuộc từng danh mục.
  2. **Thêm danh mục mới:**
     - Admin nhấn "Thêm danh mục", nhập Tên danh mục và chọn Trạng thái (`active` hoặc `hidden`).
     - Gọi API `POST /api/admin/categories`.
     - Backend kiểm tra dữ liệu (tên không rỗng, không trùng với tên danh mục đã có trong bảng `categories`), lưu bản ghi mới và trả về thông báo thành công.
  3. **Sửa danh mục:**
     - Admin nhấn "Sửa" trên một danh mục, cập nhật Tên danh mục hoặc Trạng thái.
     - Gọi API `PUT /api/admin/categories/{id}`.
     - Backend kiểm tra tên không trùng (ngoại trừ chính danh mục đang sửa) và cập nhật CSDL.
  4. **Xóa danh mục:**
     - Admin nhấn "Xóa" và xác nhận trên hộp thoại.
     - Gọi API `DELETE /api/admin/categories/{id}`.
     - Backend kiểm tra bảng `products`: nếu không có sản phẩm nào thuộc `category_id` này, hệ thống thực hiện xóa danh mục khỏi CSDL.
- **Luồng ngoại lệ:**
  - **Tên danh mục trống hoặc bị trùng:** Backend trả về mã lỗi `422` kèm thông báo tiếng Việt (*"Vui lòng nhập tên danh mục"* hoặc *"Tên danh mục đã tồn tại"*).
  - **Xóa danh mục đang chứa sản phẩm:** Nếu tồn tại bản ghi trong `products` có `category_id` tương ứng -> Chặn thao tác xóa, trả về lỗi và hiển thị thông báo *"Không thể xóa danh mục đang có sản phẩm"*.
  - **Không có quyền truy cập:** Trả về lỗi `401`/`403` nếu tài khoản không phải Admin.

#### UC-A2: Quản lý sản phẩm (TM-12)
- **Tác nhân:** Quản trị viên (Admin).
- **Mô tả:** Quản lý toàn bộ vòng đời đầu sách (xem danh sách phân trang, tìm kiếm/lọc, theo dõi cảnh báo tồn kho, thêm mới kèm ảnh bìa, cập nhật thông tin/nhập kho, ẩn/hiện và xóa mềm/xóa cứng).
- **Tiền điều kiện:**
  - Người dùng đã đăng nhập với vai trò `admin`.
  - CSDL đã có ít nhất 1 danh mục (`categories`) để gán cho sản phẩm.
- **Luồng chính:**
  1. **Xem danh sách, tìm kiếm & Cảnh báo tồn kho:**
     - Admin truy cập trang Quản lý sản phẩm. Frontend gọi API `GET /api/admin/products` với các tham số phân trang (`page`), từ khóa (`keyword` — tìm theo tên sách, tác giả hoặc mã `#ID`), danh mục (`category_id`) và trạng thái tồn kho (`stock_status`).
     - Backend truy vấn các sản phẩm chưa bị xóa mềm (`is_deleted = false`), phân trang phía server (10 sách/trang) và trả về kèm khối **Cảnh báo tồn kho** liệt kê các đầu sách đã hết hàng (`stock = 0`) hoặc sắp hết hàng (`1 <= stock <= 5`).
     - Trên khung Cảnh báo tồn kho, Admin có thể lọc nhanh sách hết hàng/sắp hết hoặc nhấn nút `+ Nhập kho` để mở nhanh biểu mẫu cập nhật tồn kho.
  2. **Thêm sản phẩm mới:**
     - Admin nhấn "Thêm sách mới", nhập thông tin: Tên sách (bắt buộc), Tác giả, Nhà xuất bản, Năm xuất bản, Số trang, Giá niêm yết (`> 0`), Phần trăm giảm giá (`0–100%`, hệ thống tự động tính và hiển thị trước giá bán sau giảm), Số lượng tồn kho (bắt buộc `>= 1`), Danh mục, Trạng thái (`active`/`hidden`), Mô tả và chọn 1 ảnh bìa (`JPG`/`PNG`, dung lượng `<= 2 MB`).
     - Frontend kiểm tra dữ liệu hợp lệ tiếng Việt và hiển thị hộp thoại xác nhận trước khi gửi `POST /api/admin/products` (`multipart/form-data`).
     - Backend xác thực dữ liệu (`AdminProductRequest`), kiểm tra nội dung tệp ảnh theo MIME type thực tế (`image/jpeg`, `image/png`), đổi tên tệp ngẫu nhiên (`Str::random(40)`), lưu vào `public/uploads/products/` và thêm bản ghi vào bảng `products`.
  3. **Sửa thông tin & Nhập kho:**
     - Admin nhấn "Sửa" (hoặc "Nhập / Sửa"), chỉnh sửa thông tin sách và gọi `POST /api/admin/products/{id}` (`_method=PUT`).
     - Khi cập nhật sách có sẵn, hệ thống cho phép nhập `stock >= 0`; nếu cập nhật `stock = 0`, hệ thống hiển thị thông báo hết hàng và tự động đưa đầu sách vào mục Cảnh báo tồn kho.
     - Nếu không chọn ảnh mới thì giữ nguyên ảnh cũ; nếu tải ảnh mới thì lưu ảnh mới và xóa tệp ảnh cũ khỏi thư mục lưu trữ.
  4. **Ẩn / Hiện sản phẩm:**
     - Admin nhấn "Ẩn" hoặc "Hiện" và xác nhận. Hệ thống gọi `PUT /api/admin/products/{id}/toggle-status` để đảo trạng thái `status` giữa `active` và `hidden` (sản phẩm `hidden` sẽ không hiển thị ở trang khách hàng).
  5. **Xóa sản phẩm (Xóa mềm / Xóa cứng):**
     - Admin nhấn "Xóa" và xác nhận. Backend mở **Database Transaction** và kiểm tra bảng `order_items`:
       - **Đã từng có trong đơn hàng:** Thực hiện **Xóa mềm** (`is_deleted = true`, `status = 'hidden'`) và xóa khỏi `cart_items` để bảo toàn lịch sử đơn hàng cũ.
       - **Chưa từng có trong đơn hàng:** Thực hiện **Xóa cứng** bản ghi khỏi `products`, xóa khỏi `cart_items` và xóa tệp ảnh bìa trên server.
- **Luồng ngoại lệ:**
  - **Dữ liệu nhập không hợp lệ (`422`):** Bỏ trống tên sách/danh mục, giá `<= 0`, giảm giá ngoài khoảng `0–100%`, tồn kho `< 1` khi thêm mới (hoặc `< 0` khi cập nhật), năm xuất bản hoặc số trang không hợp lệ -> Hiển thị thông báo lỗi tiếng Việt ngay bên dưới từng ô nhập liệu.
  - **Ảnh bìa sai định dạng hoặc vượt dung lượng:** Tệp tải lên không phải `JPG`/`PNG` (kể cả trường hợp đổi đuôi file giả mạo MIME) hoặc dung lượng `> 2 MB` -> Chặn tải lên và báo lỗi tiếng Việt.
  - **Sản phẩm không tồn tại (`404`):** Thao tác trên ID không tồn tại hoặc sản phẩm đã bị xóa mềm -> Báo lỗi *"Không tìm thấy sản phẩm"*.

#### UC-A3: Quản lý đơn hàng
- **Tác nhân:** Admin.
- **Luồng chính:**
  - **Xem danh sách:** Lọc theo trạng thái đơn (`pending`, `shipping`, `completed`, `cancelled`).
  - **Cập nhật trạng thái:** 
    - Từ `pending` -> `shipping` (Đang giao).
    - Từ `shipping` -> `completed` (Hoàn thành).
    - Từ `pending` -> `cancelled` (Hủy).
    - **Ràng buộc:** Không được chuyển trạng thái đi lùi (VD: Từ `completed` không được quay lại `pending`).

#### UC-A4: Quản lý người dùng
- **Tác nhân:** Admin.
- **Luồng chính:**
  - **Xem danh sách:** Tìm kiếm theo email.
  - **Khóa/Mở khóa:** Toggle trạng thái `status` giữa `active` và `locked`. (Nếu `locked` thì API Login sẽ chặn lại). Không cho phép Admin tự khóa tài khoản của chính mình.

#### UC-A5: Xem thống kê (Mức C)
- **Tác nhân:** Admin.
- **Luồng chính:**
  - Gọi API trả về: Tổng doanh thu (tính tổng `total_amount` của đơn `completed`), Top 5 sản phẩm bán chạy, Số lượng đơn hàng theo từng trạng thái.
  - Giao diện Frontend vẽ biểu đồ (sử dụng thư viện như Chart.js hoặc Recharts).


  #### UC-C3: Xem đơn hàng của tôi
- **Tác nhân:** Customer.
- **Mô tả:** Xem danh sách và chi tiết đơn hàng.
- **Luồng chính:**
  - Gọi API `GET /api/orders`. Backend sử dụng `paginate(10)` để phân trang. Chỉ `SELECT` các order có `user_id = Auth::id()` (Chặn xem đơn người khác - TM-NFR4).
- **Luồng Hủy đơn:**
  - Khách nhấn "Hủy đơn".
  - Backend kiểm tra: Chỉ cho phép hủy khi `status == 'pending'`.
  - Nếu hợp lệ: Chuyển `status = 'cancelled'` và dùng DB Transaction để **cộng lại `stock`** cho tất cả sản phẩm trong đơn đó.