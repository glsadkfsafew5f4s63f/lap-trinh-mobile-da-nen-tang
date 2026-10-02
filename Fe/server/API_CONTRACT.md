# Frontend/Backend contract

The SQL file is the shared database contract. The Expo app must call the backend API; it must never receive MySQL credentials.

## Environment

Backend `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=local_password
DB_NAME=AppBanQuanAo
PORT=7000
```

Frontend `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:7000
```

Use `http://10.0.2.2:7000` for Android Emulator or the computer LAN IP for a real phone.

## Implemented endpoints

### `GET /health`

Returns `200` when the backend process is available:

```json
{ "success": true, "message": "Backend cửa hàng quần áo đang hoạt động" }
```

### `GET /api/products`

Reads `SanPham`, `DanhMuc`, `ThuongHieu`, and `HinhAnhSanPham`.

### `GET /api/products/:id`

Returns product details, variants with available stock and discount prices, all product images, and visible reviews.

## Mobile endpoints

```text
POST   /api/auth/login                 NguoiDung
POST   /api/auth/register              NguoiDung
GET    /api/auth/me                    NguoiDung + VaiTro
GET    /api/catalog/categories         DanhMuc
GET    /api/catalog/brands             ThuongHieu
GET    /api/catalog/colors             MauSac
GET    /api/catalog/sizes              KichThuoc
GET    /api/products/:id               SanPham + BienThe + HinhAnh + DanhGia
GET    /api/reviews/product/:id        DanhGia + NguoiDung
POST   /api/reviews                    DanhGia
GET    /api/cart                       GioHang + ChiTietGioHang
POST   /api/cart/items                 ChiTietGioHang
PUT    /api/cart/items/:id             ChiTietGioHang
DELETE /api/cart/items/:id             ChiTietGioHang
GET    /api/orders/checkout-config     Shipping policy
POST   /api/orders/voucher/preview     MaGiamGia + MaGiamGiaNguoiDung
POST   /api/orders                     DonHang + ChiTietDonHang
GET    /api/orders                     DonHang
GET    /api/orders/:id                 DonHang + ChiTietDonHang
PUT    /api/orders/:id/cancel          DonHang + LichSuDonHang + inventory
POST   /api/payments/:orderId/momo     Create/reopen MoMo checkout
POST   /api/payments/:orderId/retry    Retry MoMo payment
POST   /api/payments/momo/ipn          Verify provider callback and settle payment
POST   /api/admin/orders/:id/payment/collect-cod  Finance confirms collected COD
POST   /api/admin/orders/:id/refund    Full refund (MoMo or confirmed manual transfer)
PUT    /api/user/profile               NguoiDung
GET    /api/user/addresses             DiaChiGiaoHang
POST   /api/user/addresses             DiaChiGiaoHang
PUT    /api/user/addresses/:id         DiaChiGiaoHang
DELETE /api/user/addresses/:id         DiaChiGiaoHang
```

COD is recorded as paid only after finance confirms collection for a delivered order. MoMo orders are paid only after a valid signed IPN callback; the app return URL is not treated as payment proof. Canceling an unpaid, unshipped order releases held inventory and restores voucher usage exactly once. Paid MoMo orders are refunded through MoMo; COD refunds are recorded only after finance confirms the manual transfer. A delivered order can be refunded/restocked only after finance confirms the returned goods were received. The database creates an invoice when an order transitions to `DA_GIAO`.

Apply `BE/migrations/20261001_payment_lifecycle.sql` to existing databases. Configure `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_IPN_URL` (public HTTPS URL), and `MOMO_REDIRECT_URL` in the backend environment before testing MoMo sandbox. The app uses the `anhuyqa://payment-result` redirect scheme by default.

## Mapping rules

Never use a frontend array index as a database identifier:

```text
Product.id        -> SanPham.MaSanPham
Variant.id        -> BienTheSanPham.MaBienThe
Variant.sku       -> BienTheSanPham.SKU
colorId           -> MauSac.MaMau
sizeId            -> KichThuoc.MaKichThuoc
review productId  -> DanhGia.MaSanPham
cart item         -> ChiTietGioHang.MaBienThe
order item        -> ChiTietDonHang.MaBienThe
```

The mobile app preserves backend IDs in its client model and does not use local mock records as a fallback.