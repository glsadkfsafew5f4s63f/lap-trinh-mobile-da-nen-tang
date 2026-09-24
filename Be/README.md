# Node.js Backend được sinh tự động

- Database: `CuaHangQuanAoOnline`
- Số bảng: **29**

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
| GET | /api/bienthechuongtrinhgiamgia | Lấy tất cả |
| GET | /api/bienthechuongtrinhgiamgia/... | Lấy theo khóa chính |
| POST | /api/bienthechuongtrinhgiamgia | Thêm mới |
| PUT | /api/bienthechuongtrinhgiamgia/... | Cập nhật |
| DELETE | /api/bienthechuongtrinhgiamgia/... | Xóa |
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
| GET | /api/chitietphieunhap | Lấy tất cả |
| GET | /api/chitietphieunhap/... | Lấy theo khóa chính |
| POST | /api/chitietphieunhap | Thêm mới |
| PUT | /api/chitietphieunhap/... | Cập nhật |
| DELETE | /api/chitietphieunhap/... | Xóa |
| GET | /api/chuongtrinhgiamgia | Lấy tất cả |
| GET | /api/chuongtrinhgiamgia/... | Lấy theo khóa chính |
| POST | /api/chuongtrinhgiamgia | Thêm mới |
| PUT | /api/chuongtrinhgiamgia/... | Cập nhật |
| DELETE | /api/chuongtrinhgiamgia/... | Xóa |
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
| GET | /api/diachigiaohang | Lấy tất cả |
| GET | /api/diachigiaohang/... | Lấy theo khóa chính |
| POST | /api/diachigiaohang | Thêm mới |
| PUT | /api/diachigiaohang/... | Cập nhật |
| DELETE | /api/diachigiaohang/... | Xóa |
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
| GET | /api/hoadon | Lấy tất cả |
| GET | /api/hoadon/... | Lấy theo khóa chính |
| POST | /api/hoadon | Thêm mới |
| PUT | /api/hoadon/... | Cập nhật |
| DELETE | /api/hoadon/... | Xóa |
| GET | /api/kichthuoc | Lấy tất cả |
| GET | /api/kichthuoc/... | Lấy theo khóa chính |
| POST | /api/kichthuoc | Thêm mới |
| PUT | /api/kichthuoc/... | Cập nhật |
| DELETE | /api/kichthuoc/... | Xóa |
| GET | /api/lichsudonhang | Lấy tất cả |
| GET | /api/lichsudonhang/... | Lấy theo khóa chính |
| POST | /api/lichsudonhang | Thêm mới |
| PUT | /api/lichsudonhang/... | Cập nhật |
| DELETE | /api/lichsudonhang/... | Xóa |
| GET | /api/lichsutonkho | Lấy tất cả |
| GET | /api/lichsutonkho/... | Lấy theo khóa chính |
| POST | /api/lichsutonkho | Thêm mới |
| PUT | /api/lichsutonkho/... | Cập nhật |
| DELETE | /api/lichsutonkho/... | Xóa |
| GET | /api/lienhe | Lấy tất cả |
| GET | /api/lienhe/... | Lấy theo khóa chính |
| POST | /api/lienhe | Thêm mới |
| PUT | /api/lienhe/... | Cập nhật |
| DELETE | /api/lienhe/... | Xóa |
| GET | /api/magiamgia | Lấy tất cả |
| GET | /api/magiamgia/... | Lấy theo khóa chính |
| POST | /api/magiamgia | Thêm mới |
| PUT | /api/magiamgia/... | Cập nhật |
| DELETE | /api/magiamgia/... | Xóa |
| GET | /api/magiamgianguoidung | Lấy tất cả |
| GET | /api/magiamgianguoidung/... | Lấy theo khóa chính |
| POST | /api/magiamgianguoidung | Thêm mới |
| PUT | /api/magiamgianguoidung/... | Cập nhật |
| DELETE | /api/magiamgianguoidung/... | Xóa |
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
| GET | /api/nguoidungvaitro | Lấy tất cả |
| GET | /api/nguoidungvaitro/... | Lấy theo khóa chính |
| POST | /api/nguoidungvaitro | Thêm mới |
| PUT | /api/nguoidungvaitro/... | Cập nhật |
| DELETE | /api/nguoidungvaitro/... | Xóa |
| GET | /api/nhacungcap | Lấy tất cả |
| GET | /api/nhacungcap/... | Lấy theo khóa chính |
| POST | /api/nhacungcap | Thêm mới |
| PUT | /api/nhacungcap/... | Cập nhật |
| DELETE | /api/nhacungcap/... | Xóa |
| GET | /api/phieunhap | Lấy tất cả |
| GET | /api/phieunhap/... | Lấy theo khóa chính |
| POST | /api/phieunhap | Thêm mới |
| PUT | /api/phieunhap/... | Cập nhật |
| DELETE | /api/phieunhap/... | Xóa |
| GET | /api/sanpham | Lấy tất cả |
| GET | /api/sanpham/... | Lấy theo khóa chính |
| POST | /api/sanpham | Thêm mới |
| PUT | /api/sanpham/... | Cập nhật |
| DELETE | /api/sanpham/... | Xóa |
| GET | /api/sanphamchuongtrinhgiamgia | Lấy tất cả |
| GET | /api/sanphamchuongtrinhgiamgia/... | Lấy theo khóa chính |
| POST | /api/sanphamchuongtrinhgiamgia | Thêm mới |
| PUT | /api/sanphamchuongtrinhgiamgia/... | Cập nhật |
| DELETE | /api/sanphamchuongtrinhgiamgia/... | Xóa |
| GET | /api/thanhtoan | Lấy tất cả |
| GET | /api/thanhtoan/... | Lấy theo khóa chính |
| POST | /api/thanhtoan | Thêm mới |
| PUT | /api/thanhtoan/... | Cập nhật |
| DELETE | /api/thanhtoan/... | Xóa |
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

