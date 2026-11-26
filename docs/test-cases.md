# Tài Liệu Kiểm Thử (Test Cases) - Hệ Thống Mọt Sách BookHouse

## Thông tin chung
- **Tên hệ thống:** Website Bán Sách Mọt Sách BookHouse
- **Người thực hiện:** Bùi Văn Tín (TV5 - QA)
- **Ngày cập nhật:** 27/11/2026
- **Phạm vi kiểm thử:** Toàn bộ 16 chức năng (`TM-01` đến `TM-16`), các phân hệ phụ trợ (Quản lý Banner, Hoàn đơn/Đổi trả) và các yêu cầu phi chức năng (`NFR-01` – `NFR-06`, `TM-NFR1` – `TM-NFR4`).

---

## PHẦN 1: NHÓM CHỨC NĂNG KHÁCH VÃNG LAI (GUEST)

### 1.1. TM-01: Trang chủ (`/`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01-01** | TM-01 | 1. Mở trình duyệt và truy cập trang chủ (`/`). | Người dùng chưa đăng nhập. | 1. Hiển thị thanh điều hướng (Logo Mọt Sách BookHouse, ô tìm kiếm, Giỏ hàng, nút **Đăng nhập**, thanh danh mục).<br>2. Hiển thị Slide Banner quảng cáo đang kích hoạt (`Hiển thị`).<br>3. Hiển thị các khu vực sách mới về, sách nổi bật theo danh mục kèm giá bán định dạng `xxx.000 đ`. | *(Chờ test)* |
| **TC-01-02** | TM-01 | 1. Tại trang chủ, nhấn vào một danh mục trên thanh menu (ví dụ: *Công nghệ thông tin*) hoặc nút **KHÁM PHÁ SÁCH →** trên banner. | Danh mục *Công nghệ thông tin* có 21 đầu sách. | 1. Hệ thống điều hướng sang trang danh sách sản phẩm (`/products`) đã lọc sẵn theo danh mục tương ứng.<br>2. Chỉ hiển thị các sách có trạng thái *Hiển thị*. | *(Chờ test)* |

### 1.2. TM-02: Tìm kiếm & Lọc sản phẩm (`/products`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-02-01** | TM-02 | 1. Nhập từ khóa vào thanh tìm kiếm trên Header.<br>2. Nhấn biểu tượng kính lúp (hoặc phím `Enter`). | Từ khóa: `Nhà Giả Kim` | 1. Chuyển đến trang `/products` và hiển thị cuốn *Nhà Giả Kim* của tác giả Paulo Coelho.<br>2. Các sách đang ở trạng thái *Đang ẩn* không xuất hiện. | *(Chờ test)* |
| **TC-02-02** | TM-02 | 1. Vào trang `/products`.<br>2. Tại **Bộ lọc tìm kiếm** bên trái, tích chọn thể loại *Kỹ năng sống* và mức *Từ 4 sao trở lên*. | Thể loại: *Kỹ năng sống*<br>Đánh giá: `>= 4 sao` | 1. Danh sách cập nhật chỉ hiển thị các sách thuộc *Kỹ năng sống* có điểm trung bình từ 4.0 sao trở lên (ví dụ: *Đắc Nhân Tâm*).<br>2. Dòng thông báo phía trên cập nhật đúng số lượng sách khớp điều kiện. | *(Chờ test)* |
| **TC-02-03** | TM-02 | 1. Vào trang `/products`.<br>2. Chọn tiêu chí ở ô **Sắp xếp** (Giá tăng dần / Giá giảm dần / Mới nhất / Bán chạy nhất).<br>3. Chuyển sang trang 2 ở thanh phân trang phía dưới. | Dữ liệu có > 12 cuốn sách (mỗi trang hiển thị 12 cuốn). | 1. Danh sách sắp xếp đúng thứ tự đã chọn.<br>2. Phân trang hoạt động mượt mà, giữ nguyên bộ lọc đang chọn, thời gian phản hồi dưới 2 giây (`NFR-03`). | *(Chờ test)* |
| **TC-02-04** | TM-02 | 1. Nhập từ khóa không tồn tại vào ô tìm kiếm. | Từ khóa: `Sách XYZ không tồn tại 999` | 1. Không phát sinh lỗi hệ thống.<br>2. Hiển thị thông báo không tìm thấy ấn phẩm phù hợp kèm nút **THIẾT LẬP LẠI** bộ lọc. | *(Chờ test)* |

