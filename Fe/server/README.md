# MySQL API

Backend owner: run this folder. Frontend owner: only use the HTTP API; do not copy the MySQL password into Expo.

## 1. Cài dependency

```powershell
cd server
npm install
```

## 2. Tạo cấu hình local

```powershell
Copy-Item .env.example .env
```

Mở `.env` và điền `DB_USER`, `DB_PASSWORD`, `DB_HOST` nếu MySQL không chạy mặc định.

## 3. Nạp database

Chạy file `D:\BTL_ShopBanQuanAoDNT\shopqa.sql` bằng MySQL Workbench hoặc lệnh:

```powershell
mysql -u root -p < ..\..\shopqa.sql
```

## 4. Chạy API

```powershell
npm start
```

Kiểm tra:

- `http://localhost:3000/health`
- `http://localhost:3000/api/products`
- `http://localhost:3000/api/products/1/variants`

Expo app chỉ gọi API này, không kết nối trực tiếp đến MySQL.

Xem contract bàn giao ở `API_CONTRACT.md`.
