# Quan hệ CSDL - CuaHangQuanAoOnline

| Bảng nguồn | Cột FK | Bảng đích | Cột PK/UK | Constraint |
|---|---|---|---|---|
| bienthechuongtrinhgiamgia | MaBienThe | bienthesanpham | MaBienThe | FK_BienTheChuongTrinh_BienThe |
| bienthechuongtrinhgiamgia | MaChuongTrinh | chuongtrinhgiamgia | MaChuongTrinh | FK_BienTheChuongTrinh_ChuongTrinh |
| bienthesanpham | MaKichThuoc | kichthuoc | MaKichThuoc | FK_BienThe_KichThuoc |
| bienthesanpham | MaMauSac | mausac | MaMauSac | FK_BienThe_MauSac |
| bienthesanpham | MaSanPham | sanpham | MaSanPham | FK_BienThe_SanPham |
| chitietdonhang | MaBienThe | bienthesanpham | MaBienThe | FK_ChiTietDonHang_BienThe |
| chitietdonhang | MaDonHang | donhang | MaDonHang | FK_ChiTietDonHang_DonHang |
| chitietgiohang | MaBienThe | bienthesanpham | MaBienThe | FK_ChiTietGioHang_BienThe |
| chitietgiohang | MaGioHang | giohang | MaGioHang | FK_ChiTietGioHang_GioHang |
| chitietphieunhap | MaBienThe | bienthesanpham | MaBienThe | FK_ChiTietPhieuNhap_BienThe |
| chitietphieunhap | MaPhieuNhap | phieunhap | MaPhieuNhap | FK_ChiTietPhieuNhap_PhieuNhap |
| danhgia | MaChiTietDonHang | chitietdonhang | MaChiTietDonHang | FK_DanhGia_ChiTietDonHang |
| danhgia | MaDonHang | donhang | MaDonHang | FK_DanhGia_DonHang |
| danhgia | MaNguoiDung | nguoidung | MaNguoiDung | FK_DanhGia_NguoiDung |
| danhgia | MaNguoiPhanHoi | nguoidung | MaNguoiDung | FK_DanhGia_NguoiPhanHoi |
| danhgia | MaSanPham | sanpham | MaSanPham | FK_DanhGia_SanPham |
| diachigiaohang | MaNguoiDung | nguoidung | MaNguoiDung | FK_DiaChiGiaoHang_NguoiDung |
| donhang | MaDiaChi | diachigiaohang | MaDiaChi | FK_DonHang_DiaChi |
| donhang | MaGiamGia | magiamgia | MaGiamGia | FK_DonHang_MaGiamGia |
| donhang | MaNguoiDung | nguoidung | MaNguoiDung | FK_DonHang_NguoiDung |
| giohang | MaNguoiDung | nguoidung | MaNguoiDung | FK_GioHang_NguoiDung |
| hinhanhsanpham | MaSanPham | sanpham | MaSanPham | FK_HinhAnhSanPham_SanPham |
| hoadon | MaDonHang | donhang | MaDonHang | FK_HoaDon_DonHang |
| hoadon | MaNguoiLap | nguoidung | MaNguoiDung | FK_HoaDon_NguoiLap |
| lichsudonhang | MaDonHang | donhang | MaDonHang | FK_LichSuDonHang_DonHang |
| lichsudonhang | MaNguoiThayDoi | nguoidung | MaNguoiDung | FK_LichSuDonHang_NguoiThayDoi |
| lichsutonkho | MaBienThe | bienthesanpham | MaBienThe | FK_LichSuTonKho_BienThe |
| lichsutonkho | MaDonHang | donhang | MaDonHang | FK_LichSuTonKho_DonHang |
| lichsutonkho | MaNguoiThucHien | nguoidung | MaNguoiDung | FK_LichSuTonKho_NguoiThucHien |
| lichsutonkho | MaPhieuNhap | phieunhap | MaPhieuNhap | FK_LichSuTonKho_PhieuNhap |
| lienhe | MaNguoiDung | nguoidung | MaNguoiDung | FK_LienHe_NguoiDung |
| magiamgianguoidung | MaGiamGia | magiamgia | MaGiamGia | FK_MaGiamGiaNguoiDung_MaGiamGia |
| magiamgianguoidung | MaNguoiDung | nguoidung | MaNguoiDung | FK_MaGiamGiaNguoiDung_NguoiDung |
| nguoidungvaitro | MaNguoiDung | nguoidung | MaNguoiDung | FK_NguoiDungVaiTro_NguoiDung |
| nguoidungvaitro | MaVaiTro | vaitro | MaVaiTro | FK_NguoiDungVaiTro_VaiTro |
| phieunhap | MaNguoiDuyet | nguoidung | MaNguoiDung | FK_PhieuNhap_NguoiDuyet |
| phieunhap | MaNguoiNhap | nguoidung | MaNguoiDung | FK_PhieuNhap_NguoiNhap |
| phieunhap | MaNhaCungCap | nhacungcap | MaNhaCungCap | FK_PhieuNhap_NhaCungCap |
| sanpham | MaDanhMuc | danhmuc | MaDanhMuc | FK_SanPham_DanhMuc |
| sanpham | MaThuongHieu | thuonghieu | MaThuongHieu | FK_SanPham_ThuongHieu |
| sanphamchuongtrinhgiamgia | MaChuongTrinh | chuongtrinhgiamgia | MaChuongTrinh | FK_SanPhamChuongTrinh_ChuongTrinh |
| sanphamchuongtrinhgiamgia | MaSanPham | sanpham | MaSanPham | FK_SanPhamChuongTrinh_SanPham |
| thanhtoan | MaDonHang | donhang | MaDonHang | FK_ThanhToan_DonHang |