## Module nghiệp vụ quần áo

- POST /api/auth/register - Đăng ký
- POST /api/auth/login - Đăng nhập JWT
- GET /api/auth/me - Thông tin tài khoản
- GET /api/products - Danh sách sản phẩm + tìm kiếm + phân trang
- GET /api/products/:id - Chi tiết + biến thể + hình ảnh
- GET /api/cart - Xem giỏ hàng
- POST /api/cart/items - Thêm biến thể vào giỏ
- PUT /api/cart/items/:itemId - Cập nhật số lượng
- DELETE /api/cart/items/:itemId - Xóa khỏi giỏ
- POST /api/orders/voucher/preview - Kiểm tra voucher
- POST /api/orders - Tạo đơn + tạm giữ tồn kho bằng transaction
- GET /api/orders - Danh sách đơn của tôi
- GET /api/orders/:id - Chi tiết đơn + thanh toán + lịch sử
- PUT /api/orders/:id/cancel - Khách hủy đơn
- POST /api/payments/:orderId/retry - Tạo lượt thanh toán lại
- POST /api/reviews - Đánh giá sau khi đơn DA_GIAO
- GET /api/admin/dashboard - Dashboard Web Admin
- PUT /api/admin/orders/:id/status - Cập nhật trạng thái + kho
- PUT /api/admin/purchase-orders/:id/approve - Duyệt phiếu nhập

## Lưu ý

- File `.env` không nên đưa lên Git.
- `NguoiDung.MatKhau` phải là bcrypt hash, không lưu mật khẩu dạng rõ.
- Schema V2 không dùng `VideoURL`; đa phương tiện sản phẩm dùng `HinhAnhSanPham`, ảnh review dùng `DanhGia.HinhAnh`.
- Tồn kho khả dụng = `SoLuongTon - SoLuongTamGiu`; đơn mới sẽ tạm giữ tồn kho trong transaction.
- Duyệt `PhieuNhap` sang `DA_DUYET` để trigger database cộng tồn và ghi `LichSuTonKho`.
- `MaGiamGia` là voucher cấp đơn hàng; `ChuongTrinhGiamGia` là giảm trực tiếp/Flash Sale.
- `LichSuDonHang` lưu lịch sử trạng thái; `ThanhToan` hỗ trợ nhiều lần thử.
- `DanhGia` chỉ được tạo sau khi đơn đã `DA_GIAO`; trigger database kiểm tra điều kiện.
- Các bảng người dùng/đơn hàng/thanh toán nhạy cảm không mở CRUD generic.
- Backend được sinh dựa trên cấu trúc thực tế của MySQL.
- Foreign Key được phân tích trong `utils/relationships.js`.
- Nghiệp vụ đặt hàng dùng transaction để tạo đơn, trừ tồn kho và làm sạch giỏ hàng.
