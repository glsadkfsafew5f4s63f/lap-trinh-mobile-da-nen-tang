# Quan hệ CSDL - AppBanQuanAo

| Bảng nguồn | Cột FK | Bảng đích | Cột PK/UK | Constraint |
|---|---|---|---|---|
| bienthesanpham | MaKichThuoc | kichthuoc | MaKichThuoc | FK_BienThe_KichThuoc |
| bienthesanpham | MaMau | mausac | MaMau | FK_BienThe_MauSac |
| bienthesanpham | MaSanPham | sanpham | MaSanPham | FK_BienThe_SanPham |
| chitietdonhang | MaBienThe | bienthesanpham | MaBienThe | FK_CT_DonHang_BienThe |
| chitietdonhang | MaDonHang | donhang | MaDonHang | FK_CT_DonHang_DonHang |
| chitietgiohang | MaBienThe | bienthesanpham | MaBienThe | FK_CT_GioHang_BienThe |
| chitietgiohang | MaGioHang | giohang | MaGioHang | FK_CT_GioHang_GioHang |
| danhgia | MaDonHang | donhang | MaDonHang | FK_DanhGia_DonHang |
| danhgia | MaNguoiDung | nguoidung | MaNguoiDung | FK_DanhGia_NguoiDung |
| danhgia | MaSanPham | sanpham | MaSanPham | FK_DanhGia_SanPham |
| diachi | MaNguoiDung | nguoidung | MaNguoiDung | FK_DiaChi_NguoiDung |
| donhang | MaDiaChi | diachi | MaDiaChi | FK_DonHang_DiaChi |
| donhang | MaNguoiDung | nguoidung | MaNguoiDung | FK_DonHang_NguoiDung |
| giohang | MaNguoiDung | nguoidung | MaNguoiDung | FK_GioHang_NguoiDung |
| hinhanhsanpham | MaSanPham | sanpham | MaSanPham | FK_HinhAnh_SanPham |
| nguoidung | MaVaiTro | vaitro | MaVaiTro | FK_NguoiDung_VaiTro |
| sanpham | MaDanhMuc | danhmuc | MaDanhMuc | FK_SanPham_DanhMuc |
| sanpham | MaThuongHieu | thuonghieu | MaThuongHieu | FK_SanPham_ThuongHieu |
| yeuthich | MaNguoiDung | nguoidung | MaNguoiDung | FK_YeuThich_NguoiDung |
| yeuthich | MaSanPham | sanpham | MaSanPham | FK_YeuThich_SanPham |