### 1.3. TM-03: Xem chi tiết sản phẩm (`/products/{id}`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-03-01** | TM-03 | 1. Nhấn vào ảnh bìa hoặc tên cuốn *Quốc Gia Khởi Nghiệp*. | Sách ID `37` (Giá ưu đãi: `174.000 đ`, Tồn kho: `49 cuốn`). | 1. Mở trang `/products/37`.<br>2. Hiển thị đầy đủ: Ảnh bìa, tên sách, tác giả, NXB, năm XB, số trang, hình thức bìa, mã ISBN, giá ưu đãi + giá gốc gạch ngang, tình trạng kho (*Còn 49 cuốn trong kho*), giới thiệu tác phẩm và danh sách đánh giá. | *(Chờ test)* |
| **TC-03-02** | TM-03 | 1. Ở trạng thái **chưa đăng nhập**, mở trang chi tiết sách.<br>2. Nhấn nút **Thêm vào giỏ hàng** (hoặc **Mua ngay**). | Khách vãng lai (Guest). | 1. Hệ thống chặn thao tác thêm vào giỏ.<br>2. Mở cửa sổ popup **Đăng Nhập Độc Giả** yêu cầu đăng nhập để tiếp tục. | *(Chờ test)* |
| **TC-03-03** | TM-03 | 1. Xem thẻ sản phẩm cuốn *Conan* (đã hết hàng, tồn kho = `0`). | Sách có `stock = 0`. | 1. Trên thẻ sách hiển thị nhãn *Hết hàng* và nút thao tác bị vô hiệu hóa với chữ **TẠM HẾT HÀNG**. | *(Chờ test)* |

### 1.4. TM-04: Đăng ký & Đăng nhập (Popup xác thực)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-04-01** | TM-04 | 1. Nhấn **Đăng nhập** trên Header $\rightarrow$ chuyển sang tab **Đăng ký**.<br>2. Nhập đầy đủ Họ tên, Email, Mật khẩu, Xác nhận mật khẩu.<br>3. Nhấn nút đăng ký. | Họ tên: `Trần Thanh Tiến`<br>Email: `khachhang14@gmail.com`<br>Pass: `password123` | 1. Tạo tài khoản thành công với vai trò `customer` và hạng mặc định *Mầm Sách*.<br>2. Tự động chuyển sang tab **Đăng nhập** kèm thông báo xanh: *"Đăng ký thành công! Vui lòng đăng nhập."*<br>3. Mật khẩu trong CSDL được băm bằng `bcrypt` (`NFR-01`). | *(Chờ test)* |
| **TC-04-02** | TM-04 | 1. Mở tab **Đăng ký**.<br>2. Nhập email đã tồn tại trên hệ thống.<br>3. Nhấn nút đăng ký. | Email: `admin@bookstore.com` (đã tồn tại). | 1. Không tạo tài khoản mới.<br>2. Hiển thị thông báo lỗi tiếng Việt báo email đã được sử dụng. | *(Chờ test)* |
| **TC-04-03** | TM-04 | 1. Mở tab **Đăng ký**.<br>2. Nhập mật khẩu dưới 8 ký tự hoặc mật khẩu xác nhận không khớp. | Pass: `1234567` (7 ký tự) | 1. Hệ thống chặn gửi biểu mẫu.<br>2. Hiển thị thông báo lỗi yêu cầu mật khẩu tối thiểu 8 ký tự / xác nhận mật khẩu không khớp. | *(Chờ test)* |
| **TC-04-04** | TM-04 | 1. Mở popup **Đăng Nhập Độc Giả** (tab **Đăng nhập**).<br>2. Nhập Email và Mật khẩu tài khoản Khách hàng.<br>3. Nhấn **ĐĂNG NHẬP**. | Email: `khachhang14@gmail.com`<br>Pass: `password123` | 1. Đóng popup, giữ nguyên trang hiện tại.<br>2. Góc phải Header hiển thị ảnh đại diện chữ cái đầu (**T**) kèm menu tài khoản (*Hạng thành viên*, *Tài khoản của tôi*, *Đơn hàng của tôi*, *Đăng xuất*). | *(Chờ test)* |
| **TC-04-05** | TM-04 | 1. Mở popup **Đăng Nhập Độc Giả**.<br>2. Nhập Email và Mật khẩu tài khoản Quản trị viên.<br>3. Nhấn **ĐĂNG NHẬP**. | Email: `admin@bookstore.com`<br>Pass hợp lệ. | 1. Xác thực thành công và tự động điều hướng vào trang quản trị (`/admin`). | *(Chờ test)* |
| **TC-04-06** | TM-04 | 1. Mở popup **Đăng Nhập Độc Giả**.<br>2. Nhập sai mật khẩu hoặc nhập tài khoản đang bị khóa (`Đã khóa`).<br>3. Nhấn **ĐĂNG NHẬP**. | Pass sai: `saimatkhau123` hoặc tài khoản `khachhang10@gmail.com` (Đã khóa). | 1. Không cho phép đăng nhập.<br>2. Hiển thị khung thông báo lỗi màu đỏ phía trên biểu mẫu: *"Email hoặc mật khẩu không đúng."* (hoặc *"Tài khoản đã bị khóa."*). | *(Chờ test)* |

