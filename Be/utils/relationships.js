// Tự động sinh từ Foreign Key của MySQL.
// File này mô tả quan hệ giữa các bảng để dùng cho JOIN/API mở rộng.

const relationships = [
    {
        fromTable: 'bienthechuongtrinhgiamgia',
        fromColumn: 'MaBienThe',
        toTable: 'bienthesanpham',
        toColumn: 'MaBienThe',
        constraint: 'FK_BienTheChuongTrinh_BienThe'
    },
    {
        fromTable: 'bienthechuongtrinhgiamgia',
        fromColumn: 'MaChuongTrinh',
        toTable: 'chuongtrinhgiamgia',
        toColumn: 'MaChuongTrinh',
        constraint: 'FK_BienTheChuongTrinh_ChuongTrinh'
    },
    {
        fromTable: 'bienthesanpham',
        fromColumn: 'MaKichThuoc',
        toTable: 'kichthuoc',
        toColumn: 'MaKichThuoc',
        constraint: 'FK_BienThe_KichThuoc'
    },
    {
        fromTable: 'bienthesanpham',
        fromColumn: 'MaMauSac',
        toTable: 'mausac',
        toColumn: 'MaMauSac',
        constraint: 'FK_BienThe_MauSac'
    },
    {
        fromTable: 'bienthesanpham',
        fromColumn: 'MaSanPham',
        toTable: 'sanpham',
        toColumn: 'MaSanPham',
        constraint: 'FK_BienThe_SanPham'
    },
    {
        fromTable: 'chitietdonhang',
        fromColumn: 'MaBienThe',
        toTable: 'bienthesanpham',
        toColumn: 'MaBienThe',
        constraint: 'FK_ChiTietDonHang_BienThe'
    },
    {
        fromTable: 'chitietdonhang',
        fromColumn: 'MaDonHang',
        toTable: 'donhang',
        toColumn: 'MaDonHang',
        constraint: 'FK_ChiTietDonHang_DonHang'
    },
    {
        fromTable: 'chitietgiohang',
        fromColumn: 'MaBienThe',
        toTable: 'bienthesanpham',
        toColumn: 'MaBienThe',
        constraint: 'FK_ChiTietGioHang_BienThe'
    },
    {
        fromTable: 'chitietgiohang',
        fromColumn: 'MaGioHang',
        toTable: 'giohang',
        toColumn: 'MaGioHang',
        constraint: 'FK_ChiTietGioHang_GioHang'
    },
    {
        fromTable: 'chitietphieunhap',
        fromColumn: 'MaBienThe',
        toTable: 'bienthesanpham',
        toColumn: 'MaBienThe',
        constraint: 'FK_ChiTietPhieuNhap_BienThe'
    },
    {
        fromTable: 'chitietphieunhap',
        fromColumn: 'MaPhieuNhap',
        toTable: 'phieunhap',
        toColumn: 'MaPhieuNhap',
        constraint: 'FK_ChiTietPhieuNhap_PhieuNhap'
    },
    {
        fromTable: 'danhgia',
        fromColumn: 'MaChiTietDonHang',
        toTable: 'chitietdonhang',
        toColumn: 'MaChiTietDonHang',
        constraint: 'FK_DanhGia_ChiTietDonHang'
    },
    {
        fromTable: 'danhgia',
        fromColumn: 'MaDonHang',
        toTable: 'donhang',
        toColumn: 'MaDonHang',
        constraint: 'FK_DanhGia_DonHang'
    },
    {
        fromTable: 'danhgia',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_DanhGia_NguoiDung'
    },
    {
        fromTable: 'danhgia',
        fromColumn: 'MaNguoiPhanHoi',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_DanhGia_NguoiPhanHoi'
    },
    {
        fromTable: 'danhgia',
        fromColumn: 'MaSanPham',
        toTable: 'sanpham',
        toColumn: 'MaSanPham',
        constraint: 'FK_DanhGia_SanPham'
    },
    {
        fromTable: 'diachigiaohang',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_DiaChiGiaoHang_NguoiDung'
    },
    {
        fromTable: 'donhang',
        fromColumn: 'MaDiaChi',
        toTable: 'diachigiaohang',
        toColumn: 'MaDiaChi',
        constraint: 'FK_DonHang_DiaChi'
    },
    {
        fromTable: 'donhang',
        fromColumn: 'MaGiamGia',
        toTable: 'magiamgia',
        toColumn: 'MaGiamGia',
        constraint: 'FK_DonHang_MaGiamGia'
    },
    {
        fromTable: 'donhang',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_DonHang_NguoiDung'
    },
    {
        fromTable: 'giohang',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_GioHang_NguoiDung'
    },
    {
        fromTable: 'hinhanhsanpham',
        fromColumn: 'MaSanPham',
        toTable: 'sanpham',
        toColumn: 'MaSanPham',
        constraint: 'FK_HinhAnhSanPham_SanPham'
    },
    {
        fromTable: 'hoadon',
        fromColumn: 'MaDonHang',
        toTable: 'donhang',
        toColumn: 'MaDonHang',
        constraint: 'FK_HoaDon_DonHang'
    },
    {
        fromTable: 'hoadon',
        fromColumn: 'MaNguoiLap',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_HoaDon_NguoiLap'
    },
    {
        fromTable: 'lichsudonhang',
        fromColumn: 'MaDonHang',
        toTable: 'donhang',
        toColumn: 'MaDonHang',
        constraint: 'FK_LichSuDonHang_DonHang'
    },
    {
        fromTable: 'lichsudonhang',
        fromColumn: 'MaNguoiThayDoi',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_LichSuDonHang_NguoiThayDoi'
    },
    {
        fromTable: 'lichsutonkho',
        fromColumn: 'MaBienThe',
        toTable: 'bienthesanpham',
        toColumn: 'MaBienThe',
        constraint: 'FK_LichSuTonKho_BienThe'
    },
    {
        fromTable: 'lichsutonkho',
        fromColumn: 'MaDonHang',
        toTable: 'donhang',
        toColumn: 'MaDonHang',
        constraint: 'FK_LichSuTonKho_DonHang'
    },
    {
        fromTable: 'lichsutonkho',
        fromColumn: 'MaNguoiThucHien',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_LichSuTonKho_NguoiThucHien'
    },
    {
        fromTable: 'lichsutonkho',
        fromColumn: 'MaPhieuNhap',
        toTable: 'phieunhap',
        toColumn: 'MaPhieuNhap',
        constraint: 'FK_LichSuTonKho_PhieuNhap'
    },
    {
        fromTable: 'lienhe',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_LienHe_NguoiDung'
    },
    {
        fromTable: 'magiamgianguoidung',
        fromColumn: 'MaGiamGia',
        toTable: 'magiamgia',
        toColumn: 'MaGiamGia',
        constraint: 'FK_MaGiamGiaNguoiDung_MaGiamGia'
    },
    {
        fromTable: 'magiamgianguoidung',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_MaGiamGiaNguoiDung_NguoiDung'
    },
    {
        fromTable: 'nguoidungvaitro',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_NguoiDungVaiTro_NguoiDung'
    },
    {
        fromTable: 'nguoidungvaitro',
        fromColumn: 'MaVaiTro',
        toTable: 'vaitro',
        toColumn: 'MaVaiTro',
        constraint: 'FK_NguoiDungVaiTro_VaiTro'
    },
    {
        fromTable: 'phieunhap',
        fromColumn: 'MaNguoiDuyet',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_PhieuNhap_NguoiDuyet'
    },
    {
        fromTable: 'phieunhap',
        fromColumn: 'MaNguoiNhap',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_PhieuNhap_NguoiNhap'
    },
    {
        fromTable: 'phieunhap',
        fromColumn: 'MaNhaCungCap',
        toTable: 'nhacungcap',
        toColumn: 'MaNhaCungCap',
        constraint: 'FK_PhieuNhap_NhaCungCap'
    },
    {
        fromTable: 'sanpham',
        fromColumn: 'MaDanhMuc',
        toTable: 'danhmuc',
        toColumn: 'MaDanhMuc',
        constraint: 'FK_SanPham_DanhMuc'
    },
    {
        fromTable: 'sanpham',
        fromColumn: 'MaThuongHieu',
        toTable: 'thuonghieu',
        toColumn: 'MaThuongHieu',
        constraint: 'FK_SanPham_ThuongHieu'
    },
    {
        fromTable: 'sanphamchuongtrinhgiamgia',
        fromColumn: 'MaChuongTrinh',
        toTable: 'chuongtrinhgiamgia',
        toColumn: 'MaChuongTrinh',
        constraint: 'FK_SanPhamChuongTrinh_ChuongTrinh'
    },
    {
        fromTable: 'sanphamchuongtrinhgiamgia',
        fromColumn: 'MaSanPham',
        toTable: 'sanpham',
        toColumn: 'MaSanPham',
        constraint: 'FK_SanPhamChuongTrinh_SanPham'
    },
    {
        fromTable: 'thanhtoan',
        fromColumn: 'MaDonHang',
        toTable: 'donhang',
        toColumn: 'MaDonHang',
        constraint: 'FK_ThanhToan_DonHang'
    },
];

module.exports = relationships;
