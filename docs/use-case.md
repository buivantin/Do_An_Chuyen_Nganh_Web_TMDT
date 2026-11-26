# ĐẶC TẢ YÊU CẦU CHỨC NĂNG (USE CASE SPECIFICATION)

## 0. Sơ đồ Use Case
![Sơ đồ Use Case](./use-case-diagram.png)

## 1. Danh sách Tác nhân (Actors)
- **Khách vãng lai (Guest):** Người chưa đăng nhập. Chỉ có quyền xem thông tin.
- **Khách hàng (Customer):** Người đã đăng nhập. Kế thừa quyền của Guest, có quyền mua hàng, quản lý giỏ hàng và tài khoản cá nhân.
- **Quản trị viên (Admin):** Người quản lý hệ thống. Có toàn quyền CRUD dữ liệu, quản lý đơn hàng và người dùng.

---

## 2. ĐẶC TẢ CHI TIẾT CÁC USE CASE

### 2.1. NHÓM CHỨC NĂNG KHÁCH VÃNG LAI (GUEST)

#### UC-G1: Xem trang chủ (TM-01)
- **Tác nhân:** Khách vãng lai (Guest), Khách hàng (Customer).
- **Mô tả:** Người dùng truy cập vào trang chủ của cửa hàng Mọt Sách BookHouse để xem tổng quan các danh mục sách, chương trình nổi bật, sách mới phát hành, sách được đánh giá cao và các tủ sách theo từng chủ đề.
- **Tiền điều kiện:** 
  - Người dùng mở trình duyệt và truy cập vào địa chỉ trang chủ của website (/).
- **Luồng chính:**
  1. Người dùng truy cập vào đường dẫn trang chủ (/).
  2. Hệ thống tải dữ liệu và hiển thị thanh điều hướng phía trên (Header), bao gồm: Logo cửa hàng, thanh tìm kiếm nhanh, biểu tượng Giỏ hàng, nút Đăng nhập và thanh danh mục sách (Trang chủ, Danh sách sản phẩm, Công nghệ thông tin, Kinh tế & Quản lý, Kỹ năng sống, Sách thiếu nhi, Danh mục khác).
  3. Hệ thống hiển thị khối Banner giới thiệu sách tuyển chọn/ưu đãi trong tuần kèm các nút điều hướng nhanh (Khám phá sách, Xem tủ sách, Xem chi tiết).
  4. Hệ thống hiển thị lần lượt các khối trưng bày sản phẩm theo dạng thanh trượt ngang (kèm nút chuyển trái/phải và nút Xem tất cả): Khối Sách Mới Về (các đầu sách vừa cập nhật). Khối Top Sách Đánh Giá Cao (các đầu sách có điểm đánh giá nổi bật từ độc giả). Các khối Tủ sách chuyên đề phân theo từng danh mục (Công nghệ thông tin, Kinh tế & Quản lý, Văn học...).
  5. Trên mỗi thẻ sách, hệ thống hiển thị đầy đủ thông tin cơ bản: Ảnh bìa, nhãn giảm giá, huy hiệu trạng thái (Mới, Bán chạy), điểm đánh giá sao, số lượng đã bán, danh mục, tên sách, tác giả, nhà xuất bản, số trang, năm xuất bản, giá bán (kèm giá gốc gạch ngang nếu có giảm giá) và nút "Thêm vào giỏ".
  6. Hệ thống hiển thị phần chân trang (Footer) với thông tin giới thiệu cửa hàng, liên kết danh mục, chính sách hỗ trợ độc giả, thông tin liên hệ và các phương thức thanh toán hỗ trợ.
  
- **Luồng ngoại lệ:**
  - Lỗi kết nối hoặc máy chủ gặp sự cố: Hệ thống hiển thị thông báo "Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau."
  - Hệ thống chưa có dữ liệu sách: Ẩn các khu vực trưng bày sách và hiển thị thông báo "Chưa có sách nào được cập nhật."
  - Sách chưa có lượt đánh giá nào: Hệ thống ẩn phần hiển thị số sao trên thẻ sách thay vì hiển thị 0 sao.
  - Sách đã hết hàng: Nút "Thêm vào giỏ" trên thẻ sách bị vô hiệu hóa và đổi nhãn thành "Hết hàng".
  - Khách vãng lai nhấn nút "Thêm vào giỏ": Hệ thống chặn thao tác thêm giỏ hàng và hiển thị thông báo/cửa sổ yêu cầu người dùng đăng nhập.

#### UC-G2: Tìm kiếm / Lọc sản phẩm
- **Tác nhân:** Khách vãng lai (Guest), Khách hàng (Customer).
- **Mô tả:** Người dùng tìm kiếm đầu sách theo từ khóa hoặc sử dụng thanh công cụ Bộ lọc tìm kiếm đa tiêu chí và sắp xếp để tìm ra các cuốn sách phù hợp trên trang Danh sách sản phẩm (/products).
**Tiền điều kiện:** Người dùng nhập từ khóa trên thanh tìm kiếm ở Header, nhấn vào menu Danh sách sản phẩm, chọn một danh mục trên thanh điều hướng hoặc nhấn Xem tất cả từ một khối sách trên trang chủ.
- **Luồng chính:**
  1. Người dùng nhập từ khóa (tựa sách, tác giả, dịch giả, mã ISBN...) vào thanh tìm kiếm trên Header và nhấn tìm kiếm; hoặc truy cập trang Danh sách sản phẩm (/products).
  2. Hệ thống hiển thị giao diện trang danh sách gồm thanh trạng thái phía trên (dropdown Sắp xếp và thông báo tổng số sách đang hiển thị), thanh Bộ lọc tìm kiếm ở cột bên trái và lưới kết quả sản phẩm ở khu vực chính.
  3. Người dùng thao tác kết hợp các tiêu chí lọc ở cột bên trái:
  - Thể loại & Đề tài: Chọn một hoặc nhiều danh mục (có hiển thị số lượng sách tương ứng của từng danh mục).
  - Đánh giá sao: Chọn mức điểm đánh giá mong muốn (5 sao tuyệt đối, Từ 4 sao trở lên, Từ 3 sao trở lên, Từ 2 sao trở lên, Từ 1 sao trở lên).
  - Tác giả: Tìm nhanh tên tác giả trong ô tìm kiếm nhỏ và tích chọn tác giả mong muốn.
  - Nhà xuất bản: Tìm nhanh tên nhà xuất bản và tích chọn từ danh sách.
  - Năm xuất bản: Chọn nhanh các mốc năm có sẵn (2024 - 2026, 2020 - 2023, 2015 - 2019, Trước 2015) hoặc tự nhập khoảng Từ năm – Đến năm rồi nhấn Áp dụng năm XB.
  - Khoảng giá (VNĐ): Kéo thanh trượt giá, chọn các mốc giá nhanh (Dưới 100.000đ, 100k - 250.000đ, 250k - 500.000đ, Trên 500.000đ) hoặc tự nhập khoảng Từ (đ) – Đến (đ) rồi nhấn Áp dụng khoảng giá.
  4. Người dùng có thể thay đổi thứ tự hiển thị thông qua menu Sắp xếp (Bán chạy nhất, Mới nhất, Giá tăng dần, Giá giảm dần...) và chuyển qua lại giữa các trang kết quả (phân trang).
  5. Hệ thống cập nhật lại lưới sách theo đúng các tiêu chí đã chọn, hiển thị danh sách các thẻ bộ lọc ĐANG ÁP DỤNG phía trên lưới sản phẩm để người dùng dễ dàng gỡ từng điều kiện hoặc nhấn Xóa tất cả / THIẾT LẬP LẠI.

- **Luồng ngoại lệ:** Không tìm thấy kết quả -> Hiển thị màn hình "Không tìm thấy sản phẩm nào phù hợp".
- Không có đầu sách nào khớp với từ khóa hoặc bộ lọc: Hệ thống hiển thị thông báo "Không tìm thấy sản phẩm nào phù hợp" kèm nút xóa bộ lọc để quay lại danh sách mặc định.
- Người dùng nhập khoảng năm xuất bản hoặc khoảng giá không hợp lệ (ví dụ giá trị "Từ" lớn hơn "Đến" hoặc số âm): Hệ thống hiển thị thông báo lỗi tiếng Việt yêu cầu nhập lại khoảng giá trị hợp lệ.