---

## PHẦN 2: NHÓM CHỨC NĂNG KHÁCH HÀNG (CUSTOMER)

### 2.1. TM-05: Quản lý giỏ hàng (`/cart`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-05-01** | TM-05 | 1. Đăng nhập tài khoản Khách hàng.<br>2. Tại trang chi tiết sách *Quốc Gia Khởi Nghiệp*, chọn số lượng `1` và nhấn **Thêm vào giỏ hàng**. | Sách ID `37` (Giá: `174.000 đ`, Tồn kho: `49`). | 1. Hiển thị thông báo xanh: *"Đã thêm 1 cuốn 'Quốc Gia Khởi Nghiệp' vào giỏ hàng"*.<br>2. Icon **Giỏ hàng** trên Header cập nhật số lượng và tổng tiền `174.000 đ`.<br>3. Lưu bản ghi vào bảng `cart_items` trong CSDL. | *(Chờ test)* |
| **TC-05-02** | TM-05 | 1. Truy cập trang **Giỏ Ấn Phẩm Của Bạn** (`/cart`).<br>2. Nhấn nút `+` để tăng số lượng từ `1` lên `2`. | Sách ID `37` (Giá: `174.000 đ`, Tồn kho: `49`). | 1. Số lượng cập nhật thành `2`.<br>2. Thành tiền dòng sản phẩm và **Tổng thanh toán tạm tính** cập nhật thành `348.000 đ`.<br>3. CSDL cập nhật `quantity = 2`. | *(Chờ test)* |
| **TC-05-03** | TM-05 | 1. Tại trang chi tiết hoặc trang `/cart`, cố tình thêm/tăng số lượng vượt quá tồn kho hiện có. | Sách *Nhà Giả Kim* (Tồn kho: `1`). Trong giỏ đã có `1` cuốn. | 1. Hệ thống chặn tăng số lượng.<br>2. Hiển thị thông báo lỗi *"Số lượng vượt quá tồn kho"*.<br>3. Số lượng trong giỏ giữ nguyên là `1`. | *(Chờ test)* |
| **TC-05-04** | TM-05 | 1. Tại trang `/cart`, nhấn nút **Xóa** ở góc trên bên phải thẻ sản phẩm. | Giỏ hàng đang có 1 đầu sách. | 1. Sản phẩm bị xóa khỏi danh sách giỏ hàng và bảng `cart_items`.<br>2. Hiển thị thông báo giỏ hàng trống và vô hiệu hóa nút **TIẾN HÀNH GIAO NHẬN & THANH TOÁN**. | *(Chờ test)* |

