# Do_An_Chuyen_Nganh_Web_TMDT

## Cài đặt

**Yêu cầu:** PHP 8.2+, Composer, MySQL.

1. Clone repo và vào thư mục dự án:
   ```
   git clone <link-repo>
   cd <ten-thu-muc>
   ```
2. Cài thư viện:
   ```
   composer install
   ```
3. Tạo file môi trường:
   ```
   copy .env.example .env
   php artisan key:generate
   ```
4. Tạo database `bookstore` trong MySQL, rồi sửa các biến `DB_*` trong `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
5. Tạo bảng:
   ```
   php artisan migrate
   ```
6. Chạy dự án:
   ```
   php artisan serve
   ```
7. Kiểm tra kết nối CSDL: http://127.0.0.1:8000/db-check

> Lưu ý: không commit file `.env`.