#### UC-G3: Xem chi tiết sản phẩm
- **Tác nhân:** Khách vãng lai (Guest), Khách hàng (Customer).
- **Mô tả:** Người dùng xem toàn bộ thông tin chi tiết, thông số xuất bản, tình trạng tồn kho, các đánh giá từ khách hàng đã mua và danh sách sách gợi ý cùng danh mục của một ấn phẩm cụ thể (/products/{id}).
- **Tiền điều kiện** Ấn phẩm đang ở trạng thái hiển thị kinh doanh trên hệ thống.
- **Luồng chính:**
  1. Người dùng nhấn chọn vào ảnh bìa, tên sách trên thẻ sản phẩm hoặc nút Xem chi tiết trên Banner.
  2. Hệ thống chuyển hướng đến trang chi tiết của cuốn sách (/products/{id}) và hiển thị đầy đủ các khu vực thông tin:
  - Khu vực thông tin chính & đặt mua:
        + Ảnh bìa sách kích thước lớn kèm nút Phóng to để xem rõ chi tiết bìa.
        + Tên sách, Tác giả, Nhà xuất bản, điểm đánh giá sao kèm liên kết (Xem đánh giá) và tổng số lượng đã bán.
       +  Giá bán ưu đãi (kèm giá gốc nếu có giảm giá) và Tình trạng kho (hiển thị cụ thể số lượng còn lại trong kho, ví dụ: Còn 94 cuốn trong kho).
        + Khối Thông tin xuất bản dạng thẻ chi tiết gồm: Nhà xuất bản, Năm xuất bản, Tác giả, Thể loại, Số trang, Hình thức bìa, Ngôn ngữ, Mã ISBN.
       + Bộ chọn số lượng (- / +) cùng hai nút thao tác: Thêm vào giỏ hàng và Mua ngay.
  - Khu vực Đánh Giá Từ Khách Hàng Đã Mua:
        + Hiển thị điểm đánh giá trung bình trên thang 5 (X.X / 5), tổng số lượt đánh giá xác thực, biểu đồ phân bố số lượng theo từng mức sao (từ 5 sao đến 1 sao) và các nút lọc đánh giá (Tất cả, 5 sao, 4 sao, 3 sao, 2 sao, 1 sao).
        + Hiển thị danh sách nhận xét của độc giả bên dưới cùng liên kết điều hướng "Viết đánh giá trong Đơn hàng của tôi →".
  - Khu vực Gợi Ý Dành Cho Bạn (Sách cùng danh mục):
        + Hiển thị danh sách các cuốn sách thuộc cùng thể loại kèm nút Xem tất cả →. Trên mỗi thẻ sách gợi ý hiển thị ảnh bìa, trạng thái tồn kho, điểm sao, thể loại, tên sách, tác giả, nhà xuất bản, giá bán, lượt đã bán và nút thao tác giỏ hàng.
  3. Khi Khách vãng lai nhấn nút Thêm vào giỏ hàng hoặc Mua ngay, hệ thống không thực hiện thêm giỏ hàng mà hiển thị thông báo/cửa sổ yêu cầu người dùng đăng nhập để tiếp tục.
- **Luồng ngoại lệ:** 
  - Mã sách không tồn tại hoặc đã bị ẩn/ngừng bán: Hệ thống hiển thị trang thông báo lỗi 404 "Sản phẩm không tồn tại hoặc đã bị ẩn" kèm nút quay lại trang chủ.
  - Ấn phẩm chưa có lượt đánh giá nào: Khu vực đánh giá hiển thị mức điểm 0.0/5 cùng thông báo "Chưa có đánh giá nào cho ấn phẩm này – Hãy là độc giả đầu tiên chia sẻ cảm nhận sau khi nhận sách nhé!".
  - Sách đã hết hàng: Thẻ sản phẩm hiển thị nhãn "Hết hàng", nút thao tác chuyển sang trạng thái vô hiệu hóa với nhãn "TẠM HẾT HÀNG" (như hiển thị ở các thẻ sách trong khối Sách cùng danh mục).

#### UC-G4: Đăng ký tài khoản
- **Tác nhân:** Khách vãng lai (Guest).
- **Mô tả:** Cho phép khách vãng lai tạo tài khoản thành viên mới ngay trên cửa sổ popup xác thực của Mọt Sách BookHouse để sử dụng các tính năng giỏ hàng, đặt hàng và theo dõi đơn hàng.
- **Tiền điều kiện** Người dùng chưa đăng nhập và mở cửa sổ popup xác thực (thông qua nút Đăng nhập trên thanh Header hoặc khi nhấn thao tác yêu cầu đăng nhập như Thêm vào giỏ hàng / Mua ngay).
- **Luồng chính:**
  1. Người dùng nhấn nút Đăng nhập trên thanh Header; hệ thống hiển thị cửa sổ popup Đăng Nhập Độc Giả với hai tab chuyển đổi Đăng nhập và Đăng ký.
  2. Người dùng nhấn chọn tab Đăng ký để chuyển sang giao diện biểu mẫu Đăng Ký Thành Viên.
  3. Người dùng nhập các thông tin trên biểu mẫu gồm:
      - Họ và tên (bắt buộc).
      - Email (bắt buộc).
      - Số điện thoại (tùy chọn).
      - Mật khẩu (bắt buộc, có nút biểu tượng con mắt để ẩn/hiện mật khẩu).
      - Xác nhận mật khẩu (bắt buộc, có nút biểu tượng con mắt để ẩn/hiện mật khẩu).
  4. Người dùng nhấn nút TẠO TÀI KHOẢN. 
  5. Hệ thống kiểm tra tính hợp lệ của thông tin (đầy đủ các trường bắt buộc, đúng định dạng email, mật khẩu từ 8 ký tự trở lên, xác nhận mật khẩu trùng khớp và email chưa từng tồn tại trên hệ thống).
  6. Hệ thống khởi tạo tài khoản mới với vai trò Khách hàng, mã hóa mật khẩu an toàn và tự động chuyển cửa sổ popup về lại tab Đăng Nhập Độc Giả (điền sẵn email vừa đăng ký) kèm thông báo xanh: "Đăng ký thành công! Vui lòng đăng nhập."
- **Luồng ngoại lệ:** 
    - Bỏ trống trường bắt buộc, sai định dạng email, mật khẩu ngắn hơn 8 ký tự hoặc xác nhận mật khẩu không khớp: Hệ thống giữ nguyên biểu mẫu đăng ký và hiển thị thông báo lỗi tiếng Việt ngay tại trường nhập liệu bị sai.
    - Email đã tồn tại trong hệ thống: Hệ thống từ chối tạo tài khoản và thông báo lỗi "Email đã được sử dụng".


---

### 2.2. NHÓM CHỨC NĂNG KHÁCH HÀNG (CUSTOMER)

> **Lưu ý cho Dev:** Tất cả các API dưới đây đều phải gắn Middleware `auth:sanctum` để kiểm tra đăng nhập.

#### UC-C5: Đăng nhập (Dùng chung cho cả Admin)
- **Tác nhân:** Khách hàng (Customer), Quản trị viên (Admin).
- **Mô tả:** Người dùng xác thực tài khoản trên cửa sổ popup Đăng Nhập Độc Giả để truy cập các chức năng mua hàng, quản lý giỏ hàng, theo dõi đơn hàng cá nhân hoặc truy cập trang quản trị hệ thống (nếu là Admin).
- **Tiền điều kiện** Người dùng đã có tài khoản trên hệ thống và mở cửa sổ popup xác thực (từ nút Đăng nhập trên thanh Header hoặc sau khi hoàn tất đăng ký tài khoản).
- **Luồng chính:**
  1. Người dùng mở cửa sổ popup Đăng Nhập Độc Giả (đang ở tab Đăng nhập).
  2. Người dùng nhập Email và Mật khẩu (có thể nhấn biểu tượng con mắt để ẩn/hiện mật khẩu).
  3. Người dùng nhấn nút ĐĂNG NHẬP.Hệ thống kiểm tra thông tin đăng nhập (đối chiếu email, mật khẩu và trạng thái hoạt động của tài khoản).So sánh mật khẩu (Hash check).
  5. Khi xác thực hợp lệ, hệ thống lưu phiên đăng nhập và điều hướng theo vai trò:
      - Nếu là Khách hàng (customer): Hệ thống đóng cửa sổ popup, giữ nguyên trang hiện tại (hoặc chuyển về trang chủ /), thay thế nút Đăng nhập trên góc phải thanh Header bằng biểu tượng đại diện tài khoản (chữ cái đầu tên người dùng hoặc ảnh đại diện). Khi nhấn vào biểu tượng này, hệ thống hiển thị menu thả xuống gồm: Hạng thành viên (ví dụ: Mầm Sách), Tài khoản của tôi, Đơn hàng của tôi và nút Đăng xuất.
      Nếu là Quản trị viên (admin): Hệ thống chuyển hướng người dùng vào trang quản trị (/admin).
- **Luồng ngoại lệ:** 
      - Nhập sai Email hoặc Mật khẩu: Hệ thống giữ nguyên cửa sổ popup đăng nhập và hiển thị khung thông báo lỗi màu đỏ phía trên biểu mẫu: "Email hoặc mật khẩu không đúng."
      - Tài khoản đang bị khóa: Hệ thống từ chối đăng nhập và hiển thị thông báo "Tài khoản đã bị khóa."
      - Bỏ trống trường bắt buộc hoặc nhập sai định dạng email: Hệ thống hiển thị thông báo lỗi tiếng Việt yêu cầu nhập đầy đủ thông tin hợp lệ.