### 2.2. TM-06, TM-10 & TM-16: Đặt hàng, Áp dụng Voucher & Thanh toán (`/checkout`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-06-01** | TM-06<br>TM-16 | 1. Từ `/cart`, nhấn **TIẾN HÀNH GIAO NHẬN & THANH TOÁN** (`/checkout`).<br>2. Chọn **Địa chỉ lưu sẵn** (Lê Thị Thu Hà - `0901234503` - `88 Trần Phú, Hải Châu 1, Đà Nẵng`).<br>3. Chọn vận chuyển *Tiêu Chuẩn (Miễn phí)*.<br>4. Nhấn **Chọn >** ở mục *Voucher của bạn* $\rightarrow$ nhấn **Áp dụng** mã `MAMSACH20` (-20.000đ).<br>5. Chọn thanh toán **COD** $\rightarrow$ nhấn **XÁC NHẬN ĐẶT HÀNG & THANH TOÁN →**. | Giỏ hàng: 1 cuốn *Quốc Gia Khởi Nghiệp* (`174.000 đ`, tồn kho: `49`).<br>Voucher: `MAMSACH20` (đơn tối thiểu `150.000 đ`, giảm `20.000 đ`). | 1. Tổng thanh toán tính đúng: `174.000 - 20.000 = 154.000 đ`.<br>2. Chuyển sang bước **3. Hoàn tất đơn**, hiển thị **"ĐẶT HÀNG THÀNH CÔNG • MÃ ĐƠN #MS29"**.<br>3. Tạo đơn ở trạng thái *Chờ xác nhận*, trừ tồn kho sách còn `48`, tăng lượt dùng voucher và làm trống giỏ hàng trong cùng 1 transaction. | *(Chờ test)* |
| **TC-06-02** | TM-06 | 1. Tại `/checkout`, chọn **Giao tới địa chỉ mới**.<br>2. Bỏ trống *Họ và tên người nhận* hoặc *Số điện thoại liên lạc*.<br>3. Nhấn **XÁC NHẬN ĐẶT HÀNG & THANH TOÁN →**. | Họ tên: *(trống)*<br>SĐT: `123` (sai định dạng). | 1. Không tạo đơn hàng.<br>2. Hiển thị thông báo lỗi tiếng Việt rõ trường nhập thiếu/sai (`NFR-04`). | *(Chờ test)* |
| **TC-06-03** | TM-06<br>TM-NFR1 | 1. Hai tài khoản Khách hàng A và B cùng mở `/checkout` cho cuốn *Nhà Giả Kim* (chỉ còn `1` cuốn trong kho).<br>2. Cả hai bấm **XÁC NHẬN ĐẶT HÀNG** gần như đồng thời. | Sách *Nhà Giả Kim* (`stock = 1`). | 1. Chỉ có 1 đơn hàng đặt thành công và tồn kho giảm về `0`.<br>2. Khách còn lại nhận thông báo sản phẩm vừa hết hàng / không đủ tồn kho; tồn kho tuyệt đối không bị âm (`TM-NFR1`). | *(Chờ test)* |
| **TC-06-04** | TM-10 | 1. Tại `/checkout`, chọn phương thức **Thanh toán qua VNPay** (hoặc **Thanh toán qua Ví MoMo**).<br>2. Nhấn **XÁC NHẬN ĐẶT HÀNG & THANH TOÁN →** và hoàn tất thanh toán trên cổng sandbox. | Đơn hàng hợp lệ, chọn VNPay/MoMo. | 1. Chuyển hướng sang cổng thanh toán sandbox.<br>2. Khi thanh toán thành công, hệ thống ghi nhận trạng thái thanh toán của đơn hàng và hoàn tất đặt đơn. | *(Chờ test)* |

### 2.3. TM-07: Đơn hàng của tôi & Hoàn đơn / Đổi trả (`/account?tab=orders`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-07-01** | TM-07 | 1. Đăng nhập tài khoản Khách hàng $\rightarrow$ vào **Đơn hàng của tôi** (`/account?tab=orders`).<br>2. Lần lượt nhấn các tab trạng thái (*Tất cả*, *Chờ xác nhận*, *Đang giao*, *Hoàn thành*...).<br>3. Nhấn nút **Xem chi tiết** trên thẻ đơn `#MS29`. | Tài khoản `khachhang3@gmail.com`. | 1. Chỉ hiển thị các đơn hàng của chính tài khoản đang đăng nhập (`TM-NFR4`).<br>2. Khi nhấn **Xem chi tiết**, thẻ mở rộng hiển thị *Người nhận*, *Địa chỉ giao*, *Thanh toán* và nút đổi thành **Thu gọn**. | *(Chờ test)* |
| **TC-07-02** | TM-07 | 1. Tại tab *Chờ xác nhận*, tìm đơn `#MS29` (`1` cuốn *Quốc Gia Khởi Nghiệp*, tồn kho hiện tại `48`).<br>2. Nhấn nút **Hủy đơn** màu đỏ và xác nhận. | Đơn `#MS29` đang ở trạng thái *Chờ xác nhận*. | 1. Trạng thái đơn chuyển thành *Đã hủy*.<br>2. Số lượng tồn kho của cuốn *Quốc Gia Khởi Nghiệp* được hoàn lại thành `49`.<br>3. Các đơn ở trạng thái *Đang giao* hoặc *Hoàn thành* không hiển thị nút **Hủy đơn**. | *(Chờ test)* |
| **TC-07-03** | TM-07 | 1. Với đơn *Hoàn thành* còn trong 3 ngày hỗ trợ (`#MS28`), nhấn nút **Hoàn đơn / Đổi trả**.<br>2. Chọn hình thức *Đổi cuốn sách mới*, tích chọn sách, nhập lý do và nhấn **GỬI YÊU CẦU ĐỔI SÁCH**. | Đơn `#MS28` hoàn thành trong vòng 3 ngày. | 1. Hệ thống gửi phiếu yêu cầu hoàn đơn/đổi trả thành công và chuyển đơn sang nhóm *Yêu cầu hoàn đơn*.<br>2. Với đơn đã quá 3 ngày (`#MS23`), nút **Hoàn đơn / Đổi trả** tự động ẩn đi. | *(Chờ test)* |
| **TC-07-04** | TM-07<br>TM-NFR4 | 1. Dùng tài khoản Khách hàng A (`khachhang13`), cố tình gọi API hoặc đổi ID trên URL sang đơn hàng thuộc về Khách hàng B (`#MS29`). | URL/API trỏ tới đơn của người dùng khác. | 1. Hệ thống chặn truy cập (403/404) và tuyệt đối không trả về dữ liệu đơn hàng của người khác (`TM-NFR4`). | *(Chờ test)* |

