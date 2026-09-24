-- =========================================================
-- DATABASE: CUA_HANG_QUAN_AO_ONLINE
-- Đề tài: XÂY DỰNG HỆ THỐNG ĐA PHƯƠNG TIỆN CỬA HÀNG BÁN QUẦN ÁO ONLINE
-- MySQL 8.x / MariaDB 10.4+
-- Thiết kế tương thích với C# Auto Code Generator -> Node.js Backend
-- =========================================================

DROP DATABASE IF EXISTS CuaHangQuanAoOnline;

CREATE DATABASE CuaHangQuanAoOnline
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE CuaHangQuanAoOnline;

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. VAI TRÒ
-- =========================================================
CREATE TABLE VaiTro (
    MaVaiTro INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenVaiTro VARCHAR(50) NOT NULL,
    MoTa VARCHAR(255),
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_VaiTro_Ten UNIQUE (TenVaiTro)
) ENGINE=InnoDB;

-- =========================================================
-- 2. NGƯỜI DÙNG
-- =========================================================
CREATE TABLE NguoiDung (
    MaNguoiDung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    HoTen VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    DienThoai VARCHAR(20),
    DiaChi VARCHAR(255),
    AnhDaiDien VARCHAR(255),
    TrangThai ENUM('HOAT_DONG','KHOA') NOT NULL DEFAULT 'HOAT_DONG',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_NguoiDung_TenDangNhap UNIQUE (TenDangNhap),
    CONSTRAINT UQ_NguoiDung_Email UNIQUE (Email),
    CONSTRAINT UQ_NguoiDung_DienThoai UNIQUE (DienThoai)
) ENGINE=InnoDB;