#### UC-C1: Quản lý giỏ hàng
- **Tác nhân:** Khách hàng (Customer).
- **Mô tả:** Khách hàng thêm sách vào giỏ, xem danh sách ấn phẩm đã chọn tại trang Giỏ Ấn Phẩm Của Bạn (/cart), điều chỉnh số lượng hoặc xóa sản phẩm khỏi giỏ hàng trước khi tiến hành đặt hàng.
- **Tiền điều kiện** Người dùng đã đăng nhập với tài khoản Khách hàng hợp lệ.
- **Luồng chính (Thêm vào giỏ):**
  1. Tại trang chi tiết sản phẩm, khách nhấn "Thêm vào giỏ".
        - Cách 1 (Thêm nhanh từ danh sách): Tại trang chủ hoặc trang danh sách sản phẩm, khách hàng nhấn nút THÊM VÀO GIỎ trên thẻ sách còn hàng.
        - Cách 2 (Thêm từ trang chi tiết): Tại trang chi tiết sách (/products/{id}), khách hàng điều chỉnh số lượng mua bằng nút - / + và nhấn Thêm vào giỏ hàng (hoặc nhấn Mua ngay để thêm và chuyển thẳng sang bước thanh toán).
        - Hệ thống kiểm tra tồn kho khả dụng, cập nhật sản phẩm vào giỏ hàng, hiển thị thông báo xanh xác nhận (ví dụ: "Đã thêm 1 cuốn 'Quốc Gia Khởi Nghiệp' vào giỏ hàng") và cập nhật ngay tổng số lượng cùng tổng tiền tạm tính trên biểu tượng Giỏ hàng ở thanh Header.
  2. Xem trang Giỏ Ấn Phẩm Của Bạn (/cart):
        - Khách hàng nhấn vào biểu tượng Giỏ hàng trên thanh Header để truy cập trang /cart.
        - Hệ thống hiển thị thanh tiến trình 3 bước (1. Giỏ ấn phẩm -> 2. Giao nhận & Thanh toán -> 3. Hoàn tất đơn), thông báo tổng số đầu sách và tổng số cuốn hiện có trong giỏ.
        - Danh sách sản phẩm trong giỏ hiển thị đầy đủ: Ảnh bìa, điểm đánh giá sao, tên sách, tác giả, nhà xuất bản, năm xuất bản, hình thức bìa, số trang, trạng thái tồn kho (ví dụ: Còn 49 cuốn), đơn giá bán (kèm giá gốc gạch ngang nếu có giảm giá), bộ điều chỉnh số lượng (- / +), thành tiền từng dòng và nút Xóa.
        - Khối Tóm Tắt Đơn Hàng bên phải hiển thị: Tạm tính ấn phẩm, Phí vận chuyển tiêu chuẩn, Tổng thanh toán tạm tính, nút TIẾN HÀNH GIAO NHẬN & THANH TOÁN và liên kết ← Tiếp tục chọn thêm sách.
  3. Cập nhật số lượng trong giỏ:
        - Khách hàng nhấn nút - hoặc + tại từng dòng sản phẩm trong giỏ hàng.
        - Hệ thống kiểm tra số lượng mới không vượt quá tồn kho hiện có, lưu thay đổi và tự động tính lại thành tiền từng mục, tổng số cuốn và tổng thanh toán tạm tính.
  4. Xóa sản phẩm khỏi giỏ:
        - Khách hàng nhấn nút Xóa ở góc trên bên phải thẻ sản phẩm trong giỏ.
        - Hệ thống xóa ấn phẩm đó khỏi giỏ hàng và cập nhật lại danh sách cùng tổng tiền.
- **Luồng ngoại lệ:**
        - Số lượng thêm mới hoặc cập nhật vượt quá tồn kho (stock): Hệ thống chặn thao tác tăng số lượng và hiển thị thông báo lỗi tiếng Việt ("Số lượng vượt quá tồn kho").
        - Sản phẩm đã hết hàng: Nút thao tác trên thẻ sách bị vô hiệu hóa với nhãn TẠM HẾT HÀNG, không cho phép thêm vào giỏ.
        - Giỏ hàng trống: Khi chưa có sản phẩm nào hoặc sau khi xóa hết sản phẩm, hệ thống hiển thị thông báo giỏ hàng trống kèm nút quay lại chọn sách và vô hiệu hóa nút tiến hành thanh toán.

#### UC-C2: Đặt hàng (COD)
- **Tác nhân:** Customer.
- **Mô tả:** CKhách hàng hoàn tất thông tin giao nhận, chọn phương thức vận chuyển, áp dụng mã giảm giá (Voucher) và chọn hình thức thanh toán (COD / VNPay / MoMo) để tạo đơn hàng từ giỏ hàng hiện tại (/checkout).
- **Tiền điều kiện:** Người dùng đã đăng nhập với tài khoản Khách hàng.
                      Giỏ hàng có ít nhất 1 ấn phẩm còn đủ số lượng tồn kho.
- **Luồng chính:**
  1. Từ trang Giỏ hàng (/cart), khách hàng nhấn nút TIẾN HÀNH GIAO NHẬN & THANH TOÁN (hoặc nhấn Mua ngay tại trang chi tiết sản phẩm) để truy cập trang /checkout.
  2. Hệ thống hiển thị thanh tiến trình chuyển sang bước 2. Giao nhận & Thanh toán cùng giao diện 2 cột (cột trái nhập thông tin giao nhận & thanh toán, cột phải tóm tắt đơn hàng).
  3. Nhập thông tin Địa Chỉ Nhận Sách:
        - Khách hàng có thể chọn Địa chỉ lưu sẵn (tự động điền sẵn Họ tên người nhận, SĐT liên lạc, Email nhận thông báo đơn hàng và Địa chỉ mặc định từ hồ sơ) hoặc chọn Giao tới địa chỉ mới (nhập Họ tên, SĐT, chọn Tỉnh/Thành phố, Quận/Huyện/Thị xã, Phường/Xã/Thị trấn, nhập Số nhà, tên đường kèm bản đồ xem trước vị trí giao). 
        - Nhập Ghi chú giao hàng (tùy chọn).
  4. Chọn Phương Thức Vận Chuyển: Chọn Tiêu Chuẩn (2 - 3 ngày) (Miễn phí) hoặc Giao Hỏa Tốc Nội Thành 2H (+35.000đ).
  5. Chọn Phương Thức Thanh Toán: Chọn một trong các hình thức: Thanh toán khi nhận hàng (COD), Thanh toán qua VNPay, hoặc Thanh toán qua Ví MoMo.
  6. Áp dụng Voucher ưu đãi (tùy chọn):
        - Tại cột phải (Đơn Hàng), khách hàng nhấn nút Chọn > ở mục Voucher của bạn để mở cửa sổ Chọn Voucher Ưu Đãi.
        - Hệ thống hiển thị danh sách voucher kèm điều kiện giá trị đơn tối thiểu, hạn sử dụng và nút Áp dụng cho các mã đủ điều kiện (cho phép đổi hoặc gỡ mã đã chọn). Hệ thống tự động trừ tiền giảm giá và cập nhật lại Tổng thanh toán.
  7. Khách hàng nhấn nút XÁC NHẬN ĐẶT HÀNG & THANH TOÁN →.
  8. Hệ thống kiểm tra lại tồn kho của các ấn phẩm trong giỏ, khởi tạo đơn hàng mới (trạng thái Chờ xác nhận), lưu đơn giá tại thời điểm mua, trừ số lượng tồn kho tương ứng và làm trống giỏ hàng.
  9. Hệ thống chuyển thanh tiến trình sang bước 3. Hoàn tất đơn, hiển thị thông báo "ĐẶT HÀNG THÀNH CÔNG • MÃ ĐƠN #..." kèm tóm tắt thông tin người nhận, địa chỉ giao, hình thức thanh toán, ưu đãi voucher, tổng thanh toán và hai nút điều hướng: Tiếp tục khám phá sách hoặc Về trang chủ.
- **Luồng ngoại lệ:** 
        - Bỏ trống thông tin giao nhận bắt buộc (Họ tên, SĐT, Địa chỉ) hoặc SĐT sai định dạng: Hệ thống giữ nguyên trang thanh toán và hiển thị thông báo lỗi tiếng Việt tại trường nhập liệu bị thiếu/sai.
        - Sản phẩm trong giỏ vừa hết hàng hoặc không đủ tồn kho ngay lúc bấm xác nhận đặt hàng: Hệ thống hủy giao dịch đặt hàng (không trừ kho, không tạo đơn) và thông báo sản phẩm không đủ số lượng để khách hàng điều chỉnh lại giỏ hàng.