### 2.4. TM-08: Hồ sơ cá nhân & Đổi mật khẩu (`/account`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-08-01** | TM-08 | 1. Vào **Tài khoản của tôi** (`/account`), tab **Thông tin cá nhân**.<br>2. Sửa *Họ và tên*, *Số điện thoại* và nhấn **Thay đổi** ở mục *Địa chỉ nhận hàng mặc định* để cập nhật địa chỉ.<br>3. Nhấn **LƯU THAY ĐỔI** $\rightarrow$ nhấn **Xác nhận** trên hộp thoại. | Họ tên: `TRẦN MINH TIẾN`<br>SĐT: `0346265650`<br>Email: chỉ đọc (không sửa được). | 1. Hiển thị hộp thoại xác nhận cập nhật.<br>2. Sau khi xác nhận, lưu thông tin mới vào CSDL và hiển thị thông báo cập nhật thành công.<br>3. Bản đồ xem trước cập nhật đúng vị trí giao hàng. | *(Chờ test)* |
| **TC-08-02** | TM-08 | 1. Chọn tab **Đổi mật khẩu**.<br>2. Nhập đúng *Mật khẩu hiện tại*, nhập *Mật khẩu mới* (`>= 8` ký tự) và *Xác nhận mật khẩu mới* trùng khớp.<br>3. Nhấn **CẬP NHẬT MẬT KHẨU**. | Pass cũ: `password123`<br>Pass mới: `newpass123` | 1. Hiển thị khung thông báo màu xanh: *"Đổi mật khẩu thành công!"* và làm trống các ô nhập.<br>2. Đăng xuất và đăng nhập lại bằng `newpass123` thành công. | *(Chờ test)* |
| **TC-08-03** | TM-08 | 1. Tại tab **Đổi mật khẩu**, lần lượt thử các trường hợp sai:<br>- Nhập sai *Mật khẩu hiện tại*.<br>- Nhập *Mật khẩu mới* chỉ có `3` ký tự (`pas`).<br>- Nhập *Xác nhận mật khẩu mới* không khớp.<br>- Nhập *Mật khẩu mới* trùng mật khẩu cũ. | Dữ liệu không hợp lệ theo từng kịch bản. | 1. Hệ thống từ chối cập nhật và hiển thị thông báo lỗi rõ ràng tương ứng với từng lỗi (cảnh báo dưới 8 ký tự, khung đỏ báo mật khẩu xác nhận không khớp, hoặc báo lỗi trùng mật khẩu cũ). | *(Chờ test)* |

### 2.5. TM-09: Đánh giá sản phẩm (`/account?tab=orders`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-09-01** | TM-09 | 1. Tại trang **Đơn Hàng Của Tôi**, tìm đơn hàng ở trạng thái *Hoàn thành* (`#MS1`).<br>2. Nhấn nút **☆ Đánh giá** bên cạnh cuốn *Khai Phá Dữ Liệu Lớn*.<br>3. Chọn `5 sao — Tuyệt vời`, nhập nhận xét và nhấn **GỬI ĐÁNH GIÁ**. | Đơn `#MS1` (Hoàn thành)<br>Số sao: `5`<br>Nhận xét: `Sách in đẹp, đóng gói kỹ.` | 1. Đóng popup, lưu đánh giá và cập nhật lại điểm trung bình sao của cuốn sách.<br>2. Nút cạnh sách trong đơn `#MS1` đổi thành **★ Đã đánh giá (5★)** và không cho đánh giá lại trong cùng đơn `#MS1`. | *(Chờ test)* |
| **TC-09-02** | TM-09 | 1. Khách hàng đặt mua lại chính cuốn *Khai Phá Dữ Liệu Lớn* ở đơn hàng lần thứ 2 (`#MS30`) và đơn này chuyển sang *Hoàn thành*.<br>2. Mở đơn `#MS30` để kiểm tra nút đánh giá. | Cùng khách hàng, cùng cuốn sách nhưng ở đơn hàng mới `#MS30`. | 1. Cạnh cuốn *Khai Phá Dữ Liệu Lớn* ở đơn `#MS30` vẫn hiển thị nút **☆ Đánh giá**.<br>2. Khách hàng được phép gửi đánh giá độc lập cho lần mua thứ 2 này. | *(Chờ test)* |