-- =========================================================
-- 3. NGƯỜI DÙNG - VAI TRÒ
-- =========================================================
CREATE TABLE NguoiDungVaiTro (
    MaNguoiDungVaiTro INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT UNSIGNED NOT NULL,
    MaVaiTro INT UNSIGNED NOT NULL,
    CONSTRAINT UQ_NguoiDungVaiTro UNIQUE (MaNguoiDung, MaVaiTro),
    CONSTRAINT FK_NguoiDungVaiTro_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_NguoiDungVaiTro_VaiTro
        FOREIGN KEY (MaVaiTro) REFERENCES VaiTro(MaVaiTro)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 4. DANH MỤC SẢN PHẨM
-- =========================================================
CREATE TABLE DanhMuc (
    MaDanhMuc INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenDanhMuc VARCHAR(100) NOT NULL,
    MoTa VARCHAR(500),
    HinhAnh VARCHAR(255),
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_DanhMuc_Ten UNIQUE (TenDanhMuc)
) ENGINE=InnoDB;

-- =========================================================
-- 5. THƯƠNG HIỆU
-- =========================================================
CREATE TABLE ThuongHieu (
    MaThuongHieu INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenThuongHieu VARCHAR(100) NOT NULL,
    MoTa TEXT,
    Logo VARCHAR(255),
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_ThuongHieu_Ten UNIQUE (TenThuongHieu)
) ENGINE=InnoDB;

-- =========================================================
-- 6. SẢN PHẨM
-- Thông tin chung; tồn kho thực tế nằm ở BienTheSanPham
-- =========================================================
CREATE TABLE SanPham (
    MaSanPham INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaDanhMuc INT UNSIGNED NOT NULL,
    MaThuongHieu INT UNSIGNED,
    MaSanPhamCode VARCHAR(50) NOT NULL,
    TenSanPham VARCHAR(200) NOT NULL,
    GiaBan DECIMAL(15,2) NOT NULL DEFAULT 0,
    GiaNhap DECIMAL(15,2) NOT NULL DEFAULT 0,
    MoTa TEXT,
    MoTaChiTiet LONGTEXT,
    ChatLieu VARCHAR(100),
    GioiTinh ENUM('NAM','NU','UNISEX','TRE_EM') DEFAULT 'UNISEX',
    TrangThai ENUM('DANG_BAN','NGUNG_BAN','HET_HANG') NOT NULL DEFAULT 'DANG_BAN',
    NoiBat TINYINT(1) NOT NULL DEFAULT 0,
    LuotXem INT UNSIGNED NOT NULL DEFAULT 0,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_SanPham_Code UNIQUE (MaSanPhamCode),
    CONSTRAINT FK_SanPham_DanhMuc
        FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc(MaDanhMuc)
        ON UPDATE CASCADE,
    CONSTRAINT FK_SanPham_ThuongHieu
        FOREIGN KEY (MaThuongHieu) REFERENCES ThuongHieu(MaThuongHieu)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_SanPham_GiaBan CHECK (GiaBan >= 0),
    CONSTRAINT CK_SanPham_GiaNhap CHECK (GiaNhap >= 0),
    INDEX IX_SanPham_DanhMuc (MaDanhMuc),
    INDEX IX_SanPham_ThuongHieu (MaThuongHieu),
    INDEX IX_SanPham_Ten (TenSanPham),
    INDEX IX_SanPham_TrangThai (TrangThai)
) ENGINE=InnoDB;

-- =========================================================
-- 7. MÀU SẮC
-- =========================================================
CREATE TABLE MauSac (
    MaMauSac INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenMau VARCHAR(50) NOT NULL,
    MaMauHex VARCHAR(20),
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT UQ_MauSac_Ten UNIQUE (TenMau)
) ENGINE=InnoDB;

-- =========================================================
-- 8. KÍCH THƯỚC
-- =========================================================
CREATE TABLE KichThuoc (
    MaKichThuoc INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenKichThuoc VARCHAR(30) NOT NULL,
    MoTa VARCHAR(255),
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT UQ_KichThuoc_Ten UNIQUE (TenKichThuoc)
) ENGINE=InnoDB;

-- =========================================================
-- 9. BIẾN THỂ SẢN PHẨM
-- Một sản phẩm có nhiều Size/Màu; tồn kho quản lý ở đây
-- =========================================================
CREATE TABLE BienTheSanPham (
    MaBienThe INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT UNSIGNED NOT NULL,
    MaMauSac INT UNSIGNED,
    MaKichThuoc INT UNSIGNED,
    SKU VARCHAR(80) NOT NULL,
    GiaBan DECIMAL(15,2) NOT NULL DEFAULT 0,
    GiaNhap DECIMAL(15,2) NOT NULL DEFAULT 0,
    SoLuongTon INT UNSIGNED NOT NULL DEFAULT 0,
    SoLuongTamGiu INT UNSIGNED NOT NULL DEFAULT 0,
    SoLuongDaBan INT UNSIGNED NOT NULL DEFAULT 0,
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_BienThe_SKU UNIQUE (SKU),
    CONSTRAINT UQ_BienThe_ThuocTinh UNIQUE (MaSanPham, MaMauSac, MaKichThuoc),
    CONSTRAINT FK_BienThe_SanPham
        FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_BienThe_MauSac
        FOREIGN KEY (MaMauSac) REFERENCES MauSac(MaMauSac)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_BienThe_KichThuoc
        FOREIGN KEY (MaKichThuoc) REFERENCES KichThuoc(MaKichThuoc)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_BienThe_GiaBan CHECK (GiaBan >= 0),
    CONSTRAINT CK_BienThe_GiaNhap CHECK (GiaNhap >= 0),
    CONSTRAINT CK_BienThe_TamGiu CHECK (SoLuongTamGiu >= 0 AND SoLuongTamGiu <= SoLuongTon),
    INDEX IX_BienThe_SanPham (MaSanPham),
    INDEX IX_BienThe_MauSac (MaMauSac),
    INDEX IX_BienThe_KichThuoc (MaKichThuoc),
    INDEX IX_BienThe_Ton (SoLuongTon),
    INDEX IX_BienThe_TamGiu (SoLuongTamGiu)
) ENGINE=InnoDB;

-- =========================================================
-- 10. HÌNH ẢNH SẢN PHẨM
-- =========================================================
CREATE TABLE HinhAnhSanPham (
    MaHinhAnh INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT UNSIGNED NOT NULL,
    DuongDanAnh VARCHAR(500) NOT NULL,
    MoTa VARCHAR(255),
    LaAnhChinh TINYINT(1) NOT NULL DEFAULT 0,
    ThuTu INT UNSIGNED NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_HinhAnhSanPham_SanPham
        FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT CK_HinhAnh_ThuTu CHECK (ThuTu > 0),
    INDEX IX_HinhAnhSanPham_SanPham (MaSanPham)
) ENGINE=InnoDB;

-- =========================================================
-- 11. MÃ GIẢM GIÁ / VOUCHER ĐƠN HÀNG
-- Chỉ áp dụng ở cấp giỏ hàng/đơn hàng
-- =========================================================
CREATE TABLE MaGiamGia (
    MaGiamGia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaCode VARCHAR(50) NOT NULL,
    TenMaGiamGia VARCHAR(150) NOT NULL,
    MoTa TEXT,
    LoaiGiam ENUM('PHAN_TRAM','SO_TIEN') NOT NULL,
    GiaTriGiam DECIMAL(15,2) NOT NULL,
    GiamToiDa DECIMAL(15,2),
    DonToiThieu DECIMAL(15,2) NOT NULL DEFAULT 0,
    TongSoLuong INT UNSIGNED DEFAULT NULL,
    SoLuongDaSuDung INT UNSIGNED NOT NULL DEFAULT 0,
    SoLanSuDungMoiNguoi INT UNSIGNED NOT NULL DEFAULT 1,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_MaGiamGia_Code UNIQUE (MaCode),
    CONSTRAINT CK_MaGiamGia_GiaTri CHECK (GiaTriGiam > 0),
    CONSTRAINT CK_MaGiamGia_PhanTram CHECK (LoaiGiam <> 'PHAN_TRAM' OR GiaTriGiam <= 100),
    CONSTRAINT CK_MaGiamGia_GiamToiDa CHECK (GiamToiDa IS NULL OR GiamToiDa >= 0),
    CONSTRAINT CK_MaGiamGia_DonToiThieu CHECK (DonToiThieu >= 0),
    CONSTRAINT CK_MaGiamGia_SoLan CHECK (SoLanSuDungMoiNguoi > 0),
    CONSTRAINT CK_MaGiamGia_Ngay CHECK (NgayKetThuc > NgayBatDau),
    INDEX IX_MaGiamGia_Ngay (NgayBatDau, NgayKetThuc),
    INDEX IX_MaGiamGia_TrangThai (TrangThai)
) ENGINE=InnoDB;

-- =========================================================
-- 12. LƯỢT SỬ DỤNG VOUCHER THEO NGƯỜI DÙNG
-- =========================================================
CREATE TABLE MaGiamGiaNguoiDung (
    MaGiamGiaNguoiDung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaGiamGia INT UNSIGNED NOT NULL,
    MaNguoiDung INT UNSIGNED NOT NULL,
    SoLanDaSuDung INT UNSIGNED NOT NULL DEFAULT 0,
    LanSuDungCuoi DATETIME,
    CONSTRAINT UQ_MaGiamGiaNguoiDung UNIQUE (MaGiamGia, MaNguoiDung),
    CONSTRAINT FK_MaGiamGiaNguoiDung_MaGiamGia
        FOREIGN KEY (MaGiamGia) REFERENCES MaGiamGia(MaGiamGia)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_MaGiamGiaNguoiDung_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 13. CHƯƠNG TRÌNH GIẢM GIÁ SẢN PHẨM / FLASH SALE
-- Giảm trực tiếp trên sản phẩm hoặc biến thể theo thời gian
-- =========================================================
CREATE TABLE ChuongTrinhGiamGia (
    MaChuongTrinh INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenChuongTrinh VARCHAR(150) NOT NULL,
    MoTa TEXT,
    LoaiGiam ENUM('PHAN_TRAM','SO_TIEN') NOT NULL,
    GiaTriGiam DECIMAL(15,2) NOT NULL,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT CK_ChuongTrinh_GiaTri CHECK (GiaTriGiam > 0),
    CONSTRAINT CK_ChuongTrinh_PhanTram CHECK (LoaiGiam <> 'PHAN_TRAM' OR GiaTriGiam <= 100),
    CONSTRAINT CK_ChuongTrinh_Ngay CHECK (NgayKetThuc > NgayBatDau),
    INDEX IX_ChuongTrinh_Ngay (NgayBatDau, NgayKetThuc),
    INDEX IX_ChuongTrinh_TrangThai (TrangThai)
) ENGINE=InnoDB;

-- =========================================================
-- 14. SẢN PHẨM - CHƯƠNG TRÌNH GIẢM GIÁ
-- =========================================================
CREATE TABLE SanPhamChuongTrinhGiamGia (
    MaSanPhamChuongTrinh INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT UNSIGNED NOT NULL,
    MaChuongTrinh INT UNSIGNED NOT NULL,
    CONSTRAINT UQ_SanPhamChuongTrinh UNIQUE (MaSanPham, MaChuongTrinh),
    CONSTRAINT FK_SanPhamChuongTrinh_SanPham
        FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_SanPhamChuongTrinh_ChuongTrinh
        FOREIGN KEY (MaChuongTrinh) REFERENCES ChuongTrinhGiamGia(MaChuongTrinh)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 15. BIẾN THỂ - CHƯƠNG TRÌNH GIẢM GIÁ
-- Cho phép Flash Sale riêng theo SKU
-- =========================================================
CREATE TABLE BienTheChuongTrinhGiamGia (
    MaBienTheChuongTrinh INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaBienThe INT UNSIGNED NOT NULL,
    MaChuongTrinh INT UNSIGNED NOT NULL,
    CONSTRAINT UQ_BienTheChuongTrinh UNIQUE (MaBienThe, MaChuongTrinh),
    CONSTRAINT FK_BienTheChuongTrinh_BienThe
        FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_BienTheChuongTrinh_ChuongTrinh
        FOREIGN KEY (MaChuongTrinh) REFERENCES ChuongTrinhGiamGia(MaChuongTrinh)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 16. GIỎ HÀNG
-- =========================================================
CREATE TABLE GioHang (
    MaGioHang INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT UNSIGNED NOT NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_GioHang_NguoiDung UNIQUE (MaNguoiDung),
    CONSTRAINT FK_GioHang_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 17. CHI TIẾT GIỎ HÀNG
-- =========================================================
CREATE TABLE ChiTietGioHang (
    MaChiTietGioHang INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaGioHang INT UNSIGNED NOT NULL,
    MaBienThe INT UNSIGNED NOT NULL,
    SoLuong INT UNSIGNED NOT NULL DEFAULT 1,
    DonGia DECIMAL(15,2) NOT NULL DEFAULT 0,
    NgayThem DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_ChiTietGioHang UNIQUE (MaGioHang, MaBienThe),
    CONSTRAINT FK_ChiTietGioHang_GioHang
        FOREIGN KEY (MaGioHang) REFERENCES GioHang(MaGioHang)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietGioHang_BienThe
        FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
        ON UPDATE CASCADE,
    CONSTRAINT CK_ChiTietGioHang_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_ChiTietGioHang_DonGia CHECK (DonGia >= 0)
) ENGINE=InnoDB;

-- =========================================================
-- 18. ĐỊA CHỈ GIAO HÀNG
-- =========================================================
CREATE TABLE DiaChiGiaoHang (
    MaDiaChi INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT UNSIGNED NOT NULL,
    TenNguoiNhan VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL,
    DiaChiChiTiet VARCHAR(255) NOT NULL,
    PhuongXa VARCHAR(100),
    QuanHuyen VARCHAR(100),
    TinhThanh VARCHAR(100),
    LaMacDinh TINYINT(1) NOT NULL DEFAULT 0,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_DiaChiGiaoHang_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX IX_DiaChiGiaoHang_NguoiDung (MaNguoiDung)
) ENGINE=InnoDB;

-- =========================================================
-- 19. ĐƠN HÀNG
-- =========================================================
CREATE TABLE DonHang (
    MaDonHang INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT UNSIGNED,
    MaDiaChi INT UNSIGNED,
    MaDonHangCode VARCHAR(50) NOT NULL,
    TenNguoiNhan VARCHAR(100) NOT NULL,
    SoDienThoaiNhan VARCHAR(20) NOT NULL,
    DiaChiGiaoHang VARCHAR(500) NOT NULL,
    TongTien DECIMAL(15,2) NOT NULL DEFAULT 0,
    GiamGia DECIMAL(15,2) NOT NULL DEFAULT 0,
    PhiGiaoHang DECIMAL(15,2) NOT NULL DEFAULT 0,
    ThanhTien DECIMAL(15,2) NOT NULL DEFAULT 0,
    TrangThaiThanhToan ENUM('CHUA_THANH_TOAN','DA_THANH_TOAN','HOAN_TIEN') NOT NULL DEFAULT 'CHUA_THANH_TOAN',
    TrangThaiDonHang ENUM('CHO_XAC_NHAN','DA_XAC_NHAN','DANG_CHUAN_BI','DANG_GIAO','DA_GIAO','DA_HUY','DA_HOAN_TIEN') NOT NULL DEFAULT 'CHO_XAC_NHAN',
    MaGiamGia INT UNSIGNED,
    GhiChu TEXT,
    NgayDat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_DonHang_Code UNIQUE (MaDonHangCode),
    CONSTRAINT FK_DonHang_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_DonHang_DiaChi
        FOREIGN KEY (MaDiaChi) REFERENCES DiaChiGiaoHang(MaDiaChi)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_DonHang_MaGiamGia
        FOREIGN KEY (MaGiamGia) REFERENCES MaGiamGia(MaGiamGia)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_DonHang_TongTien CHECK (TongTien >= 0),
    CONSTRAINT CK_DonHang_GiamGia CHECK (GiamGia >= 0),
    CONSTRAINT CK_DonHang_PhiGiaoHang CHECK (PhiGiaoHang >= 0),
    CONSTRAINT CK_DonHang_ThanhTien CHECK (ThanhTien >= 0),
    INDEX IX_DonHang_NguoiDung (MaNguoiDung),
    INDEX IX_DonHang_TrangThai (TrangThaiDonHang),
    INDEX IX_DonHang_NgayDat (NgayDat)
) ENGINE=InnoDB;

-- =========================================================
-- 20. CHI TIẾT ĐƠN HÀNG
-- Lưu tên/SKU tại thời điểm mua để giữ lịch sử
-- =========================================================
CREATE TABLE ChiTietDonHang (
    MaChiTietDonHang INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT UNSIGNED NOT NULL,
    MaBienThe INT UNSIGNED,
    TenSanPham VARCHAR(200) NOT NULL,
    SKU VARCHAR(80),
    MauSac VARCHAR(50),
    KichThuoc VARCHAR(30),
    SoLuong INT UNSIGNED NOT NULL,
    DonGia DECIMAL(15,2) NOT NULL,
    GiamGia DECIMAL(15,2) NOT NULL DEFAULT 0,
    ThanhTien DECIMAL(15,2) NOT NULL,
    CONSTRAINT FK_ChiTietDonHang_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietDonHang_BienThe
        FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_ChiTietDonHang_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_ChiTietDonHang_DonGia CHECK (DonGia >= 0),
    CONSTRAINT CK_ChiTietDonHang_GiamGia CHECK (GiamGia >= 0),
    CONSTRAINT CK_ChiTietDonHang_ThanhTien CHECK (ThanhTien >= 0),
    INDEX IX_ChiTietDonHang_DonHang (MaDonHang),
    INDEX IX_ChiTietDonHang_BienThe (MaBienThe)
) ENGINE=InnoDB;

-- =========================================================
-- 21. LỊCH SỬ TRẠNG THÁI ĐƠN HÀNG
-- Ghi nhận ai thay đổi, trạng thái cũ/mới và thời điểm
-- =========================================================
CREATE TABLE LichSuDonHang (
    MaLichSu INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT UNSIGNED NOT NULL,
    TrangThaiCu ENUM('CHO_XAC_NHAN','DA_XAC_NHAN','DANG_CHUAN_BI','DANG_GIAO','DA_GIAO','DA_HUY','DA_HOAN_TIEN'),
    TrangThaiMoi ENUM('CHO_XAC_NHAN','DA_XAC_NHAN','DANG_CHUAN_BI','DANG_GIAO','DA_GIAO','DA_HUY','DA_HOAN_TIEN') NOT NULL,
    MaNguoiThayDoi INT UNSIGNED,
    GhiChu VARCHAR(500),
    ThoiGian DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_LichSuDonHang_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_LichSuDonHang_NguoiThayDoi
        FOREIGN KEY (MaNguoiThayDoi) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX IX_LichSuDonHang_DonHang (MaDonHang, ThoiGian),
    INDEX IX_LichSuDonHang_TrangThai (TrangThaiMoi)
) ENGINE=InnoDB;

-- =========================================================
-- 22. THANH TOÁN
-- =========================================================
CREATE TABLE ThanhToan (
    MaThanhToan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT UNSIGNED NOT NULL,
    MaGiaoDich VARCHAR(100),
    PhuongThuc ENUM('COD','CHUYEN_KHOAN','VNPAY','MOMO') NOT NULL,
    LanThu INT UNSIGNED NOT NULL DEFAULT 1,
    SoTien DECIMAL(15,2) NOT NULL,
    TrangThai ENUM('CHO_XU_LY','THANH_CONG','THAT_BAI','HOAN_TIEN') NOT NULL DEFAULT 'CHO_XU_LY',
    ThoiGianThanhToan DATETIME,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    GhiChu VARCHAR(255),
    CONSTRAINT FK_ThanhToan_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT CK_ThanhToan_SoTien CHECK (SoTien >= 0),
    CONSTRAINT CK_ThanhToan_LanThu CHECK (LanThu > 0),
    INDEX IX_ThanhToan_DonHang (MaDonHang),
    INDEX IX_ThanhToan_TrangThai (TrangThai),
    UNIQUE KEY UQ_ThanhToan_LanThu (MaDonHang, LanThu)
) ENGINE=InnoDB;

-- =========================================================
-- 23. HÓA ĐƠN
-- =========================================================
CREATE TABLE HoaDon (
    MaHoaDon INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT UNSIGNED NOT NULL,
    MaNguoiLap INT UNSIGNED,
    SoHoaDon VARCHAR(50) NOT NULL,
    NgayLap DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(15,2) NOT NULL DEFAULT 0,
    GhiChu VARCHAR(255),
    CONSTRAINT UQ_HoaDon_SoHoaDon UNIQUE (SoHoaDon),
    CONSTRAINT UQ_HoaDon_DonHang UNIQUE (MaDonHang),
    CONSTRAINT FK_HoaDon_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON UPDATE CASCADE,
    CONSTRAINT FK_HoaDon_NguoiLap
        FOREIGN KEY (MaNguoiLap) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_HoaDon_TongTien CHECK (TongTien >= 0)
) ENGINE=InnoDB;

-- =========================================================
-- 24. ĐÁNH GIÁ SẢN PHẨM
-- Chỉ đánh giá từ một chi tiết đơn hàng đã giao
-- =========================================================
CREATE TABLE DanhGia (
    MaDanhGia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT UNSIGNED NOT NULL,
    MaSanPham INT UNSIGNED NOT NULL,
    MaDonHang INT UNSIGNED NOT NULL,
    MaChiTietDonHang INT UNSIGNED NOT NULL,
    SoSao TINYINT UNSIGNED NOT NULL,
    NoiDung TEXT,
    HinhAnh VARCHAR(500),
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NoiDungPhanHoi TEXT,
    NgayPhanHoi DATETIME,
    MaNguoiPhanHoi INT UNSIGNED,
    NgayDanhGia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_DanhGia_ChiTiet UNIQUE (MaNguoiDung, MaChiTietDonHang),
    CONSTRAINT FK_DanhGia_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_DanhGia_SanPham
        FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_DanhGia_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_DanhGia_ChiTietDonHang
        FOREIGN KEY (MaChiTietDonHang) REFERENCES ChiTietDonHang(MaChiTietDonHang)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_DanhGia_NguoiPhanHoi
        FOREIGN KEY (MaNguoiPhanHoi) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_DanhGia_SoSao CHECK (SoSao BETWEEN 1 AND 5),
    INDEX IX_DanhGia_SanPham (MaSanPham),
    INDEX IX_DanhGia_NguoiDung (MaNguoiDung),
    INDEX IX_DanhGia_DonHang (MaDonHang)
) ENGINE=InnoDB;

-- =========================================================
-- 25. NHÀ CUNG CẤP
-- =========================================================
CREATE TABLE NhaCungCap (
    MaNhaCungCap INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenNhaCungCap VARCHAR(150) NOT NULL,
    NguoiLienHe VARCHAR(100),
    SoDienThoai VARCHAR(20),
    Email VARCHAR(100),
    DiaChi VARCHAR(255),
    TrangThai TINYINT(1) NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_NhaCungCap_Ten UNIQUE (TenNhaCungCap)
) ENGINE=InnoDB;

-- =========================================================
-- 26. PHIẾU NHẬP
-- =========================================================
CREATE TABLE PhieuNhap (
    MaPhieuNhap INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaNhaCungCap INT UNSIGNED NOT NULL,
    MaNguoiNhap INT UNSIGNED,
    SoPhieuNhap VARCHAR(50) NOT NULL,
    TongTien DECIMAL(15,2) NOT NULL DEFAULT 0,
    TrangThai ENUM('CHO_DUYET','DA_DUYET','DA_HUY') NOT NULL DEFAULT 'CHO_DUYET',
    MaNguoiDuyet INT UNSIGNED,
    NgayDuyet DATETIME,
    DaCapNhatTonKho TINYINT(1) NOT NULL DEFAULT 0,
    GhiChu TEXT,
    NgayNhap DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_PhieuNhap_SoPhieu UNIQUE (SoPhieuNhap),
    CONSTRAINT FK_PhieuNhap_NhaCungCap
        FOREIGN KEY (MaNhaCungCap) REFERENCES NhaCungCap(MaNhaCungCap)
        ON UPDATE CASCADE,
    CONSTRAINT FK_PhieuNhap_NguoiNhap
        FOREIGN KEY (MaNguoiNhap) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_PhieuNhap_NguoiDuyet
        FOREIGN KEY (MaNguoiDuyet) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_PhieuNhap_TongTien CHECK (TongTien >= 0),
    INDEX IX_PhieuNhap_NhaCungCap (MaNhaCungCap),
    INDEX IX_PhieuNhap_NgayNhap (NgayNhap)
) ENGINE=InnoDB;

-- =========================================================
-- 27. CHI TIẾT PHIẾU NHẬP
-- =========================================================
CREATE TABLE ChiTietPhieuNhap (
    MaChiTietPhieuNhap INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaPhieuNhap INT UNSIGNED NOT NULL,
    MaBienThe INT UNSIGNED NOT NULL,
    SoLuong INT UNSIGNED NOT NULL,
    DonGia DECIMAL(15,2) NOT NULL,
    ThanhTien DECIMAL(15,2) NOT NULL,
    CONSTRAINT FK_ChiTietPhieuNhap_PhieuNhap
        FOREIGN KEY (MaPhieuNhap) REFERENCES PhieuNhap(MaPhieuNhap)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietPhieuNhap_BienThe
        FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
        ON UPDATE CASCADE,
    CONSTRAINT CK_ChiTietPhieuNhap_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_ChiTietPhieuNhap_DonGia CHECK (DonGia >= 0),
    CONSTRAINT CK_ChiTietPhieuNhap_ThanhTien CHECK (ThanhTien >= 0),
    INDEX IX_ChiTietPhieuNhap_PhieuNhap (MaPhieuNhap),
    INDEX IX_ChiTietPhieuNhap_BienThe (MaBienThe)
) ENGINE=InnoDB;

-- =========================================================
-- 28. LỊCH SỬ BIẾN ĐỘNG TỒN KHO
-- Audit nhập/bán/giữ/hủy giữ/hoàn/điều chỉnh
-- =========================================================
CREATE TABLE LichSuTonKho (
    MaLichSuTonKho BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaBienThe INT UNSIGNED NOT NULL,
    LoaiGiaoDich ENUM('NHAP_KHO','BAN_HANG','HOAN_HANG','GIU_HANG','HUY_GIU_HANG','DIEU_CHINH') NOT NULL,
    SoLuongThayDoi INT NOT NULL,
    TonTruoc INT UNSIGNED NOT NULL,
    TonSau INT UNSIGNED NOT NULL,
    TamGiuTruoc INT UNSIGNED NOT NULL DEFAULT 0,
    TamGiuSau INT UNSIGNED NOT NULL DEFAULT 0,
    MaPhieuNhap INT UNSIGNED,
    MaDonHang INT UNSIGNED,
    MaNguoiThucHien INT UNSIGNED,
    LyDo VARCHAR(500),
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_LichSuTonKho_BienThe
        FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
        ON UPDATE CASCADE,
    CONSTRAINT FK_LichSuTonKho_PhieuNhap
        FOREIGN KEY (MaPhieuNhap) REFERENCES PhieuNhap(MaPhieuNhap)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_LichSuTonKho_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT FK_LichSuTonKho_NguoiThucHien
        FOREIGN KEY (MaNguoiThucHien) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_LichSuTonKho_TonSau CHECK (TonSau >= 0),
    CONSTRAINT CK_LichSuTonKho_TamGiuSau CHECK (TamGiuSau >= 0 AND TamGiuSau <= TonSau),
    INDEX IX_LichSuTonKho_BienThe (MaBienThe, NgayTao),
    INDEX IX_LichSuTonKho_PhieuNhap (MaPhieuNhap),
    INDEX IX_LichSuTonKho_DonHang (MaDonHang)
) ENGINE=InnoDB;

-- =========================================================
-- 29. LIÊN HỆ
-- =========================================================
CREATE TABLE LienHe (
    MaLienHe INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT UNSIGNED,
    HoTen VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    SoDienThoai VARCHAR(20),
    ChuDe VARCHAR(255),
    NoiDung TEXT NOT NULL,
    TrangThai ENUM('CHUA_XU_LY','DANG_XU_LY','DA_XU_LY') NOT NULL DEFAULT 'CHUA_XU_LY',
    NgayGui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayXuLy DATETIME,
    CONSTRAINT FK_LienHe_NguoiDung
        FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX IX_LienHe_TrangThai (TrangThai),
    INDEX IX_LienHe_NgayGui (NgayGui)
) ENGINE=InnoDB;

-- =========================================================
-- NGHIỆP VỤ REVIEW: CHỈ REVIEW ĐƠN ĐÃ GIAO
-- =========================================================
DELIMITER $$

CREATE TRIGGER trg_DanhGia_KiemTraDaGiao
BEFORE INSERT ON DanhGia
FOR EACH ROW
BEGIN
    DECLARE vTrangThai VARCHAR(30);
    DECLARE vNguoiDung INT UNSIGNED;
    DECLARE vSanPham INT UNSIGNED;
    DECLARE vMaBienThe INT UNSIGNED;

    SELECT dh.TrangThaiDonHang, dh.MaNguoiDung, ctdh.MaBienThe
      INTO vTrangThai, vNguoiDung, vMaBienThe
    FROM DonHang dh
    JOIN ChiTietDonHang ctdh ON ctdh.MaDonHang = dh.MaDonHang
    WHERE dh.MaDonHang = NEW.MaDonHang
      AND ctdh.MaChiTietDonHang = NEW.MaChiTietDonHang
    LIMIT 1;

    IF vTrangThai IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chi tiet don hang khong hop le.';
    END IF;

    IF vTrangThai <> 'DA_GIAO' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chi duoc danh gia khi don hang da giao.';
    END IF;

    IF vNguoiDung <> NEW.MaNguoiDung THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nguoi dung khong so huu don hang.';
    END IF;

    SELECT sp.MaSanPham
      INTO vSanPham
    FROM ChiTietDonHang ctdh
    JOIN BienTheSanPham bt ON bt.MaBienThe = ctdh.MaBienThe
    JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
    WHERE ctdh.MaChiTietDonHang = NEW.MaChiTietDonHang
    LIMIT 1;

    IF vSanPham IS NULL OR vSanPham <> NEW.MaSanPham THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'San pham danh gia khong khop chi tiet don hang.';
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- NGHIỆP VỤ KHO: DUYỆT PHIẾU NHẬP => CỘNG TỒN KHO
-- Backend/Admin nên cập nhật TrangThai='DA_DUYET' trong transaction.
-- Trigger chỉ xử lý một lần nhờ DaCapNhatTonKho.
-- =========================================================
DELIMITER $$

CREATE TRIGGER trg_PhieuNhap_TruocDuyet
BEFORE UPDATE ON PhieuNhap
FOR EACH ROW
BEGIN
    IF OLD.TrangThai <> 'DA_DUYET'
       AND NEW.TrangThai = 'DA_DUYET'
       AND OLD.DaCapNhatTonKho = 0 THEN
        SET NEW.DaCapNhatTonKho = 1;
        SET NEW.NgayDuyet = COALESCE(NEW.NgayDuyet, CURRENT_TIMESTAMP);
    END IF;
END$$

CREATE TRIGGER trg_PhieuNhap_DuyetCongTon
AFTER UPDATE ON PhieuNhap
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE vMaBienThe INT UNSIGNED;
    DECLARE vSoLuong INT UNSIGNED;
    DECLARE vTonTruoc INT UNSIGNED;
    DECLARE vTonSau INT UNSIGNED;

    DECLARE cur CURSOR FOR
        SELECT MaBienThe, SoLuong
        FROM ChiTietPhieuNhap
        WHERE MaPhieuNhap = NEW.MaPhieuNhap;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    IF OLD.TrangThai <> 'DA_DUYET'
       AND NEW.TrangThai = 'DA_DUYET'
       AND OLD.DaCapNhatTonKho = 0 THEN

        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO vMaBienThe, vSoLuong;
            IF done = 1 THEN
                LEAVE read_loop;
            END IF;

            SELECT SoLuongTon
            INTO vTonTruoc
            FROM BienTheSanPham
            WHERE MaBienThe = vMaBienThe
            FOR UPDATE;

            SET vTonSau = vTonTruoc + vSoLuong;

            UPDATE BienTheSanPham
            SET SoLuongTon = vTonSau,
                GiaNhap = (SELECT DonGia FROM ChiTietPhieuNhap
                           WHERE MaPhieuNhap = NEW.MaPhieuNhap
                             AND MaBienThe = vMaBienThe
                           ORDER BY MaChiTietPhieuNhap DESC LIMIT 1)
            WHERE MaBienThe = vMaBienThe;

            INSERT INTO LichSuTonKho
            (MaBienThe, LoaiGiaoDich, SoLuongThayDoi,
             TonTruoc, TonSau, TamGiuTruoc, TamGiuSau,
             MaPhieuNhap, MaNguoiThucHien, LyDo)
            SELECT
                vMaBienThe, 'NHAP_KHO', vSoLuong,
                vTonTruoc, vTonSau, SoLuongTamGiu, SoLuongTamGiu,
                NEW.MaPhieuNhap, NEW.MaNguoiDuyet,
                CONCAT('Duyệt phiếu nhập ', NEW.SoPhieuNhap)
            FROM BienTheSanPham
            WHERE MaBienThe = vMaBienThe;
        END LOOP;
        CLOSE cur;

    END IF;
END$$

DELIMITER ;

-- =========================================================
-- DỮ LIỆU MẪU
-- Lưu ý: mật khẩu mẫu là placeholder, Backend phải thay bằng bcrypt hash.
-- =========================================================

INSERT INTO VaiTro (TenVaiTro, MoTa) VALUES
('ADMIN', 'Quản trị viên hệ thống'),
('NHAN_VIEN', 'Nhân viên quản lý cửa hàng'),
('KHACH_HANG', 'Khách hàng mua quần áo online');

INSERT INTO NguoiDung
(TenDangNhap, MatKhau, HoTen, Email, DienThoai, DiaChi)
VALUES
('admin01', 'CHANGE_ME_HASH', 'Quản trị viên',
 'admin@cuahangquanao.vn', '0900000001', 'Hà Nội'),
('nhanvien01', 'CHANGE_ME_HASH', 'Nguyễn Văn Nhân',
 'nhanvien@cuahangquanao.vn', '0900000002', 'Hà Nội'),
('khach01', 'CHANGE_ME_HASH', 'Nguyễn Văn An',
 'khach01@gmail.com', '0900000003', 'Hà Nội');

INSERT INTO NguoiDungVaiTro (MaNguoiDung, MaVaiTro) VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO DanhMuc (TenDanhMuc, MoTa) VALUES
('Áo', 'Áo nam, áo nữ, áo unisex'),
('Quần', 'Quần jeans, quần kaki, quần short'),
('Váy', 'Váy công sở, váy thời trang'),
('Áo khoác', 'Áo khoác thời trang các loại'),
('Phụ kiện', 'Mũ, túi, thắt lưng và phụ kiện thời trang');

INSERT INTO ThuongHieu (TenThuongHieu, MoTa) VALUES
('Local Brand Việt', 'Thương hiệu thời trang Việt Nam'),
('Urban Style', 'Thời trang phong cách trẻ'),
('Basic Wear', 'Thời trang cơ bản');

INSERT INTO MauSac (TenMau, MaMauHex) VALUES
('Đen', '#000000'),
('Trắng', '#FFFFFF'),
('Xanh Navy', '#000080'),
('Be', '#F5F5DC'),
('Đỏ', '#FF0000');

INSERT INTO KichThuoc (TenKichThuoc, MoTa) VALUES
('S', 'Size nhỏ'),
('M', 'Size trung bình'),
('L', 'Size lớn'),
('XL', 'Size rất lớn'),
('XXL', 'Size đặc biệt');

INSERT INTO SanPham
(MaDanhMuc, MaThuongHieu, MaSanPhamCode, TenSanPham, GiaBan, GiaNhap,
 MoTa, MoTaChiTiet, ChatLieu, GioiTinh, TrangThai, NoiBat)
VALUES
(1, 1, 'AO-TS-001', 'Áo thun Basic Cotton',
 199000, 110000,
 'Áo thun cotton form regular, phù hợp mặc hàng ngày.',
 'Áo thun chất liệu cotton mềm, thoáng mát, dễ phối đồ. Sản phẩm phù hợp đi học, đi làm và đi chơi.',
 'Cotton', 'UNISEX', 'DANG_BAN', 1),

(2, 2, 'QN-JEANS-001', 'Quần Jeans Slim Fit',
 399000, 230000,
 'Quần jeans dáng slim trẻ trung.',
 'Quần jeans denim co giãn nhẹ, đường may chắc chắn, phù hợp phong cách năng động.',
 'Denim', 'UNISEX', 'DANG_BAN', 1),

(3, 1, 'VAY-001', 'Váy nữ công sở thanh lịch',
 459000, 270000,
 'Váy công sở thiết kế thanh lịch.',
 'Thiết kế đơn giản, dễ mặc, phù hợp môi trường công sở và các buổi gặp mặt.',
 'Polyester', 'NU', 'DANG_BAN', 1),

(4, 3, 'AK-001', 'Áo khoác bomber unisex',
 549000, 320000,
 'Áo khoác bomber phong cách trẻ.',
 'Áo khoác bomber chất liệu nhẹ, giữ form tốt và dễ phối với nhiều loại trang phục.',
 'Polyester', 'UNISEX', 'DANG_BAN', 0);

INSERT INTO BienTheSanPham
(MaSanPham, MaMauSac, MaKichThuoc, SKU, GiaBan, GiaNhap, SoLuongTon)
VALUES
(1, 1, 1, 'AO-TS-001-DEN-S', 199000, 110000, 30),
(1, 1, 2, 'AO-TS-001-DEN-M', 199000, 110000, 40),
(1, 2, 2, 'AO-TS-001-TRANG-M', 199000, 110000, 35),
(1, 2, 3, 'AO-TS-001-TRANG-L', 199000, 110000, 25),

(2, 1, 2, 'QN-JEANS-001-DEN-M', 399000, 230000, 15),
(2, 1, 3, 'QN-JEANS-001-DEN-L', 399000, 230000, 20),
(2, 3, 4, 'QN-JEANS-001-NAVY-XL', 399000, 230000, 10),

(3, 4, 2, 'VAY-001-BE-M', 459000, 270000, 12),
(3, 4, 3, 'VAY-001-BE-L', 459000, 270000, 10),

(4, 1, 3, 'AK-001-DEN-L', 549000, 320000, 8),
(4, 3, 4, 'AK-001-NAVY-XL', 549000, 320000, 7);

INSERT INTO HinhAnhSanPham
(MaSanPham, DuongDanAnh, MoTa, LaAnhChinh, ThuTu)
VALUES
(1, 'uploads/products/ao-thun-basic-1.jpg', 'Ảnh chính áo thun', 1, 1),
(1, 'uploads/products/ao-thun-basic-2.jpg', 'Ảnh mặt sau áo thun', 0, 2),
(1, 'uploads/products/ao-thun-basic-3.jpg', 'Ảnh chi tiết chất liệu', 0, 3),

(2, 'uploads/products/quan-jeans-1.jpg', 'Ảnh chính quần jeans', 1, 1),
(2, 'uploads/products/quan-jeans-2.jpg', 'Ảnh phối đồ', 0, 2),

(3, 'uploads/products/vay-cong-so-1.jpg', 'Ảnh chính váy', 1, 1),
(3, 'uploads/products/vay-cong-so-2.jpg', 'Ảnh chi tiết', 0, 2),

(4, 'uploads/products/ao-khoac-bomber-1.jpg', 'Ảnh chính áo khoác', 1, 1);

INSERT INTO MaGiamGia
(MaCode, TenMaGiamGia, MoTa, LoaiGiam, GiaTriGiam, DonToiThieu, TongSoLuong, SoLanSuDungMoiNguoi, NgayBatDau, NgayKetThuc)
VALUES
('KHAITRUONG10', 'Voucher khai trương', 'Giảm 10% cho đơn từ 300.000 đồng', 'PHAN_TRAM', 10, 300000, 1000, 1, '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
('SALE50K', 'Voucher giảm 50.000 đồng', 'Giảm 50.000 đồng cho đơn từ 500.000 đồng', 'SO_TIEN', 50000, 500000, 500, 1, '2026-01-01 00:00:00', '2026-12-31 23:59:59');

INSERT INTO ChuongTrinhGiamGia
(TenChuongTrinh, MoTa, LoaiGiam, GiaTriGiam, NgayBatDau, NgayKetThuc)
VALUES
('Flash Sale Áo thun', 'Giảm trực tiếp 15% cho áo thun', 'PHAN_TRAM', 15, '2026-01-01 00:00:00', '2026-12-31 23:59:59'),
('Flash Sale Quần Jeans', 'Giảm trực tiếp 50000 đồng', 'SO_TIEN', 50000, '2026-01-01 00:00:00', '2026-12-31 23:59:59');

INSERT INTO SanPhamChuongTrinhGiamGia (MaSanPham, MaChuongTrinh) VALUES
(1, 1),
(2, 2);

INSERT INTO NhaCungCap
(TenNhaCungCap, NguoiLienHe, SoDienThoai, Email, DiaChi)
VALUES
('Công ty Dệt May Việt', 'Nguyễn Văn B', '0911111111',
 'detmayviet@gmail.com', 'Hà Nội'),
('Xưởng Thời Trang ABC', 'Trần Văn C', '0922222222',
 'abc@thoitrang.vn', 'Hưng Yên');

INSERT INTO GioHang (MaNguoiDung) VALUES (3);

INSERT INTO DiaChiGiaoHang
(MaNguoiDung, TenNguoiNhan, SoDienThoai, DiaChiChiTiet,
 PhuongXa, QuanHuyen, TinhThanh, LaMacDinh)
VALUES
(3, 'Nguyễn Văn An', '0900000003', 'Số 10 đường ABC',
 'Phường XYZ', 'Quận Cầu Giấy', 'Hà Nội', 1);

INSERT INTO LienHe
(MaNguoiDung, HoTen, Email, SoDienThoai, ChuDe, NoiDung)
VALUES
(3, 'Nguyễn Văn An', 'khach01@gmail.com', '0900000003',
 'Hỏi về size sản phẩm',
 'Tôi muốn hỏi áo thun Basic Cotton có size XL hay không.');

SET FOREIGN_KEY_CHECKS = 1;

-- Kiểm tra
SELECT 'DATABASE CuaHangQuanAoOnline CREATED SUCCESSFULLY' AS KetQua;
SHOW TABLES;
