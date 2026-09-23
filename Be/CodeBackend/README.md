# Node.js Backend được sinh tự động

- Database: `AppBanQuanAo`
- Số bảng: **16**

## Cấu trúc

```text
BackendGenerated/
├── app.js
├── package.json
├── .env.example
├── common/
│   └── db.js
├── models/
├── controllers/
├── routes/
├── middleware/
├── config/
├── utils/
└── RELATIONSHIPS.md
```

## Cài đặt

```bash
npm install
npm start
```

## API mặc định

| Method | URL | Chức năng |
|---|---|---|
| GET | /api/bienthesanpham | Lấy tất cả |
| GET | /api/bienthesanpham/... | Lấy theo khóa chính |
| POST | /api/bienthesanpham | Thêm mới |
| PUT | /api/bienthesanpham/... | Cập nhật |
| DELETE | /api/bienthesanpham/... | Xóa |
| GET | /api/chitietdonhang | Lấy tất cả |
| GET | /api/chitietdonhang/... | Lấy theo khóa chính |
| POST | /api/chitietdonhang | Thêm mới |
| PUT | /api/chitietdonhang/... | Cập nhật |
| DELETE | /api/chitietdonhang/... | Xóa |
| GET | /api/chitietgiohang | Lấy tất cả |
| GET | /api/chitietgiohang/... | Lấy theo khóa chính |
| POST | /api/chitietgiohang | Thêm mới |
| PUT | /api/chitietgiohang/... | Cập nhật |
| DELETE | /api/chitietgiohang/... | Xóa |
| GET | /api/danhgia | Lấy tất cả |
| GET | /api/danhgia/... | Lấy theo khóa chính |
| POST | /api/danhgia | Thêm mới |
| PUT | /api/danhgia/... | Cập nhật |
| DELETE | /api/danhgia/... | Xóa |
| GET | /api/danhmuc | Lấy tất cả |
| GET | /api/danhmuc/... | Lấy theo khóa chính |
| POST | /api/danhmuc | Thêm mới |
| PUT | /api/danhmuc/... | Cập nhật |
| DELETE | /api/danhmuc/... | Xóa |
| GET | /api/diachi | Lấy tất cả |
| GET | /api/diachi/... | Lấy theo khóa chính |
| POST | /api/diachi | Thêm mới |
| PUT | /api/diachi/... | Cập nhật |
| DELETE | /api/diachi/... | Xóa |
| GET | /api/donhang | Lấy tất cả |
| GET | /api/donhang/... | Lấy theo khóa chính |
| POST | /api/donhang | Thêm mới |
| PUT | /api/donhang/... | Cập nhật |
| DELETE | /api/donhang/... | Xóa |
| GET | /api/giohang | Lấy tất cả |
| GET | /api/giohang/... | Lấy theo khóa chính |
| POST | /api/giohang | Thêm mới |
| PUT | /api/giohang/... | Cập nhật |
| DELETE | /api/giohang/... | Xóa |
| GET | /api/hinhanhsanpham | Lấy tất cả |
| GET | /api/hinhanhsanpham/... | Lấy theo khóa chính |
| POST | /api/hinhanhsanpham | Thêm mới |
| PUT | /api/hinhanhsanpham/... | Cập nhật |
| DELETE | /api/hinhanhsanpham/... | Xóa |
| GET | /api/kichthuoc | Lấy tất cả |
| GET | /api/kichthuoc/... | Lấy theo khóa chính |
| POST | /api/kichthuoc | Thêm mới |
| PUT | /api/kichthuoc/... | Cập nhật |
| DELETE | /api/kichthuoc/... | Xóa |
| GET | /api/mausac | Lấy tất cả |
| GET | /api/mausac/... | Lấy theo khóa chính |
| POST | /api/mausac | Thêm mới |
| PUT | /api/mausac/... | Cập nhật |
| DELETE | /api/mausac/... | Xóa |
| GET | /api/nguoidung | Lấy tất cả |
| GET | /api/nguoidung/... | Lấy theo khóa chính |
| POST | /api/nguoidung | Thêm mới |
| PUT | /api/nguoidung/... | Cập nhật |
| DELETE | /api/nguoidung/... | Xóa |
| GET | /api/sanpham | Lấy tất cả |
| GET | /api/sanpham/... | Lấy theo khóa chính |
| POST | /api/sanpham | Thêm mới |
| PUT | /api/sanpham/... | Cập nhật |
| DELETE | /api/sanpham/... | Xóa |
| GET | /api/thuonghieu | Lấy tất cả |
| GET | /api/thuonghieu/... | Lấy theo khóa chính |
| POST | /api/thuonghieu | Thêm mới |
| PUT | /api/thuonghieu/... | Cập nhật |
| DELETE | /api/thuonghieu/... | Xóa |
| GET | /api/vaitro | Lấy tất cả |
| GET | /api/vaitro/... | Lấy theo khóa chính |
| POST | /api/vaitro | Thêm mới |
| PUT | /api/vaitro/... | Cập nhật |
| DELETE | /api/vaitro/... | Xóa |
| GET | /api/yeuthich | Lấy tất cả |
| GET | /api/yeuthich/... | Lấy theo khóa chính |
| POST | /api/yeuthich | Thêm mới |
| PUT | /api/yeuthich/... | Cập nhật |
| DELETE | /api/yeuthich/... | Xóa |

## Module nghiệp vụ quần áo

- POST /api/auth/register - Đăng ký
- POST /api/auth/login - Đăng nhập người dùng, trả về JWT
- POST /api/auth/admin-login - Đăng nhập dành riêng cho tài khoản Admin
- GET /api/auth/me - Thông tin tài khoản
- GET /api/products - Danh sách sản phẩm + tìm kiếm + phân trang
- GET /api/products/:id - Chi tiết + biến thể + hình ảnh
- GET /api/cart - Xem giỏ hàng
- POST /api/cart/items - Thêm biến thể vào giỏ
- PUT /api/cart/items/:itemId - Cập nhật số lượng
- DELETE /api/cart/items/:itemId - Xóa khỏi giỏ
- POST /api/orders - Tạo đơn hàng bằng transaction
- GET /api/orders - Danh sách đơn của tôi
- GET /api/orders/:id - Chi tiết đơn hàng

## Lưu ý

- File `.env` không nên đưa lên Git.
- `NguoiDung.MatKhau` phải là bcrypt hash, không lưu mật khẩu dạng rõ.
- Các bảng người dùng/đơn hàng/thanh toán nhạy cảm không mở CRUD generic.
- Backend được sinh dựa trên cấu trúc thực tế của MySQL.
- Foreign Key được phân tích trong `utils/relationships.js`.
- Nghiệp vụ đặt hàng dùng transaction để tạo đơn, trừ tồn kho và làm sạch giỏ hàng.

## Chạy kiểm tra

```bash
npm test
npm start
```

Các request quản trị phải gửi header `Authorization: Bearer <JWT>`. Trước khi triển khai,
cần thay `JWT_SECRET` trong `.env` bằng chuỗi ngẫu nhiên dài và không đưa file `.env` lên Git.
