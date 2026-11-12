# Cấu trúc thư mục dự án

Dự án được tổ chức theo mô hình **Kiến trúc 3 lớp (3-Tier Architecture)** kết hợp mô hình MVC của Laravel và React (Vite) cho Frontend.

## 1. Cấu trúc tổng quan
```text
Do_An_Chuyen_Nganh_Web_TMDT/
├── app/                  # Chứa mã nguồn Backend (Laravel)
├── bootstrap/            # Khởi tạo framework
├── config/               # Các file cấu hình
├── database/             # Chứa Migration, Seeder, Factory
├── docs/                 # Tài liệu dự án (Use case, ERD, Test case...)
├── public/               # Thư mục public (chứa index.php, ảnh, assets)
├── resources/            # Chứa Views và Frontend (React)
│   ├── css/
│   ├── js/               # Mã nguồn React (components, pages...)
│   └── views/
├── routes/               # Định nghĩa các Route (web.php, api.php)
├── storage/              # Lưu trữ file, log, cache
├── tests/                # Chứa các file Unit Test (Pest/PHPUnit)
├── .env.example          # File cấu hình môi trường mẫu
├── .gitignore            # Cấu hình bỏ qua file khi commit Git
├── composer.json         # Quản lý thư viện PHP
├── package.json          # Quản lý thư viện Node.js (React)
└── vite.config.js        # Cấu hình build Frontend