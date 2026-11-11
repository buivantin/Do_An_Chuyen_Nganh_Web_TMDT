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

## Hướng dẫn cài đặt & Kết nối CSDL (Development)

1. Sao chép file môi trường:
   `cp .env.example .env` (hoặc tạo file .env)
2. Cấu hình thông số CSDL trong file `.env`:
   - `DB_DATABASE=bookstore`
   - `DB_USERNAME=root`
   - `DB_PASSWORD=`
3. Tạo CSDL `bookstore` trong MySQL local.
4. Chạy lệnh kiểm tra kết nối tại đường dẫn `/db-check`.

## Hướng dẫn Khởi tạo Cơ sở dữ liệu và Dữ liệu mẫu

Chạy các lệnh sau trong Terminal để tạo bảng và nạp dữ liệu thử nghiệm:

```bash
# 1. Chạy migration tạo 6 bảng CSDL
php artisan migrate

# 2. Nạp dữ liệu mẫu (5 danh mục, 30 sách, 10 khách hàng, 1 admin, 10 đơn hàng)
php artisan db:seed

# Hoặc làm mới CSDL và nạp lại từ đầu:
php artisan migrate:fresh --seed