#### UC-C3: Xem đơn hàng của tôi
- **Tác nhân:** Customer.
- **Mô tả:** Khách hàng theo dõi lịch sử mua hàng, lọc đơn theo trạng thái, mở rộng xem chi tiết thông tin giao nhận, hủy đơn khi còn chờ xác nhận, liên hệ cửa hàng, mua lại hoặc gửi yêu cầu hoàn đơn/đổi trả trên trang /account?tab=orders.
- **Tiền điều kiện** Người dùng đã đăng nhập với tài khoản Khách hàng.
- **Luồng chính:**
  1. Khách hàng nhấn vào biểu tượng tài khoản trên Header và chọn Đơn hàng của tôi (hoặc chọn tab Đơn hàng của tôi ở cột menu bên trái trong trang Tài khoản của tôi).
  2. Hệ thống hiển thị danh sách các đơn hàng thuộc về chính tài khoản đang đăng nhập kèm thanh lọc theo trạng thái (hiển thị kèm số lượng đơn của từng nhóm): Tất cả, Chờ xác nhận, Đang xử lý, Đang giao, Hoàn thành, Yêu cầu hoàn đơn, Đã hoàn đơn... cùng nút Làm mới.
  3. Trên mỗi thẻ đơn hàng, hệ thống hiển thị: Mã đơn (ví dụ: #MS29), nhãn trạng thái, thời gian đặt (và thời gian hoàn thành nếu có), danh sách các ấn phẩm trong đơn (ảnh bìa, tên sách, số lượng, đơn giá), tổng thanh toán và các nút thao tác tương ứng:
          - Xem chi tiết / Thu gọn: Khi nhấn Xem chi tiết, thẻ đơn hàng mở rộng để hiển thị thông tin Người nhận (họ tên, SĐT), Địa chỉ giao và hình thức Thanh toán; nút chuyển thành Thu gọn để đóng phần thông tin mở rộng.
          - Liên hệ cửa hàng: Hỗ trợ khách hàng kết nối nhanh với bộ phận chăm sóc của cửa hàng khi cần hỗ trợ về đơn hàng.
          - Hủy đơn (chỉ hiển thị khi đơn ở trạng thái Chờ xác nhận): Khách hàng nhấn nút Hủy đơn và xác nhận; hệ thống chuyển trạng thái đơn sang Đã hủy và hoàn lại số lượng tồn kho cho các ấn phẩm trong đơn.
          - Đánh giá & Mua lại (khi đơn ở trạng thái Hoàn thành): Khách hàng có thể nhấn nút ☆ Đánh giá bên cạnh từng cuốn sách để gửi nhận xét sản phẩm, hoặc nhấn Mua lại để thêm nhanh các ấn phẩm của đơn đó vào giỏ hàng.
          - Hoàn đơn / Đổi trả (chỉ hiển thị khi đơn Hoàn thành và còn trong thời hạn hỗ trợ 3 ngày): Khách hàng nhấn nút Hoàn đơn / Đổi trả để mở cửa sổ Phiếu Yêu Cầu Hoàn Đơn / Đổi Trả, chọn hình thức (Hoàn đơn & Hoàn tiền hoặc Đổi cuốn sách mới), tích chọn sách và số lượng muốn đổi, nhập lý do/mô tả tình trạng sách, tải lên hình ảnh chứng minh (tối đa 4 ảnh) và nhấn GỬI YÊU CẦU ĐỔI SÁCH. Khi hết thời hạn 3 ngày, nút Hoàn đơn / Đổi trả sẽ tự động ẩn đi.
- **Luồng ngoại lệ:**
          - Cố tình truy cập đơn hàng của người dùng khác: Hệ thống chặn quyền truy cập và chỉ hiển thị dữ liệu đơn hàng thuộc về tài khoản đang đăng nhập
          - Không có đơn hàng nào ở trạng thái đang lọc: Hệ thống hiển thị thông báo danh sách đơn hàng trống tương ứng.
          - Gửi phiếu hoàn đơn/đổi trả thiếu lý do hoặc tải lên quá 4 ảnh / sai định dạng ảnh: Hệ thống báo lỗi tiếng Việt và yêu cầu nhập bổ sung hợp lệ.

#### UC-C4: Xem hồ sơ cá nhân & Cập nhật
- **Tác nhân:** Khách hàng (Customer).
- **Mô tả:** Mô tả: Khách hàng xem thông tin tài khoản, hạng thành viên, cập nhật họ tên, số điện thoại, thiết lập địa chỉ nhận hàng mặc định và thay đổi mật khẩu đăng nhập tại trang Tài Khoản Của Tôi (/account).
- **Tiền điều kiện** Người dùng đã đăng nhập với tài khoản Khách hàng.
- **Luồng chính:**
  1. Xem tổng quan tài khoản:
          - Khách hàng nhấn vào biểu tượng tài khoản trên thanh Header và chọn Tài khoản của tôi để truy cập trang /account.
          - Hệ thống hiển thị cột thông tin bên trái gồm: Ảnh đại diện (chữ cái đầu tên người dùng), Hạng thành viên (ví dụ: Mầm Sách, Đọc Giả Vàng), thanh tiến trình tích lũy chi tiêu lên hạng tiếp theo và thanh điều hướng 3 mục: Thông tin cá nhân, Đổi mật khẩu, Đơn hàng của tôi.
  2. Cập nhật Thông tin cá nhân & Địa chỉ mặc định:
          - Tại tab Thông tin cá nhân, hệ thống hiển thị biểu mẫu Hồ Sơ Cá Nhân:
           + Email đăng nhập: Hiển thị ở chế độ chỉ đọc (không thể thay đổi).
           + Họ và tên (bắt buộc) và Số điện thoại.
           + Địa chỉ nhận hàng mặc định: Khách hàng nhấn nút Thay đổi để thiết lập hoặc chỉnh sửa địa chỉ (chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã và nhập Số nhà, tên đường) kèm bản đồ xem trước vị trí giao hàng.
          - Khách hàng chỉnh sửa thông tin và nhấn nút LƯU THAY ĐỔI.
          - Hệ thống hiển thị hộp thoại xác nhận cập nhật; khi khách hàng nhấn Xác nhận, hệ thống lưu thông tin mới vào hồ sơ và hiển thị thông báo cập nhật thành công.
  3. Đổi mật khẩu:
          - Khách hàng chọn tab Đổi mật khẩu ở cột menu bên trái để mở biểu mẫu Đổi Mật Khẩu.
          - Khách hàng nhập đầy đủ 3 trường (có nút con mắt để ẩn/hiện mật khẩu): Mật khẩu hiện tại, Mật khẩu mới (tối thiểu 8 ký tự) và Xác nhận mật khẩu mới.
          - Khách hàng nhấn nút CẬP NHẬT MẬT KHẨU.
          - Hệ thống kiểm tra tính hợp lệ (mật khẩu hiện tại chính xác, mật khẩu mới từ 8 ký tự trở lên và khớp với trường xác nhận), cập nhật mật khẩu mới và hiển thị khung thông báo màu xanh phía trên biểu mẫu: "Đổi mật khẩu thành công!" (đồng thời làm trống các ô nhập mật khẩu).
- **Luồng ngoại lệ:**
          - Bỏ trống Họ và tên hoặc nhập Số điện thoại không hợp lệ: Hệ thống báo lỗi tiếng Việt ngay tại trường nhập liệu và không lưu thay đổi.
          - Nhập Mật khẩu hiện tại không chính xác: Hệ thống từ chối đổi mật khẩu và hiển thị khung thông báo lỗi màu đỏ phía trên biểu mẫu.
          - Mật khẩu mới dưới 8 ký tự: Hệ thống hiển thị cảnh báo yêu cầu nhập tối thiểu 8 ký tự ngay tại ô nhập mật khẩu mới.
          - Mật khẩu mới và Xác nhận mật khẩu mới không trùng khớp: Hệ thống hiển thị khung thông báo lỗi màu đỏ phía trên biểu mẫu yêu cầu nhập lại cho khớp.
          - Mật khẩu mới trùng với mật khẩu hiện tại (hoặc vi phạm quy định trùng): Hệ thống hiển thị thông báo lỗi yêu cầu chọn mật khẩu mới khác.

#### UC-C6: Đánh giá sản phẩm
- **Tác nhân:** Customer.
- **Mô tả:** Khách hàng gửi đánh giá số sao và nhận xét chi tiết cho từng cuốn sách thuộc các đơn hàng đã giao thành công / hoàn thành tại trang Đơn hàng của tôi (`/account?tab=orders`).
- **Tiền điều kiện:** Người dùng đã đăng nhập với tài khoản Khách hàng và có đơn hàng ở trạng thái Hoàn thành hoặc Đã giao.
- **Luồng chính:**
  1. Mở cửa sổ đánh giá:
    - Tại trang Đơn Hàng Của Tôi (`/account?tab=orders`), khách hàng tìm đến đơn hàng ở trạng thái Hoàn thành (hoặc Đã giao).
    - Khách hàng nhấn nút ☆ Đánh giá nằm bên cạnh cuốn sách muốn nhận xét.
    - Hệ thống mở cửa sổ popup Chia sẻ cảm nhận của bạn hiển thị mã đơn hàng và thông tin sản phẩm đã mua (ảnh bìa, tên sách).
  2. Nhập nội dung và gửi đánh giá:
    - Khách hàng chọn Mức độ hài lòng của bạn từ 1 đến 5 sao (hệ thống hiển thị mô tả tương ứng với số sao đã chọn, ví dụ: 5 sao — Tuyệt vời).
    - Khách hàng nhập nội dung vào ô Nhận xét chi tiết (không bắt buộc) (giới hạn tối đa 1.000 ký tự, có bộ đếm số ký tự hiển thị bên dưới).
    - Khách hàng nhấn nút GỬI ĐÁNH GIÁ.
  3. Cập nhật trạng thái và hiển thị:
    - Hệ thống lưu đánh giá và cập nhật lại điểm trung bình sao của cuốn sách.
    - Trên dòng sản phẩm của đơn hàng đó, nút ☆ Đánh giá chuyển sang trạng thái đã hoàn tất ★ Đã đánh giá (X★) và vô hiệu hóa thao tác đánh giá lại cho cùng sản phẩm trong cùng đơn hàng.
    - Nếu khách hàng mua lại chính cuốn sách đó ở một đơn hàng khác (lần mua thứ 2 trở đi) và đơn mới hoàn thành, khách hàng vẫn được phép gửi đánh giá mới cho lần mua đó.
- **Luồng ngoại lệ:**
  - Chưa chọn mức đánh giá sao: Hệ thống chặn thao tác gửi và yêu cầu chọn số sao từ 1 đến 5.
  - Nhập nội dung nhận xét vượt quá 1.000 ký tự: Hệ thống giới hạn không cho nhập quá số ký tự quy định hoặc báo lỗi tiếng Việt.
  - Đã đánh giá sản phẩm trong đơn hàng hiện tại: Nút chuyển sang ★ Đã đánh giá (X★), không cho phép đánh giá trùng lặp nhiều lần trong cùng một đơn hàng.

---

### 2.3. NHÓM CHỨC NĂNG QUẢN TRỊ VIÊN (ADMIN)

> **Lưu ý cho Dev:** Tất cả API dưới đây phải gắn Middleware `auth:sanctum` + Middleware kiểm tra quyền Admin.

#### UC-A1: Quản lý danh mục
- **Tác nhân:** Admin.
- **Mô tả:** Quản trị viên xem danh sách, tìm kiếm, lọc theo trạng thái, thêm mới, chỉnh sửa, ẩn/hiện hoặc xóa các danh mục sách trên hệ thống tại trang Quản lý danh mục (`/admin/categories`).
- **Tiền điều kiện:** Người dùng đã đăng nhập bằng tài khoản có vai trò Quản trị viên (`admin`) và truy cập vào khu vực quản trị (thông qua nút **Quản lý cửa hàng** trên menu tài khoản hoặc đường dẫn `/admin/categories`).
- **Luồng chính:**
  1. Xem, tìm kiếm và lọc danh sách danh mục:
    - Quản trị viên chọn mục **Quản lý danh mục** trên thanh menu bên trái của trang quản trị.
    - Hệ thống hiển thị bảng **Danh Sách Danh Mục Sách** gồm các cột: *ID*, *Tên danh mục*, *Mô tả*, *Thứ tự*, *Số đầu sách*, *Trạng thái* (*Hiển thị* / *Đang ẩn*) và *Thao tác* (*Sửa*, *Ẩn/Hiện*, *Xóa*).
    - Quản trị viên có thể nhập từ khóa vào ô tìm kiếm (*Tìm theo tên danh mục hoặc mô tả...*) hoặc chọn bộ lọc trạng thái (*Tất cả trạng thái*, *Đang hiển thị*, *Đang ẩn*) để thu hẹp danh sách.
  2. Thêm danh mục mới:
    - Quản trị viên nhấn nút **+ THÊM DANH MỤC** ở góc trên bên phải bảng danh sách.
    - Hệ thống mở cửa sổ biểu mẫu **Thêm Danh Mục Mới** gồm các trường: *Tên danh mục* (bắt buộc), *Thứ tự hiển thị*, *Trạng thái* (*Hiển thị* / *Đang ẩn*) và *Mô tả*.
    - Quản trị viên điền thông tin và nhấn **THÊM DANH MỤC**; hệ thống hiển thị hộp thoại **Xác nhận thêm danh mục mới**.
    - Quản trị viên nhấn **THÊM DANH MỤC** trên hộp thoại xác nhận; hệ thống lưu danh mục mới và hiển thị thông báo thành công. (Nếu đang nhập dữ liệu mà nhấn **Hủy**, hệ thống hiển thị hộp thoại **Xác nhận hủy thao tác** để tránh mất dữ liệu ngoài ý muốn).
  3. Chỉnh sửa danh mục:
    - Quản trị viên nhấn nút **Sửa** tại dòng danh mục tương ứng.
    - Hệ thống mở cửa sổ **Cập Nhật Danh Mục** với dữ liệu hiện tại của danh mục đó.
    - Quản trị viên thay đổi thông tin và nhấn **LƯU THAY ĐỔI**; hệ thống cập nhật dữ liệu và hiển thị thông báo thành công.
  4. Ẩn / Hiện nhanh danh mục:
    - Quản trị viên nhấn nút **Ẩn** (hoặc **Hiện**) tại cột *Thao tác* của danh mục.
    - Hệ thống hiển thị hộp thoại **Xác nhận ẩn/hiện danh mục**; khi quản trị viên nhấn **XÁC NHẬN ẨN** (hoặc xác nhận hiện), hệ thống chuyển đổi trạng thái hiển thị của danh mục và hiển thị thông báo xanh phía trên bảng: *"Đã cập nhật trạng thái danh mục..."*.
  5. Xóa danh mục:
    - Quản trị viên nhấn nút **Xóa** tại dòng danh mục muốn xóa.
    - Hệ thống hiển thị hộp thoại **Xác nhận xóa danh mục** kèm cảnh báo ảnh hưởng đến các sách thuộc danh mục; khi quản trị viên nhấn **XÓA DANH MỤC**, hệ thống thực hiện xóa và cập nhật lại bảng danh sách.
- **Luồng ngoại lệ:**
  - Bỏ trống Tên danh mục hoặc nhập tên danh mục đã tồn tại trong hệ thống: Hệ thống báo lỗi tiếng Việt ngay tại biểu mẫu và không cho phép lưu.
  - Xóa danh mục đang chứa đầu sách liên kết (nếu hệ thống ràng buộc bảo vệ dữ liệu): Hệ thống từ chối xóa và hiển thị thông báo tiếng Việt hướng dẫn chuyển sách hoặc chuyển danh mục sang trạng thái *Ẩn* thay thế.

#### UC-A2: Quản lý sản phẩm (Sách)
- **Tác nhân:** Admin.
- **Mô tả:** Quản trị viên theo dõi cảnh báo tồn kho, tìm kiếm, lọc, thêm đầu sách mới, cập nhật thông tin sách/nhập kho, ẩn/hiện hoặc xóa ấn phẩm sách tại trang Quản lý sản phẩm (`/admin/products`).
- **Tiền điều kiện:** Người dùng đã đăng nhập bằng tài khoản có vai trò Quản trị viên (`admin`) và truy cập trang Quản lý sản phẩm (`/admin/products`).
- **Luồng chính:**
  1. Theo dõi cảnh báo tồn kho và danh sách ấn phẩm:
    - Quản trị viên chọn mục **Quản lý sản phẩm** trên thanh menu bên trái của trang quản trị.
    - Hệ thống hiển thị khối **Cảnh báo tồn kho** ở phía trên (thống kê số đầu sách dưới ngưỡng 5 cuốn gồm *Hết hàng* và *Sắp hết*, kèm nút **+ Nhập kho** nhanh trên từng thẻ sách và nút *Thu gọn/Mở rộng*).
    - Bên dưới là bảng **Danh Sách Ấn Phẩm Sách** gồm các cột: *ID*, *Ấn phẩm & Tác giả* (ảnh bìa, tên sách, tác giả), *NXB / Năm XB*, *Danh mục*, *Giá bán & Giảm giá*, *Kho* (số lượng tồn hoặc nhãn *Còn 1*, *Hết (0)*), *Trạng thái* (*Hiển thị* / *Đang ẩn*) và *Thao tác* (*Nhập / Sửa* hoặc *Sửa*, *Ẩn/Hiện*, *Xóa*).
  2. Tìm kiếm và lọc sản phẩm:
    - Quản trị viên nhập từ khóa vào ô tìm kiếm (*Tìm theo tên sách hoặc tác giả...*), chọn bộ lọc **Danh mục** (*Tất cả danh mục* hoặc từng thể loại cụ thể) và bộ lọc **Tồn kho** (*Tất cả tồn kho*, *Cần nhập thêm (≤ 5 cuốn)*, *Đã hết hàng (0 cuốn)*, *Sắp hết hàng (1 - 5 cuốn)*) rồi nhấn **Tìm kiếm** (hoặc nhấn **Xóa lọc** để đặt lại mặc định).
  3. Thêm đầu sách mới:
    - Quản trị viên nhấn nút **+ THÊM SÁCH MỚI** ở góc trên bên phải bảng danh sách.
    - Hệ thống mở cửa sổ biểu mẫu **Thêm Đầu Sách Mới** gồm các trường: *Tên sách* (bắt buộc), *Tác giả*, *Nhà xuất bản*, *Năm xuất bản*, *Số trang*, *Giá niêm yết (đ)* (bắt buộc), *Giảm giá (%)*, *Tồn kho* (bắt buộc, tối thiểu 1), *Danh mục* (bắt buộc), *Trạng thái* (*Hiển thị* / *Đang ẩn*), *Mô tả nội dung sách* và tải lên *Ảnh bìa (JPG / PNG, tối đa 2 MB)*.
    - Quản trị viên điền thông tin và nhấn **THÊM SÁCH MỚI**; hệ thống lưu ấn phẩm mới vào kho và cập nhật danh sách. (Nếu đang nhập dữ liệu mà nhấn **Hủy**, hệ thống hiển thị hộp thoại **Xác nhận hủy thao tác** để tránh mất dữ liệu chưa lưu).
  4. Cập nhật thông tin sách & Nhập kho:
    - Quản trị viên nhấn nút **Nhập / Sửa** (hoặc **Sửa**) tại dòng sách tương ứng, hoặc nhấn **+ Nhập kho** trên thẻ cảnh báo tồn kho.
    - Hệ thống mở cửa sổ **Cập Nhật Thông Tin Sách** với dữ liệu hiện tại của sách (tự động tính và hiển thị xem trước *Giá hiển thị tới khách hàng* theo giá niêm yết và phần trăm giảm giá).
    - Quản trị viên điều chỉnh số lượng tồn kho hoặc thông tin sách và nhấn **LƯU THAY ĐỔI**; hệ thống mở hộp thoại **Xác nhận cập nhật thông tin sách**, khi nhấn **LƯU THAY ĐỔI** xác nhận thì hệ thống cập nhật dữ liệu mới.
  5. Ẩn / Hiện và Xóa ấn phẩm sách:
    - **Ẩn / Hiện:** Quản trị viên nhấn nút **Ẩn** (hoặc **Hiện**) tại cột *Thao tác*; hệ thống hiển thị hộp thoại **Xác nhận ẩn sản phẩm**, nhấn **ẨN SẢN PHẨM** (hoặc xác nhận hiện) để cập nhật trạng thái hiển thị ngoài cửa hàng.
    - **Xóa:** Quản trị viên nhấn nút **Xóa** tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận xóa ấn phẩm sách**, nhấn **XÓA SÁCH** để xóa vĩnh viễn ấn phẩm khỏi danh sách.
- **Luồng ngoại lệ:**
  - Bỏ trống các trường bắt buộc (*Tên sách*, *Giá niêm yết*, *Tồn kho*, *Danh mục*) hoặc nhập giá/tồn kho không hợp lệ (số âm): Hệ thống báo lỗi tiếng Việt ngay tại biểu mẫu và không cho phép lưu.
  - Tải lên tệp ảnh bìa sai định dạng (không phải JPG/PNG) hoặc vượt quá dung lượng 2 MB: Hệ thống từ chối tệp và hiển thị thông báo lỗi tiếng Việt.
  - Xóa cuốn sách đã từng phát sinh trong đơn hàng của khách hàng: Hệ thống từ chối xóa cứng để bảo toàn lịch sử đơn hàng và thông báo khuyến nghị chuyển sang trạng thái *Ẩn* thay thế.

#### UC-A3: Quản lý đơn hàng
- **Tác nhân:** Admin.
- **Mô tả:** Quản trị viên theo dõi, tìm kiếm, lọc danh sách đơn hàng, xem chi tiết đơn, xử lý quy trình giao nhận qua các trạng thái (*Chờ xác nhận* $\rightarrow$ *Chuẩn bị hàng* $\rightarrow$ *Đang giao* $\rightarrow$ *Hoàn thành*), xử lý hủy đơn và hoàn đơn/đổi trả tại trang Quản lý đơn hàng (`/admin/orders`).
- **Tiền điều kiện:** Người dùng đã đăng nhập bằng tài khoản có vai trò Quản trị viên (`admin`) và truy cập trang Quản lý đơn hàng (`/admin/orders`).
- **Luồng chính:**
  1. Xem, tìm kiếm và lọc danh sách đơn hàng:
    - Quản trị viên chọn mục **Quản lý đơn hàng** trên thanh menu bên trái (hiển thị kèm huy hiệu đếm số đơn mới chờ xác nhận) hoặc nhấn nút **XEM ĐƠN CHỜ DUYỆT** trên thanh thông báo nhắc việc phía trên.
    - Hệ thống hiển thị danh sách đơn hàng kèm thanh lọc theo trạng thái (hiển thị số lượng đơn từng nhóm): *Tất cả*, *Chờ xác nhận*, *Chuẩn bị hàng*, *Đang giao*, *Hoàn thành*, *Yêu cầu hoàn đơn*, *Đã hoàn đơn*, *Đã hủy* và nút **LÀM MỚI DANH SÁCH**.
    - Quản trị viên có thể nhập từ khóa vào ô tìm kiếm (*Tìm theo mã đơn, tên người nhận hoặc số điện thoại...*) và nhấn **Tìm đơn**.
    - Bảng danh sách hiển thị các cột: *Mã đơn*, *Khách hàng* (tên, SĐT), *Vận chuyển* (đơn vị vận chuyển, mã vận đơn hoặc *Chưa bàn giao*), *Ngày đặt*, *Tổng thanh toán*, *Trạng thái* và *Thao tác*.
  2. Xem chi tiết và cập nhật trạng thái đơn hàng:
    - **Từ *Chờ xác nhận* sang *Chuẩn bị hàng* (hoặc *Hủy đơn*):** Quản trị viên nhấn nút **Chuẩn bị hàng** tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận chuyển trạng thái đơn hàng**, nhấn **XÁC NHẬN CẬP NHẬT** để chuyển đơn sang trạng thái *Chuẩn bị hàng*. (Nếu nhấn **Hủy đơn**, hệ thống chuyển đơn sang *Đã hủy* và hoàn lại tồn kho).
    - **Từ *Chuẩn bị hàng* sang *Đang giao* (Bàn giao vận chuyển):** Quản trị viên nhấn nút **Bàn giao vận chuyển**; hệ thống mở cửa sổ **Nhập Thông Tin Bàn Giao (Đang giao)** yêu cầu chọn *Đơn vị vận chuyển* (bắt buộc, ví dụ: *Giao Hàng Nhanh (GHN)*), nhập *Mã vận đơn / Mã giao nhận* (bắt buộc), *Nhân viên giao hàng / SĐT liên hệ* và *Ghi chú bàn giao*. Nhấn **TIẾP TỤC XÁC NHẬN** -> kiểm tra lại trên hộp thoại **Xác nhận thông tin bàn giao & chuyển trạng thái** -> nhấn **XÁC NHẬN BÀN GIAO**.
    - **Từ *Đang giao* sang *Đã giao* / *Hoàn thành*:** Quản trị viên nhấn nút **Xác nhận đã giao**; sau khi xác nhận, đơn chuyển sang trạng thái *Đã giao (3 ngày đổi/hoàn)* và hệ thống thông báo *"Đơn sẽ tự động hoàn thành sau 3 ngày nếu khách không yêu cầu hoàn đơn"*, hoặc quản trị viên có thể nhấn **Chốt hoàn thành** để kết thúc đơn ngay.
    - **Thao tác qua cửa sổ Chi Tiết & Cập Nhật Đơn Hàng:** Quản trị viên nhấn nút **Chi tiết / Sửa** tại bất kỳ đơn hàng nào để xem thông tin người nhận, địa chỉ giao, tổng thanh toán, danh sách ấn phẩm và chọn trạng thái xử lý mới từ danh sách thả xuống.
- **Luồng ngoại lệ:**
  - Chuyển đơn sang *Đang giao* nhưng bỏ trống *Đơn vị vận chuyển* hoặc *Mã vận đơn*: Hệ thống báo lỗi tiếng Việt và không cho phép bàn giao vận chuyển.
  - Danh sách không có đơn hàng nào khớp với từ khóa tìm kiếm hoặc tab trạng thái đang chọn: Hệ thống hiển thị thông báo *"Không có đơn hàng nào."* ở giữa bảng dữ liệu[cite: 68, 69, 70, 71, 72, 73, 74, 75, 76, 77].

#### UC-A4: Quản lý người dùng
- **Tác nhân:** Admin.
- **Mô tả:** Quản trị viên xem danh sách, tìm kiếm, lọc theo cấp bậc thành viên, thêm tài khoản mới, chỉnh sửa thông tin/phân quyền/cấp bậc, khóa/mở khóa hoặc xóa tài khoản người dùng tại trang Quản lý người dùng (`/admin/users`).
- **Tiền điều kiện:** Người dùng đã đăng nhập bằng tài khoản có vai trò Quản trị viên (`admin`) và truy cập trang Quản lý người dùng (`/admin/users`).
- **Luồng chính:**
  1. Xem, tìm kiếm và lọc danh sách người dùng:
    - Quản trị viên chọn mục **Quản lý người dùng** trên thanh menu bên trái của trang quản trị.
    - Hệ thống hiển thị bảng **Danh Sách Người Dùng** gồm các cột: *ID*, *Độc giả* (họ tên, email), *Liên hệ* (SĐT, địa chỉ), *Cấp bậc & Tích lũy* (hạng thành viên và tổng chi tiêu tích lũy), *Vai trò* (*Độc giả* / *Quản trị viên*), *Trạng thái* (*Hoạt động* / *Đã khóa*) và *Thao tác* (*Sửa*, *Khóa/Mở*, *Xóa*).
    - Quản trị viên có thể nhập từ khóa vào ô tìm kiếm (*Tìm theo họ tên, email, SĐT...*), chọn bộ lọc **Cấp bậc thành viên** (*Tất cả cấp bậc thành viên*, *01. Mầm Sách*, *02. Người Đọc*, *03. Tri Thức*, *04. Học Giả*, *05. Đại Sứ Tri Thức*) rồi nhấn **Tìm kiếm**.
  2. Thêm người dùng mới:
    - Quản trị viên nhấn nút **+ THÊM NGƯỜI DÙNG** ở góc trên bên phải bảng danh sách.
    - Hệ thống mở cửa sổ biểu mẫu tạo tài khoản mới gồm các trường thông tin cơ bản, phân quyền vai trò, cấp bậc thành viên và trạng thái.
    - Quản trị viên điền thông tin và nhấn lưu; hệ thống kiểm tra dữ liệu, khởi tạo tài khoản mới và cập nhật danh sách.
  3. Chỉnh sửa thông tin và phân quyền người dùng:
    - Quản trị viên nhấn nút **Sửa** tại dòng tài khoản tương ứng.
    - Hệ thống mở cửa sổ **Cập Nhật Thông Tin Người Dùng** gồm các trường: *Họ và tên* (bắt buộc), *Email đăng nhập* (bắt buộc), *Số điện thoại*, *Mật khẩu mới (để trống nếu không đổi, tối thiểu 8 ký tự)*, *Cấp bậc thành viên*, *Vai trò* (*Độc giả (Customer)* / *Quản trị viên (Admin)*), *Trạng thái* (*Hoạt động* / *Đã khóa*) và *Địa chỉ nhận hàng mặc định*.
    - Quản trị viên điều chỉnh thông tin và nhấn **LƯU THAY ĐỔI**; hệ thống cập nhật dữ liệu và hiển thị thông báo thành công.
  4. Khóa / Mở khóa và Xóa tài khoản:
    - **Khóa / Mở khóa:** Quản trị viên nhấn nút **Khóa** (hoặc **Mở**) tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận khóa tài khoản** cảnh báo người dùng sẽ không thể đăng nhập sau khi bị khóa, nhấn **KHÓA TÀI KHOẢN** (hoặc mở khóa) để cập nhật trạng thái.
    - **Xóa tài khoản:** Quản trị viên nhấn nút **Xóa** tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận xóa người dùng**, nhấn **XÓA NGƯỜI DÙNG** để xóa vĩnh viễn tài khoản khỏi hệ thống.
- **Luồng ngoại lệ:**
  - Bỏ trống các trường bắt buộc (*Họ và tên*, *Email*), nhập sai định dạng email, trùng email đã tồn tại hoặc nhập mật khẩu mới dưới 8 ký tự: Hệ thống báo lỗi tiếng Việt ngay tại biểu mẫu và không lưu thay đổi.
  - Quản trị viên tự khóa hoặc tự xóa chính tài khoản Admin đang đăng nhập (hoặc xóa tài khoản đang có dữ liệu đơn hàng ràng buộc): Hệ thống từ chối thao tác và hiển thị thông báo lỗi tiếng Việt.

#### UC-A5: Thống kê doanh thu, đơn hàng và kiểm duyệt đánh giá (Tổng quan)
- **Tác nhân:** Admin.
- **Mô tả:** Quản trị viên theo dõi các chỉ số kinh doanh tổng quan, lọc biểu đồ doanh thu theo khoảng thời gian, xem xếp hạng sách bán chạy và kiểm duyệt (ẩn/hiện hoặc xóa) đánh giá của khách hàng tại trang Tổng quan (`/admin`).
- **Tiền điều kiện:** Người dùng đã đăng nhập bằng tài khoản có vai trò Quản trị viên (`admin`) và truy cập trang Tổng quan (`/admin`).
- **Luồng chính:**
  1. Xem các chỉ số KPI tổng quan:
    - Quản trị viên chọn mục **Tổng quan** trên thanh menu bên trái của trang quản trị.
    - Hệ thống hiển thị 4 thẻ thống kê tổng hợp:
      - **Doanh thu năm nay:** Tổng doanh thu từ các đơn hàng đã hoàn thành kèm khoảng thời gian thống kê.
      - **Tổng đơn hàng:** Tổng số đơn hàng phát sinh (kèm số lượng đơn hoàn thành và đơn đã hủy).
      - **Tổng đầu sách:** Tổng số đầu sách trên hệ thống (kèm cảnh báo số đầu sách sắp hết và hết hàng).
      - **Đánh giá trung bình:** Điểm sao trung bình toàn hệ thống (thang 5 sao) và tổng số lượt đánh giá.
  2. Lọc biểu đồ doanh thu và theo dõi tình hình kinh doanh theo kỳ:
    - Tại khối **Biểu đồ thống kê doanh thu**, quản trị viên chọn khoảng thời gian (*Từ ngày* – *Đến ngày*) và nhấn nút biểu tượng bộ lọc; hệ thống cập nhật biểu đồ cột doanh thu theo từng tháng (chỉ tính các đơn hàng ở trạng thái *Đã hoàn thành*).
    - Bên cạnh là khối **Trạng thái đơn hàng** hiển thị thanh tỷ lệ phần trăm từng nhóm trạng thái (*Chờ xác nhận*, *Đang giao*, *Đã hoàn thành*, *Đã hủy*) trong kỳ.
    - Phía dưới hiển thị danh sách **Top 5 sách bán chạy** (xếp hạng theo số lượng cuốn bán ra kèm doanh thu và tồn kho hiện tại) và bảng **Danh sách đơn hàng** theo kỳ (có bộ lọc theo trạng thái đơn).
  3. Kiểm duyệt đánh giá sản phẩm theo kỳ:
    - Tại bảng **Đánh giá sản phẩm theo kỳ**, quản trị viên xem danh sách nhận xét gồm các cột: *Khách hàng* (tên, thời gian gửi), *Sản phẩm*, *Đánh giá* (số sao), *Nội dung nhận xét*, *Trạng thái* (*Hiển thị* / *Đang ẩn*) và *Thao tác* (*Ẩn/Hiện*, *Xóa*).
    - Quản trị viên có thể lọc danh sách theo số sao (*Tất cả số sao* hoặc từ 1 đến 5 sao).
    - **Ẩn / Hiện đánh giá:** Quản trị viên nhấn nút **Ẩn** (hoặc **Hiện**) tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận ẩn đánh giá** hiển thị tên khách hàng, tên sách và mức sao; nhấn **XÁC NHẬN ẨN** để ẩn nhận xét khỏi trang chi tiết sản phẩm.
    - **Xóa đánh giá:** Quản trị viên nhấn nút **Xóa** và xác nhận để gỡ bỏ đánh giá vi phạm khỏi hệ thống.
- **Luồng ngoại lệ:**
  - Chọn ngày bắt đầu lớn hơn ngày kết thúc trên bộ lọc thời gian: Hệ thống cảnh báo khoảng thời gian không hợp lệ hoặc tự động điều chỉnh về mốc hợp lệ.
  - Không có dữ liệu doanh thu, đơn hàng hoặc đánh giá trong khoảng thời gian đã lọc: Hệ thống hiển thị giá trị `0 đ` trên biểu đồ và thông báo danh sách trống tương ứng.

 #### UC-A6: Quản lý voucher khuyến mãi
- **Tác nhân:** Admin.
- **Mô tả:** Quản trị viên tạo mới, tìm kiếm, lọc theo trạng thái, cập nhật thông tin, tạm ngưng/kích hoạt hoặc xóa mã giảm giá (voucher) theo hạng thành viên, điều kiện đơn tối thiểu và giới hạn lượt sử dụng tại trang Quản lý voucher (`/admin/vouchers`).
- **Tiền điều kiện:** Người dùng đã đăng nhập bằng tài khoản có vai trò Quản trị viên (`admin`) và truy cập trang Quản lý voucher (`/admin/vouchers`).
- **Luồng chính:**
  1. Xem, tìm kiếm và lọc danh sách voucher:
    - Quản trị viên chọn mục **Quản lý voucher** trên thanh menu bên trái của trang quản trị.
    - Hệ thống hiển thị bảng **Quản Lý Voucher Khuyến Mãi** gồm các cột: *Mã voucher* (mã code và tên chương trình), *Mức giảm & Điều kiện* (số tiền/phần trăm giảm và giá trị đơn tối thiểu), *Hạng thành viên & Phân phối*, *Lượt sử dụng* (số lượt đã dùng / tổng phát hành), *Thời gian áp dụng* (ngày bắt đầu – ngày kết thúc), *Trạng thái* (*Đang chạy*, *Đã hết hạn*, *Hết lượt dùng*, *Tạm ngưng*) và *Thao tác* (*Sửa*, *Tắt/Bật*, *Xóa*).
    - Quản trị viên có thể nhập từ khóa vào ô tìm kiếm (*Tìm theo mã voucher, tên chương trình hoặc hạng thành viên...*) hoặc lọc theo danh sách thả xuống **Trạng thái**.
  2. Thêm voucher khuyến mãi mới:
    - Quản trị viên nhấn nút **+ THÊM VOUCHER MỚI** ở góc trên bên phải bảng danh sách.
    - Hệ thống mở cửa sổ biểu mẫu **Thêm Voucher Khuyến Mãi** gồm các trường:
      - *Mã voucher* (bắt buộc, ví dụ: `BOOKHOUSE20`) và *Tên chương trình*.
      - *Loại giảm giá* (*Theo phần trăm (%)* hoặc *Số tiền cố định (đ)*), *Giá trị giảm* (bắt buộc) và *Giảm tối đa (đ)*.
      - *Giá trị đơn tối thiểu (đ)* và *Số lượng voucher phát hành (0 = không giới hạn)*.
      - *Đối tượng hạng thành viên áp dụng*: Chọn *Tất cả cấp bậc* hoặc tích chọn từng cấp bậc cụ thể (*Cấp 1: Mầm Sách*, *Cấp 2: Bạn Đọc Tích Cực*, *Cấp 3: Độc Giả Thân Thiết*, *Cấp 4: Tri Kỷ Sách*, *Cấp 5: Đại Sứ Tri Thức*).
      - *Chế độ phân phối voucher* (ví dụ: *Mở chung cho tất cả hạng đã chọn*) và *Thời gian áp dụng* (*Ngày bắt đầu*, *Ngày kết thúc*).
    - Quản trị viên điền đầy đủ thông tin và nhấn **PHÁT HÀNH VOUCHER**; hệ thống lưu mã khuyến mãi mới và cập nhật danh sách.
  3. Cập nhật thông tin voucher:
    - Quản trị viên nhấn nút **Sửa** tại dòng voucher tương ứng.
    - Hệ thống mở cửa sổ **Cập Nhật Voucher Khuyến Mãi** với thông tin hiện tại của mã giảm giá đó.
    - Quản trị viên điều chỉnh thông tin (mức giảm, đơn tối thiểu, hạng thành viên, ngày bắt đầu/kết thúc, trạng thái) và nhấn **LƯU VOUCHER**; hệ thống cập nhật dữ liệu và hiển thị thông báo thành công.
  4. Tạm ngưng / Kích hoạt và Xóa voucher:
    - **Tạm ngưng / Kích hoạt:** Quản trị viên nhấn nút **Tắt** (hoặc **Bật**) tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận tạm ngưng voucher**, nhấn **TẠM NGƯNG** (hoặc kích hoạt) để đổi trạng thái hoạt động của mã.
    - **Xóa voucher:** Quản trị viên nhấn nút **Xóa** tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận xóa voucher khuyến mãi**, nhấn **XÓA VOUCHER** để xóa vĩnh viễn mã khuyến mãi khỏi hệ thống.
- **Luồng ngoại lệ:**
  - Bỏ trống *Mã voucher* hoặc *Giá trị giảm*, nhập mã voucher đã tồn tại, hoặc chọn *Ngày kết thúc* sớm hơn *Ngày bắt đầu*: Hệ thống báo lỗi tiếng Việt ngay tại biểu mẫu và không cho phép phát hành/lưu.
  - Nhập giá trị giảm phần trăm vượt quá 100% hoặc giá trị âm: Hệ thống từ chối lưu và hiển thị thông báo lỗi tiếng Việt.

  #### UC-A7: Quản lý banner quảng cáo
- **Tác nhân:** Admin.
- **Mô tả:** Quản trị viên quản lý danh sách slide quảng bá và trích dẫn nổi bật hiển thị trên trang chủ (tìm kiếm, lọc trạng thái, thêm mới, chỉnh sửa, ẩn/hiện hoặc xóa banner liên kết với sách/danh mục) tại trang Quản lý banner (`/admin/banners`).
- **Tiền điều kiện:** Người dùng đã đăng nhập bằng tài khoản có vai trò Quản trị viên (`admin`) và truy cập trang Quản lý banner (`/admin/banners`).
- **Luồng chính:**
  1. Xem, tìm kiếm và lọc danh sách banner:
    - Quản trị viên chọn mục **Quản lý banner** trên thanh menu bên trái của trang quản trị.
    - Hệ thống hiển thị bảng **Danh Sách Banner Quảng Cáo** gồm các cột: *Thứ tự* (`#0`, `#1`, `#2`...), *Hình ảnh*, *Tiêu đề & Nội dung quảng cáo* (nhãn badge, tiêu đề chính, mô tả ngắn), *Sách & Danh mục* (tên sách liên kết và danh mục tương ứng), *Trạng thái* (*Hiển thị* / *Đang ẩn*) và *Thao tác* (*Sửa*, *Ẩn/Hiện*, *Xóa*).
    - Quản trị viên có thể nhập từ khóa vào ô tìm kiếm (*Tìm kiếm banner theo tiêu đề, nội dung quảng cáo, danh mục hoặc sách...*) hoặc lọc theo danh sách thả xuống **Trạng thái**.
  2. Thêm banner quảng cáo mới:
    - Quản trị viên nhấn nút **+ THÊM BANNER MỚI** ở góc trên bên phải bảng danh sách.
    - Hệ thống mở cửa sổ biểu mẫu **Thêm Banner Quảng Cáo Mới** gồm các trường:
      - *Tiêu đề banner* (bắt buộc) và *Nhãn nổi bật (Badge)*.
      - *Sách được liên kết (Sắp xếp A-Z, gõ để tìm)*: Khi chọn đầu sách, hệ thống tự động điền trường *Danh mục (Tự động theo sách)* ở chế độ chỉ đọc.
      - *Thứ tự hiển thị* (ví dụ: *0 – Ưu tiên đầu tiên*, *Vị trí số 4*...) và *Trạng thái hiển thị* (*Hiển thị (Active)* / *Đang ẩn*).
      - *Nội dung quảng cáo* và tải lên *Hình ảnh banner (Tải tệp ảnh từ máy tính)*.
    - Quản trị viên điền thông tin và nhấn **THÊM BANNER**; hệ thống lưu banner mới và cập nhật lên slide trang chủ. (Nếu đang nhập dữ liệu mà nhấn **Hủy**, hệ thống hiển thị hộp thoại **Xác nhận hủy thao tác** để tránh mất nội dung chưa lưu).
  3. Cập nhật thông tin banner:
    - Quản trị viên nhấn nút **Sửa** tại dòng banner tương ứng.
    - Hệ thống mở cửa sổ **Cập Nhật Banner Quảng Cáo** với dữ liệu hiện tại của banner (cho phép đổi sách liên kết, thứ tự hiển thị, nội dung, thay ảnh mới hoặc nhấn *Xóa ảnh đã chọn*).
    - Quản trị viên chỉnh sửa thông tin và nhấn **LƯU THAY ĐỔI**; hệ thống cập nhật dữ liệu và hiển thị thông báo thành công.
  4. Ẩn / Hiện và Xóa banner:
    - **Ẩn / Hiện:** Quản trị viên nhấn nút **Ẩn** (hoặc **Hiện**) tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận ẩn banner**, nhấn **XÁC NHẬN ẨN** (hoặc xác nhận hiện) để bật/tắt hiển thị slide trên trang chủ.
    - **Xóa banner:** Quản trị viên nhấn nút **Xóa** tại cột *Thao tác*; hệ thống mở hộp thoại **Xác nhận xóa banner quảng cáo**, nhấn **XÓA BANNER** để xóa vĩnh viễn banner khỏi hệ thống.
- **Luồng ngoại lệ:**
  - Bỏ trống trường bắt buộc *Tiêu đề banner*: Hệ thống báo lỗi tiếng Việt ngay tại biểu mẫu và không cho phép lưu.
  - Tải lên tệp hình ảnh banner sai định dạng ảnh cho phép hoặc vượt quá dung lượng quy định: Hệ thống từ chối tệp và hiển thị thông báo lỗi tiếng Việt.