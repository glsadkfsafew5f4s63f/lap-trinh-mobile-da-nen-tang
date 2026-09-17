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
PORT=3000
```

Frontend `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Use `http://10.0.2.2:3000` for Android Emulator or the computer LAN IP for a real phone.

## Implemented endpoints

### `GET /health`

Returns `200` when Node.js can query MySQL:

```json
{ "ok": true, "database": "AppBanQuanAo" }
```

### `GET /api/products`

Reads `SanPham`, `DanhMuc`, `ThuongHieu`, and `HinhAnhSanPham`.

### `GET /api/products/:id/variants`

Reads `BienTheSanPham`, `MauSac`, and `KichThuoc`. The response contains `id`, `sku`, `color`, `size`, `price`, and `stock`.

## Endpoints needed for the full app

The backend can add these using the same table names from `shopqa.sql`:

```text
POST   /api/auth/login                 NguoiDung
POST   /api/auth/register              NguoiDung
GET    /api/categories                 DanhMuc
GET    /api/products/:id/reviews       DanhGia + NguoiDung
POST   /api/products/:id/reviews       DanhGia
GET    /api/favorites                  YeuThich
POST   /api/favorites/:productId       YeuThich
DELETE /api/favorites/:productId       YeuThich
GET    /api/cart                       GioHang + ChiTietGioHang
POST   /api/cart/items                 ChiTietGioHang
PATCH  /api/cart/items/:variantId      ChiTietGioHang
DELETE /api/cart/items/:variantId      ChiTietGioHang
POST   /api/orders                     DonHang + ChiTietDonHang
GET    /api/orders                     DonHang
GET    /api/orders/:id                 DonHang + ChiTietDonHang
```

## Mapping rules

Never use a frontend array index as a database identifier:

```text
Product.id        -> SanPham.MaSanPham
Variant.id        -> BienTheSanPham.MaBienThe
Variant.sku       -> BienTheSanPham.MaSKU
colorId           -> MauSac.MaMau
sizeId            -> KichThuoc.MaKichThuoc
review productId  -> DanhGia.MaSanPham
cart item         -> ChiTietGioHang.MaBienThe
order item        -> ChiTietDonHang.MaBienThe
```

The current local mock adapters still use indexes for rendering. When the API is wired into the screens, the backend IDs above must be preserved in the client model.