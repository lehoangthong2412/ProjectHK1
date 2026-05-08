# CourierXpress Laravel Backend Pack

Gói này là phần **backend** để nối web CourierXpress với database MySQL hiện có của bạn
(`courierxpress_db` trên MySQL Workbench).

## Kiến trúc đúng
React **không** nối trực tiếp vào MySQL Workbench.

Luồng đúng là:

**React -> Laravel API -> MySQL Server**

MySQL Workbench chỉ là công cụ để xem và quản lý dữ liệu.

## Các bảng backend đang dùng
- branches
- users
- customers
- shipment_types
- shipments
- shipment_status_history
- bills

## Cách dùng nhanh

### 1. Tạo project Laravel mới
```bash
composer create-project laravel/laravel courierxpress-backend
```

### 2. Copy các file trong pack này vào project Laravel
- `routes/api.php` -> vào `routes/api.php`
- `app/Models/*` -> vào `app/Models/`
- `app/Http/Controllers/Api/*` -> vào `app/Http/Controllers/Api/`

### 3. Sửa file `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=courierxpress_db
DB_USERNAME=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
```

### 4. Clear config
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 5. Chạy backend
```bash
php artisan serve
```

Backend sẽ chạy ở:
`http://127.0.0.1:8000`

### 6. Test nhanh API
Mở trình duyệt:
- `http://127.0.0.1:8000/api/test-db`
- `http://127.0.0.1:8000/api/branches`
- `http://127.0.0.1:8000/api/customers`
- `http://127.0.0.1:8000/api/shipments`
- `http://127.0.0.1:8000/api/tracking/TRK001`
- `http://127.0.0.1:8000/api/bills`

## Gợi ý nối React
Tạo file `.env` trong frontend:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Xem file mẫu:
- `frontend_example/api.js`
- `frontend_example/AppApiExample.jsx`

