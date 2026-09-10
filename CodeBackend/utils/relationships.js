// Tự động sinh từ Foreign Key của MySQL.
// File này mô tả quan hệ giữa các bảng để dùng cho JOIN/API mở rộng.

const relationships = [
    {
        fromTable: 'bienthesanpham',
        fromColumn: 'MaKichThuoc',
        toTable: 'kichthuoc',
        toColumn: 'MaKichThuoc',
        constraint: 'FK_BienThe_KichThuoc'
    },
    {
        fromTable: 'bienthesanpham',
        fromColumn: 'MaMau',
        toTable: 'mausac',
        toColumn: 'MaMau',
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
        constraint: 'FK_CT_DonHang_BienThe'
    },
    {
        fromTable: 'chitietdonhang',
        fromColumn: 'MaDonHang',
        toTable: 'donhang',
        toColumn: 'MaDonHang',
        constraint: 'FK_CT_DonHang_DonHang'
    },
    {
        fromTable: 'chitietgiohang',
        fromColumn: 'MaBienThe',
        toTable: 'bienthesanpham',
        toColumn: 'MaBienThe',
        constraint: 'FK_CT_GioHang_BienThe'
    },
    {
        fromTable: 'chitietgiohang',
        fromColumn: 'MaGioHang',
        toTable: 'giohang',
        toColumn: 'MaGioHang',
        constraint: 'FK_CT_GioHang_GioHang'
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
        fromColumn: 'MaSanPham',
        toTable: 'sanpham',
        toColumn: 'MaSanPham',
        constraint: 'FK_DanhGia_SanPham'
    },
    {
        fromTable: 'diachi',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_DiaChi_NguoiDung'
    },
    {
        fromTable: 'donhang',
        fromColumn: 'MaDiaChi',
        toTable: 'diachi',
        toColumn: 'MaDiaChi',
        constraint: 'FK_DonHang_DiaChi'
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
        constraint: 'FK_HinhAnh_SanPham'
    },
    {
        fromTable: 'nguoidung',
        fromColumn: 'MaVaiTro',
        toTable: 'vaitro',
        toColumn: 'MaVaiTro',
        constraint: 'FK_NguoiDung_VaiTro'
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
        fromTable: 'yeuthich',
        fromColumn: 'MaNguoiDung',
        toTable: 'nguoidung',
        toColumn: 'MaNguoiDung',
        constraint: 'FK_YeuThich_NguoiDung'
    },
    {
        fromTable: 'yeuthich',
        fromColumn: 'MaSanPham',
        toTable: 'sanpham',
        toColumn: 'MaSanPham',
        constraint: 'FK_YeuThich_SanPham'
    },
];

module.exports = relationships;
