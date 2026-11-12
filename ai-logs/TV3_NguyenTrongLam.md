# AI log – TV3 – Nguyễn Trọng Lam

| Mục | Thông tin |
| :---- | :---- |
| Họ tên, MSSV | Nguyễn Trọng Lam – 0306241377 |
| Nhóm, đề tài | Nhóm [Số Nhóm] – Thương mại điện tử (Website bán sách) |
| Vai trò | TV3 – FE |
| Công cụ AI dùng | Gemini, Google Stitch |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| :---- | :---- | :---- | :---- | :---- |
| AI-01 | 11/11 | Thiết kế UI/UX | Phác thảo wireframe giao diện Trang chủ, Header và Thẻ sản phẩm bằng Stitch | `docs/wireframes` |
| AI-02 | 12/11 | Phát triển `TM-01` | Xây dựng component `ProductCard.jsx` tối giản và lưới trang chủ `Home.jsx` | `feat (TM-01): trang chu du lieu gia` |
| AI-03 | 12/11 | Phát triển `TM-01` | Tùy chỉnh `Header.jsx`, `Navbar.jsx` theo mẫu và nhận dữ liệu qua props | Nhánh `feature/TM-01-trang-chu` |
| AI-04 | 12/11 | Phát triển `TM-01` | Xây dựng component popup `LoginModal.jsx` và `RegisterModal.jsx` đồng bộ phong cách | Nhánh `feature/TM-01-trang-chu` |

---

### [AI-01] Phác thảo wireframe giao diện Trang chủ, Header và Thẻ sản phẩm
- Ngày / Người dùng: 11/11/2026 / Nguyễn Trọng Lam
- Công cụ: Google Stitch
- Giai đoạn: Thiết kế UI/UX (Wireframe)
- Task / Commit / PR: Thiết kế mẫu giao diện `TM-01` và Layout chung / `docs/wireframes`
- Mục đích: Tạo nhanh bản phác thảo trực quan, làm chuẩn thiết kế trước khi chuyển sang lập trình React + Tailwind CSS.
- Prompt chính: "Thiết kế giao diện trang chủ website bán sách 'Mọt Sách BookHouse' phong cách tối giản, tông màu kem ấm (#FAF8F5) và nâu đất (#9A5B13), gồm thanh tìm kiếm, thanh danh mục, lưới thẻ sản phẩm hiển thị ảnh bìa, tên sách, tác giả, giá bán và nút thêm vào giỏ."
- Kết quả AI trả về: Sinh ra các bản mockup giao diện hoàn chỉnh cho khu vực Header/Navbar và chi tiết thẻ sản phẩm.
- Đánh giá: Bố cục rõ ràng, thẩm mỹ tốt, phân cấp thông tin hợp lý. Tuy nhiên có một số chi tiết dư so với phạm vi Mốc 1 của nhóm (như logo phức tạp, ô lọc "Tất cả" ở thanh tìm kiếm, nút chọn ngôn ngữ `VN/EN`, nhãn giảm giá/bestseller/nút yêu thích trên thẻ sách).
- Đã chỉnh sửa gì: Chụp lại các thành phần cốt lõi làm mẫu tham chiếu và lược bỏ các chi tiết không cần thiết khi tiến hành lập trình.
- Cách kiểm chứng: Đối chiếu với đặc tả chức năng `TM-01` và thống nhất màu sắc, bố cục với các thành viên trong nhóm.
- Tỷ lệ nội dung AI còn giữ lại: 75%
- Điều học được: Dùng Stitch giúp rút ngắn đáng kể thời gian lên ý tưởng bố cục và phối màu, nhưng cần tự sàng lọc lại chi tiết để bám sát phạm vi đồ án.

---