---

## PHẦN 3: NHÓM CHỨC NĂNG QUẢN TRỊ VIÊN (ADMIN)

### 3.1. TM-11: Quản lý danh mục (`/admin/categories`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-11-01** | TM-11 | 1. Vào **Quản lý danh mục** (`/admin/categories`).<br>2. Nhấn **+ THÊM DANH MỤC** $\rightarrow$ nhập *Tên danh mục*, *Thứ tự hiển thị*, *Trạng thái*, *Mô tả*.<br>3. Nhấn **THÊM DANH MỤC** $\rightarrow$ nhấn **THÊM DANH MỤC** trên hộp thoại xác nhận. | Tên danh mục: `Trinh thám`<br>Trạng thái: `Hiển thị` | 1. Lưu danh mục mới vào CSDL và hiển thị trên bảng danh sách.<br>2. Thanh menu ngoài trang chủ hiển thị thêm danh mục *Trinh thám*. | *(Chờ test)* |
| **TC-11-02** | TM-11 | 1. Tại dòng danh mục *Văn học* (`#1`), nhấn nút **Ẩn** $\rightarrow$ nhấn **XÁC NHẬN ẨN**.<br>2. Kiểm tra tìm kiếm/lọc theo trạng thái *Đang ẩn*. | Danh mục `#1: Văn học`. | 1. Hiển thị thông báo xanh: *"Đã cập nhật trạng thái danh mục 'Văn học'."*<br>2. Trạng thái đổi thành *Đang ẩn* và nút thao tác đổi thành **Hiện**. | *(Chờ test)* |
| **TC-11-03** | TM-11 | 1. Nhấn nút **Xóa** tại danh mục *Văn học* (đang có `20 sách`) $\rightarrow$ nhấn **XÓA DANH MỤC**. | Danh mục đang có 20 đầu sách liên kết. | 1. Hệ thống chặn xóa cứng danh mục đang chứa sản phẩm (`TM-11`) và hiển thị thông báo tiếng Việt hướng dẫn chuyển sách hoặc dùng chức năng *Ẩn*. | *(Chờ test)* |

### 3.2. TM-12: Quản lý sản phẩm (`/admin/products`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-12-01** | TM-12 | 1. Vào **Quản lý sản phẩm** (`/admin/products`) $\rightarrow$ nhấn **+ THÊM SÁCH MỚI**.<br>2. Nhập đầy đủ thông tin bắt buộc, chọn ảnh bìa định dạng `.jpg` dung lượng `< 2 MB` và nhấn **THÊM SÁCH MỚI**. | Tên: `Clean Code`<br>Giá: `320000`, Tồn kho: `15`<br>Ảnh: `clean-code.jpg` (`500 KB`). | 1. Tạo mới đầu sách thành công, lưu ảnh bìa và hiển thị ngoài cửa hàng.<br>2. Khối **Cảnh báo tồn kho** cập nhật đúng các sách hết hàng / sắp hết hàng (`<= 5 cuốn`). | *(Chờ test)* |
| **TC-12-02** | TM-12 | 1. Trong form **Thêm Đầu Sách Mới**, tải lên tệp `.pdf` hoặc ảnh có dung lượng `> 2 MB`. | Tệp `book.pdf` hoặc ảnh `4 MB`. | 1. Hệ thống từ chối tệp và hiển thị thông báo lỗi tiếng Việt yêu cầu ảnh JPG/PNG tối đa 2 MB (`TM-12`). | *(Chờ test)* |
| **TC-12-03** | TM-12 | 1. Nhấn **Nhập / Sửa** tại cuốn *Nhà Giả Kim* (`#1`).<br>2. Tăng *Tồn kho* từ `1` lên `20`, sửa giá bán và nhấn **LƯU THAY ĐỔI** $\rightarrow$ xác nhận. | Tồn kho mới: `20`<br>Giá mới: `200.000 đ` | 1. Cập nhật tồn kho và giá mới cho sản phẩm.<br>2. **Kiểm tra `TM-NFR2`:** Mở lại các đơn hàng cũ đã mua *Nhà Giả Kim* trước đó, đơn giá trong `order_items` vẫn giữ nguyên giá cũ `182.000 đ`. | *(Chờ test)* |
| **TC-12-04** | TM-12 | 1. Nhập từ khóa vào ô tìm kiếm, chọn lọc *Danh mục* và lọc *Tồn kho* (*Sắp hết hàng (1 - 5 cuốn)*) $\rightarrow$ nhấn **Tìm kiếm**. | Từ khóa + Danh mục + Tồn kho. | 1. Lọc chính xác danh sách sách theo tổ hợp điều kiện và phân trang đúng. | *(Chờ test)* |

