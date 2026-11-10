# AI log – TV2 - VÕ TRẦN ĐỈNH SƠN

> Mỗi thành viên một tệp trong `ai-logs/`. Ghi một mục ngay sau mỗi lần dùng AI có ảnh hưởng đến sản phẩm, commit cùng thay đổi liên quan. Cả đồ án tối thiểu 6 mục có nội dung thực chất. Mã mục tăng dần: AI-01, AI-02, ...

| Mục | Thông tin |
| :---- | :---- |
| Họ tên, MSSV | Võ Trần Đỉnh Sươn – \[0306241398\] |
| Nhóm, đề tài | Nhóm \[9\] – \[Thương mại điện tử\] |
| Vai trò | TV2 – BE  |
| Công cụ AI dùng | \[ChatGPT / Claude / Gemini / GitHub Copilot / Cursor\] |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| :---- | :---- | :---- | :---- | :---- |
| AI-01 | \[9/11\] | Phân tích yêu cầu | Brainstorm chức năng và rủi ro | \[PR \#1\] |
| AI-02 | \[dd/mm\] | Lập kế hoạch | Rà soát user story, chia sprint S1 | \[PR \#...\] |

---

### \[AI-01\] Brainstorm chức năng và rủi ro của đề tài

- Ngày / Người dùng: \[2026-11-9\] / Võ Trần Đỉnh Sơn
- Công cụ: \[Claude (Sonet 5.5)\]  
- Giai đoạn: Phân tích yêu cầu  
- Task / Commit / PR: \[DOC\] Đề cương / \[1f79843\] / \[PR \#1\]  
- Mục đích: Liệt kê chức năng cần có và rủi ro khi làm đề tài \[Thương mại điện tử\] trong 3 tuần với 5 người.  
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Nhóm 5 sinh viên làm website \[BookStore\] trong 3 tuần bằng \[Laravel\]. Liệt kê chức năng cho khách và quản trị, chia mức bắt buộc/tùy chọn, và 5 rủi ro lớn nhất kèm cách phòng tránh."  
- Kết quả AI trả về (tóm tắt): \[AI đề xuất 15 chức năng, 3 rủi ro\]  
- Đánh giá: \[Đúng một phần. Nhóm Must khớp phần lớn đặc tả, nhưng nhiều mục Could nằm ngoài đặc tả và AI chưa nêu rủi ro về phân quyền/lộ dữ liệu giữa người dùng và lệch giá trong đơn hàng.\]  
- Đã chỉnh sửa gì: \[Giữ TM-01 → TM-08, TM-11 → TM-14 chức năng khớp đặc tả đề tài, loại wishlist, quên mật khẩu qua email, email xác nhận đơn, upload nhiều ảnh; bổ sung rủi ro lộ đơn hàng khi đổi ID trên URL (TM-NFR4) và lệch giá/dùng float cho tiền (TM-NFR2, TM-NFR3)\]  
- Cách kiểm chứng: Đối chiếu danh sách chức năng bắt buộc trong đặc tả đề tài; thảo luận nhóm ở tiết 2; GV duyệt đề cương tiết 5
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): \[60\]%  
- Điều học được: \[Prompt cần nêu rõ giới hạn thời gian và số người để AI không đề xuất quá phạm vi\]

### \[AI-02\] Rà soát user story và chia sprint S1

- Ngày / Người dùng: \[yyyy-mm-dd\] / Nguyễn Văn A  
- Công cụ: \[...\]  
- Giai đoạn: Lập kế hoạch  
- Task / Commit / PR: \[...\] / \[...\] / \[...\]  
- Mục đích: \[...\]  
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): \[...\]  
- Kết quả AI trả về (tóm tắt): \[...\]  
- Đánh giá: \[Đúng / Sai / Thiếu – vì sao\]  
- Đã chỉnh sửa gì: \[...\]  
- Cách kiểm chứng: \[...\]  
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): \[...\]%  
- Điều học được: \[...\]

### [AI-03] So sánh cách tổ chức thư mục 3 lớp cho dự án Laravel
- Ngày / Người dùng: 2026-11-09 / Võ Trần Đỉnh Sơn
- Công cụ: Claude (Sonnet 5.5)
- Giai đoạn: Thiết kế
- Task / Commit / PR: [DB] Khung dự án / <mã commit> / <PR>
- Mục đích: Chọn cách tổ chức thư mục 3 lớp (Controllers – Services – Repositories/Models) cho dự án Laravel quy mô nhỏ.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "So sánh cách tổ chức thư mục 3 lớp cho dự án Laravel quy mô nhỏ" / <link chia sẻ hội thoại>
- Kết quả AI trả về (tóm tắt): So sánh 4 cách (mặc định, Controller–Service–Model, có thêm Repository, theo module) và đề xuất cách có Repository ở dạng nhẹ.
- Đánh giá: <Đúng / Sai / Thiếu – vì sao, theo nhận xét của bạn>
- Đã chỉnh sửa gì: <cách nhóm chọn (B hoặc C) và phần bỏ, vì sao>
- Cách kiểm chứng: Đối chiếu tài liệu Laravel mục Directory Structure: xác nhận thư mục Services, Repositories do dự án tự tạo (app mặc định chỉ có Http, Models, Providers), namespace PSR-4 hợp lệ; tài liệu không quy định mô hình Service/Repository, đây là quy ước.
- Tỷ lệ mã AI còn giữ lại (ước lượng): <số>% (chưa có mã, phần giữ lại là cách tổ chức thư mục)
- Điều học được: <ví dụ: 3 lớp là quy ước của cộng đồng, framework không bắt buộc, nên cần nhóm thống nhất và ghi vào đề cương>
<!-- Mẫu mục mới: chép khối dưới, đổi mã AI-xx

### [AI-xx] Tiêu đề ngắn
- Ngày / Người dùng:
- Công cụ:
- Giai đoạn: Phân tích yêu cầu | Lập kế hoạch | Thiết kế | Lập trình | Kiểm thử | Tài liệu
- Task / Commit / PR:
- Mục đích:
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
- Kết quả AI trả về (tóm tắt):
- Đánh giá: Đúng / Sai / Thiếu – vì sao
- Đã chỉnh sửa gì:
- Cách kiểm chứng:
- Tỷ lệ mã AI còn giữ lại (ước lượng): ...%
- Điều học được:
-->