### [AI-02] Xây dựng component `ProductCard.jsx` và lưới trang chủ `Home.jsx`
- Ngày / Người dùng: 12/11/2026 / Nguyễn Trọng Lam
- Công cụ: Gemini
- Giai đoạn: Phát triển chức năng `TM-01` (Trang chủ)
- Task / Commit / PR: `[TM-01]` Tạo component thẻ sản phẩm và dựng trang chủ dữ liệu giả / `feat (TM-01): trang chu du lieu gia` / Nhánh `feature/TM-01-trang-chu`
- Mục đích: Chuyển đổi mẫu thẻ sách từ wireframe thành component React + Tailwind CSS nhận `props` từ `Home.jsx` để tái sử dụng cho các chức năng `TM-02` và `TM-03`.
- Prompt chính: "Code 1 thẻ sách như ảnh mẫu bằng Tailwind CSS; rút gọn code để ProductCard.jsx tối giản, nhận props từ Home.jsx và bỏ phần like, discount, bestseller."
- Kết quả AI trả về: Ban đầu AI viết đầy đủ các nhãn giảm giá, bestseller và nút yêu thích; sau khi yêu cầu tinh gọn, AI sinh lại `ProductCard.jsx` ngắn gọn (~30 dòng), nhận trực tiếp `{ book, onAddToCart }` qua props và gợi ý lưới CSS Grid responsive (`grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- Đánh giá: Code sạch, gọn, dễ đọc và chuẩn hóa tốt việc tái sử dụng component trong React.
- Đã chỉnh sửa gì: Lược bỏ hoàn toàn các state/badge phụ, bổ sung mảng dữ liệu giả `MOCK_BOOKS` trong `Home.jsx` và gắn `Home.jsx` làm trang mặc định trong `resources/js/app.jsx`.
- Cách kiểm chứng: Kiểm tra hiển thị lưới sản phẩm trên trình duyệt ở 2 kích thước chuẩn `360px` và `1366px` bằng DevTools Responsive Mode.
- Tỷ lệ nội dung AI còn giữ lại: 60%
- Điều học được: Khi nhờ AI sinh UI, cần nêu rõ yêu cầu về mức độ tối giản và cấu trúc `props` ngay từ đầu để code gọn gàng ngay lần đầu.

---

### [AI-03] Tùy chỉnh `Header.jsx` và `Navbar.jsx` theo mẫu thiết kế
- Ngày / Người dùng: 12/11/2026 / Nguyễn Trọng Lam
- Công cụ: Gemini
- Giai đoạn: Phát triển chức năng `TM-01` (Layout điều hướng)
- Task / Commit / PR: Cập nhật `Header.jsx` và `Navbar.jsx` / Nhánh `feature/TM-01-trang-chu`
- Mục đích: Hoàn thiện thanh điều hướng đầu trang đồng bộ với wireframe (chỉ dùng chữ "Mọt Sách BookHouse", bỏ logo, bỏ ô "Tất cả" và bỏ chọn ngôn ngữ), đồng thời thiết kế giỏ hàng và tài khoản nhận dữ liệu qua `props` (mặc định giỏ hàng trống và hiển thị nút Đăng nhập).
- Prompt chính: "Sửa lại Header và Navbar theo mẫu (bỏ logo, chỉ dùng chữ Mọt Sách BookHouse, bỏ ô Tất cả ở thanh tìm kiếm, bỏ phần chọn ngôn ngữ); giỏ hàng và thông tin người dùng nhận props, lúc mới vào giỏ hàng hiện trống và hiện nút Đăng nhập, sau khi đăng nhập mới hiện tên người dùng kèm menu Đăng xuất."
- Kết quả AI trả về: Sinh code `Header.jsx` xử lý render có điều kiện cho trạng thái giỏ hàng (`cartCount = 0` hiển thị "Trống") và trạng thái người dùng (`user = null` hiển thị nút Đăng nhập, có `user` thì hiện dropdown chứa nút Đăng xuất), kèm `Navbar.jsx` hỗ trợ vuốt ngang trên màn hình nhỏ.
- Đánh giá: Bám sát yêu cầu giao diện, xử lý tốt trạng thái động thông qua `props` và `state`, tương thích tốt trên cả mobile và desktop.
- Đã chỉnh sửa gì: Tinh chỉnh các nhãn danh mục trên `Navbar.jsx` cho khớp với đề tài website bán sách và kết nối sự kiện mở popup đăng nhập.
- Cách kiểm chứng: Test trực tiếp trên trình duyệt trạng thái mặc định (giỏ trống, chưa đăng nhập) và trạng thái sau khi truyền props `user`, `cartCount`, `cartTotal`.
- Tỷ lệ nội dung AI còn giữ lại: 60%
- Điều học được: Thiết kế component nhận dữ liệu qua `props` kèm giá trị mặc định giúp dễ dàng kiểm thử độc lập ở Frontend trước khi ghép API từ Backend.

---

### [AI-04] Xây dựng component popup `LoginModal.jsx` và `RegisterModal.jsx`
- Ngày / Người dùng: 12/11/2026 / Nguyễn Trọng Lam
- Công cụ: Gemini
- Giai đoạn: Phát triển giao diện Xác thực phía Frontend
- Task / Commit / PR: Tạo `LoginModal.jsx`, `RegisterModal.jsx` và tích hợp vào `MainLayout.jsx` / Nhánh `feature/TM-01-trang-chu`
- Mục đích: Tạo giao diện popup Đăng nhập và Đăng ký đồng bộ bảng màu ấm (`#FAF8F5`, `#141414`, `#9A5B13`) và font chữ với trang chủ để sẵn sàng kết nối với API xác thực của TV2.
- Prompt chính: "Viết popup đăng nhập dựa theo phong cách của trang; tiếp tục tạo component đăng ký đồng bộ giao diện và cho phép chuyển đổi qua lại giữa hai popup."
- Kết quả AI trả về: Cung cấp 2 component `LoginModal.jsx` và `RegisterModal.jsx` với đầy đủ các trường nhập liệu, kiểm tra dữ liệu đầu vào cơ bản bằng thông báo tiếng Việt, nút chuyển đổi qua lại giữa Đăng nhập/Đăng ký, và hướng dẫn quản lý trạng thái đóng/mở tập trung trong `MainLayout.jsx`.
- Đánh giá: Giao diện đẹp, đồng bộ với tổng thể trang web, trải nghiệm đóng/mở modal và chuyển đổi form mượt mà.
- Đã chỉnh sửa gì: Kết nối callback `onLoginSuccess` và `onRegisterSuccess` lên `MainLayout.jsx` để cập nhật ngay tên người dùng hiển thị trên `Header.jsx`.
- Cách kiểm chứng: Thao tác mở popup từ nút "Đăng nhập" trên Header, chuyển qua lại giữa form Đăng nhập và Đăng ký, nhập thử thông tin để kiểm tra cập nhật trạng thái trên Header.
- Tỷ lệ nội dung AI còn giữ lại: 70%
- Điều học được: Quản lý trạng thái hiển thị modal (`authModal`) và thông tin người dùng (`user`) tại component layout cha giúp các component con phối hợp đồng bộ và dễ bảo trì.