### 3.3. TM-13: Quản lý đơn hàng (`/admin/orders`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-13-01** | TM-13 | 1. Vào **Quản lý đơn hàng** (`/admin/orders`), lọc tab *Chờ xác nhận*.<br>2. Tại đơn `#DH0011`, nhấn **Chuẩn bị hàng** $\rightarrow$ nhấn **XÁC NHẬN CẬP NHẬT**.<br>3. Tiếp tục nhấn **Bàn giao vận chuyển** $\rightarrow$ chọn *Giao Hàng Nhanh (GHN)*, nhập *Mã vận đơn* `GHN89234102` $\rightarrow$ xác nhận bàn giao.<br>4. Nhấn **Xác nhận đã giao** $\rightarrow$ **Chốt hoàn thành**. | Đơn `#DH0011` (`150.000 đ`). | 1. Đơn chuyển tuần tự: *Chờ xác nhận* $\rightarrow$ *Chuẩn bị hàng* $\rightarrow$ *Đang giao* (kèm mã vận đơn `GHN89234102`) $\rightarrow$ *Đã giao (3 ngày đổi/hoàn)* $\rightarrow$ *Hoàn thành*.<br>2. Hiển thị thông báo xanh sau mỗi bước cập nhật. | *(Chờ test)* |
| **TC-13-02** | TM-13 | 1. Khi chuyển đơn từ *Chuẩn bị hàng* sang *Đang giao*, cố tình bỏ trống *Mã vận đơn*. | Mã vận đơn: *(trống)*. | 1. Hệ thống chặn chuyển trạng thái và báo lỗi yêu cầu nhập đầy đủ thông tin bàn giao. | *(Chờ test)* |
| **TC-13-03** | TM-13 | 1. Mở **Chi Tiết & Cập Nhật Đơn Hàng** của một đơn đã ở trạng thái *Hoàn thành* hoặc *Đã hủy*. | Đơn đã kết thúc quy trình. | 1. Hệ thống không cho phép quay ngược trạng thái về *Chờ xác nhận* hay *Chuẩn bị hàng* (`TM-13`). | *(Chờ test)* |

### 3.4. TM-14: Quản lý người dùng (`/admin/users`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-14-01** | TM-14 | 1. Vào **Quản lý người dùng** (`/admin/users`).<br>2. Tìm kiếm theo email `khachhang14@gmail.com` hoặc lọc theo *Cấp bậc thành viên* (*01. Mầm Sách*). | Email: `khachhang14@gmail.com` | 1. Hiển thị chính xác thông tin tài khoản `#13` Trần Thanh Tiến kèm hạng thành viên, tích lũy, vai trò và trạng thái. | *(Chờ test)* |
| **TC-14-02** | TM-14 | 1. Tại dòng tài khoản `#13` (*Hoạt động*), nhấn nút **Khóa** $\rightarrow$ nhấn **KHÓA TÀI KHOẢN** trên hộp thoại xác nhận.<br>2. Dùng trình duyệt ẩn danh đăng nhập bằng tài khoản `#13`. | Tài khoản `#13: khachhang14@gmail.com`. | 1. Trạng thái tài khoản đổi thành *Đã khóa* và nút thao tác đổi thành **Mở**.<br>2. Khi đăng nhập ở trình duyệt ẩn danh, hệ thống từ chối và báo *"Tài khoản đã bị khóa."* (`TM-14`). | *(Chờ test)* |

### 3.5. TM-15: Thống kê & Kiểm duyệt đánh giá (`/admin`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-15-01** | TM-15 | 1. Vào trang **Tổng quan** (`/admin`).<br>2. Chọn khoảng thời gian *Từ: 01/01/2026* – *Đến: 23/11/2026* và nhấn nút lọc. | Kỳ thống kê năm 2026. | 1. Hiển thị 4 thẻ KPI (Doanh thu năm nay, Tổng đơn hàng, Tổng đầu sách, Đánh giá trung bình).<br>2. Biểu đồ cột doanh thu 12 tháng chỉ tổng hợp từ các đơn *Đã hoàn thành*.<br>3. Hiển thị đúng tỷ lệ trạng thái đơn và **Top 5 sách bán chạy**. | *(Chờ test)* |
| **TC-15-02** | TM-15 | 1. Tại bảng **Đánh giá sản phẩm theo kỳ**, nhấn nút **Ẩn** ở nhận xét của khách hàng *Trần Quốc Bảo* $\rightarrow$ nhấn **XÁC NHẬN ẨN**. | Đánh giá 5 sao cho sách *Tôi Thấy Hoa Vàng Trên Cỏ Xanh*. | 1. Trạng thái đánh giá đổi thành *Đang ẩn* và nhận xét này không còn hiển thị công khai ngoài trang chi tiết sách. | *(Chờ test)* |

