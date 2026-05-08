# Hướng dẫn kết nối database MySQL để hoàn thiện web

## Bước 1: Xác nhận database đang có thật
Trong MySQL Workbench của bạn đã có:
- Local instance MySQL80
- database: `courierxpress_db`

Như vậy bạn **không cần tạo lại database**.

## Bước 2: Tìm thông tin đăng nhập MySQL
Bạn cần 4 thông tin:
- host: `127.0.0.1`
- port: `3306`
- database: `courierxpress_db`
- username: thường là `root`
- password: mật khẩu MySQL khi cài

## Bước 3: Sửa `.env` của Laravel
Ví dụ:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=courierxpress_db
DB_USERNAME=root
DB_PASSWORD=123456
```

## Bước 4: Clear cache config
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## Bước 5: Test backend có đọc được database chưa
Chạy:
```bash
php artisan serve
```

Sau đó mở:
`http://127.0.0.1:8000/api/test-db`

Nếu hiện ra dữ liệu bảng `branches` là backend đã nối thành công.

## Bước 6: Nối frontend React
Trong React, gọi API:
- `/api/customers`
- `/api/shipments`
- `/api/tracking/TRK001`
- `/api/bills`

Frontend chỉ gọi API của Laravel, không đọc MySQL trực tiếp.

## Nếu bị lỗi thường gặp

### 1. `SQLSTATE[HY000] [1045] Access denied`
Sai username hoặc password MySQL.

### 2. `Unknown database 'courierxpress_db'`
Tên database trong `.env` sai.

### 3. `Connection refused`
MySQL Server chưa chạy.

### 4. React gọi API bị CORS
Cần bật CORS trong Laravel hoặc dùng domain `localhost:5173`.