### 3.6. TM-16 & Quản lý Banner (`/admin/vouchers`, `/admin/banners`)
| ID | Mã chức năng | Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-16-01** | TM-16 | 1. Vào **Quản lý voucher** (`/admin/vouchers`) $\rightarrow$ nhấn **+ THÊM VOUCHER MỚI**.<br>2. Nhập mã `BOOKHOUSE20`, loại giảm *Theo phần trăm (%)* `15%`, đơn tối thiểu `200000`, chọn hạng áp dụng và nhấn **PHÁT HÀNH VOUCHER**. | Mã: `BOOKHOUSE20`<br>Giảm: `15%`, Đơn tối thiểu: `200.000 đ` | 1. Voucher mới xuất hiện ở trạng thái *Đang chạy*.<br>2. Khi khách hàng đủ điều kiện đặt đơn từ `200.000 đ` trở lên tại `/checkout`, mã `BOOKHOUSE20` hiển thị nút **Áp dụng** và giảm đúng 15%. | *(Chờ test)* |
| **TC-16-02** | TM-16 | 1. Tại bảng danh sách voucher, nhấn nút **Tắt** ở mã `DAISU180` $\rightarrow$ nhấn **TẠM NGƯNG**. | Voucher `DAISU180`. | 1. Mã chuyển sang trạng thái *Tạm ngưng* và không còn hiển thị/áp dụng được ở trang thanh toán của khách hàng. | *(Chờ test)* |
| **TC-BN-01** | Banner | 1. Vào **Quản lý banner** (`/admin/banners`) $\rightarrow$ nhấn **+ THÊM BANNER MỚI** (hoặc **Sửa** banner `#0`).<br>2. Chọn sách liên kết *Nhà Giả Kim*, kiểm tra danh mục tự động điền *Văn học*, nhập tiêu đề và nhấn **LƯU THAY ĐỔI**. | Tiêu đề + Sách liên kết *Nhà Giả Kim*. | 1. Hệ thống tự động ánh xạ đúng danh mục của sách.<br>2. Slide banner ngoài trang chủ cập nhật nội dung và liên kết mới ngay lập tức. | *(Chờ test)* |

---

## PHẦN 4: KIỂM THỬ PHI CHỨC NĂNG & BẢO MẬT (`NFR`)

| ID | Mã NFR | Tiêu chí kiểm thử | Cách thức kiểm thử | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-NFR-01** | NFR-01 | Phân quyền phía Server | Dùng tài khoản Khách hàng (`customer`) đã đăng nhập, gõ trực tiếp URL `/admin`, `/admin/orders`, `/admin/users` lên thanh địa chỉ trình duyệt. | Hệ thống từ chối truy cập (trả về lỗi 403 hoặc đẩy về trang chủ), không lộ giao diện hay dữ liệu quản trị. | *(Chờ test)* |
| **TC-NFR-02** | NFR-01 | Chống XSS & CSRF | Nhập mã `<script>alert('XSS')</script>` vào ô *Nhận xét đánh giá* hoặc *Họ tên*; gửi form thiếu `@csrf` token. | Dữ liệu hiển thị dưới dạng văn bản thuần (được escape), không chạy mã JS; form thiếu CSRF bị chặn (419). | *(Chờ test)* |
| **TC-NFR-03** | NFR-02 | Bảo mật tệp cấu hình | Kiểm tra file `.gitignore` và lịch sử commit trên GitHub. | Tệp `.env` chứa thông tin kết nối CSDL/khóa bí mật được loại trừ hoàn toàn khỏi repository. | *(Chờ test)* |
| **TC-NFR-04** | NFR-04 | Giao diện Responsive | Mở DevTools kiểm tra giao diện trang chủ, danh sách sách, giỏ hàng và thanh toán ở 2 độ phân giải `360px` (Mobile) và `1366px` (Desktop). | Bố cục hiển thị cân đối, không vỡ khung, không tràn ngang, các nút bấm thao tác dễ dàng trên cả 2 kích thước. | *(Chờ test)* |