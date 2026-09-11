-- =========================================================
--  DATABASE: AppBanQuanAo
--  ĐỀ TÀI: Ứng dụng bán quần áo
--  Công nghệ: MySQL + Node.js + React Native + Expo
-- =========================================================


-- =========================================================
-- 1. XÓA DATABASE CŨ VÀ TẠO DATABASE MỚI
-- =========================================================

DROP DATABASE IF EXISTS AppBanQuanAo;

CREATE DATABASE AppBanQuanAo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE AppBanQuanAo;


-- =========================================================
-- 2. BẢNG VAI TRÒ
-- =========================================================

CREATE TABLE VaiTro (
    MaVaiTro INT AUTO_INCREMENT PRIMARY KEY,
    TenVaiTro VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;


-- =========================================================
-- 3. BẢNG NGƯỜI DÙNG
-- =========================================================

CREATE TABLE NguoiDung (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    MaVaiTro INT NOT NULL,
    HoTen VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    SoDienThoai VARCHAR(15),
    MatKhau VARCHAR(255) NOT NULL,
    AnhDaiDien VARCHAR(255),
    TrangThai TINYINT(1) DEFAULT 1,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_NguoiDung_VaiTro
        FOREIGN KEY (MaVaiTro)
        REFERENCES VaiTro(MaVaiTro)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- =========================================================
-- 4. BẢNG ĐỊA CHỈ
-- =========================================================

CREATE TABLE DiaChi (
    MaDiaChi INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    HoTenNguoiNhan VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(15) NOT NULL,
    TinhThanh VARCHAR(100) NOT NULL,
    QuanHuyen VARCHAR(100) NOT NULL,
    PhuongXa VARCHAR(100),
    DiaChiChiTiet VARCHAR(255) NOT NULL,
    MacDinh TINYINT(1) DEFAULT 0,

    CONSTRAINT FK_DiaChi_NguoiDung
        FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =========================================================
-- 5. BẢNG DANH MỤC
-- =========================================================

CREATE TABLE DanhMuc (
    MaDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDanhMuc VARCHAR(100) NOT NULL UNIQUE,
    MoTa VARCHAR(255),
    HinhAnh VARCHAR(255),
    TrangThai TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;


-- =========================================================
-- 6. BẢNG THƯƠNG HIỆU
-- =========================================================

CREATE TABLE ThuongHieu (
    MaThuongHieu INT AUTO_INCREMENT PRIMARY KEY,
    TenThuongHieu VARCHAR(100) NOT NULL UNIQUE,
    MoTa VARCHAR(255),
    Logo VARCHAR(255),
    TrangThai TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;


-- =========================================================
-- 7. BẢNG SẢN PHẨM
-- =========================================================

CREATE TABLE SanPham (
    MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
    MaDanhMuc INT NOT NULL,
    MaThuongHieu INT,
    TenSanPham VARCHAR(150) NOT NULL,
    MoTa TEXT,
    Gia DECIMAL(12,2) NOT NULL,
    GiaCu DECIMAL(12,2),
    SanPhamMoi TINYINT(1) DEFAULT 0,
    NoiBat TINYINT(1) DEFAULT 0,
    TrangThai TINYINT(1) DEFAULT 1,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_SanPham_DanhMuc
        FOREIGN KEY (MaDanhMuc)
        REFERENCES DanhMuc(MaDanhMuc)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_SanPham_ThuongHieu
        FOREIGN KEY (MaThuongHieu)
        REFERENCES ThuongHieu(MaThuongHieu)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT CK_SanPham_Gia
        CHECK (Gia >= 0),

    CONSTRAINT CK_SanPham_GiaCu
        CHECK (GiaCu IS NULL OR GiaCu >= Gia)
) ENGINE=InnoDB;


-- =========================================================
-- 8. BẢNG MÀU SẮC
-- =========================================================

CREATE TABLE MauSac (
    MaMau INT AUTO_INCREMENT PRIMARY KEY,
    TenMau VARCHAR(50) NOT NULL UNIQUE,
    MaHex VARCHAR(10)
) ENGINE=InnoDB;


-- =========================================================
-- 9. BẢNG KÍCH THƯỚC
-- =========================================================

CREATE TABLE KichThuoc (
    MaKichThuoc INT AUTO_INCREMENT PRIMARY KEY,
    TenKichThuoc VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;


-- =========================================================
-- 10. BẢNG BIẾN THỂ SẢN PHẨM
-- =========================================================

CREATE TABLE BienTheSanPham (
    MaBienThe INT AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT NOT NULL,
    MaMau INT NOT NULL,
    MaKichThuoc INT NOT NULL,
    MaSKU VARCHAR(50) NOT NULL UNIQUE,
    GiaBan DECIMAL(12,2),
    SoLuongTon INT NOT NULL DEFAULT 0,

    CONSTRAINT FK_BienThe_SanPham
        FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_BienThe_MauSac
        FOREIGN KEY (MaMau)
        REFERENCES MauSac(MaMau)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_BienThe_KichThuoc
        FOREIGN KEY (MaKichThuoc)
        REFERENCES KichThuoc(MaKichThuoc)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT UQ_BienThe_SanPham_Mau_Size
        UNIQUE (MaSanPham, MaMau, MaKichThuoc),

    CONSTRAINT CK_BienThe_SoLuong
        CHECK (SoLuongTon >= 0),

    CONSTRAINT CK_BienThe_Gia
        CHECK (GiaBan IS NULL OR GiaBan >= 0)
) ENGINE=InnoDB;


-- =========================================================
-- 11. BẢNG HÌNH ẢNH SẢN PHẨM
-- =========================================================

CREATE TABLE HinhAnhSanPham (
    MaHinhAnh INT AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT NOT NULL,
    DuongDanAnh VARCHAR(500) NOT NULL,
    AnhChinh TINYINT(1) DEFAULT 0,
    ThuTu INT DEFAULT 1,

    CONSTRAINT FK_HinhAnh_SanPham
        FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =========================================================
-- 12. BẢNG GIỎ HÀNG
-- =========================================================

CREATE TABLE GioHang (
    MaGioHang INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL UNIQUE,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT FK_GioHang_NguoiDung
        FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- =========================================================
-- 13. BẢNG CHI TIẾT GIỎ HÀNG
-- =========================================================

CREATE TABLE ChiTietGioHang (
    MaChiTietGioHang INT AUTO_INCREMENT PRIMARY KEY,
    MaGioHang INT NOT NULL,
    MaBienThe INT NOT NULL,
    SoLuong INT NOT NULL DEFAULT 1,

    CONSTRAINT FK_CT_GioHang_GioHang
        FOREIGN KEY (MaGioHang)
        REFERENCES GioHang(MaGioHang)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_CT_GioHang_BienThe
        FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT UQ_CT_GioHang_BienThe
        UNIQUE (MaGioHang, MaBienThe),

    CONSTRAINT CK_CT_GioHang_SoLuong
        CHECK (SoLuong > 0)
) ENGINE=InnoDB;


-- =========================================================
-- 14. BẢNG ĐƠN HÀNG
-- =========================================================

CREATE TABLE DonHang (
    MaDonHang INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaDiaChi INT,

    HoTenNguoiNhan VARCHAR(100) NOT NULL,
    SoDienThoaiNguoiNhan VARCHAR(15) NOT NULL,

    TinhThanh VARCHAR(100),
    QuanHuyen VARCHAR(100),
    PhuongXa VARCHAR(100),
    DiaChiGiaoHang VARCHAR(255) NOT NULL,

    TongTien DECIMAL(12,2) NOT NULL DEFAULT 0,
    PhiVanChuyen DECIMAL(12,2) NOT NULL DEFAULT 0,

    PhuongThucThanhToan VARCHAR(50)
        DEFAULT 'COD',

    TrangThai ENUM(
        'ChoXacNhan',
        'DaXacNhan',
        'DangGiao',
        'DaGiao',
        'DaHuy'
    ) DEFAULT 'ChoXacNhan',

    GhiChu VARCHAR(255),

    NgayDat DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_DonHang_NguoiDung
        FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_DonHang_DiaChi
        FOREIGN KEY (MaDiaChi)
        REFERENCES DiaChi(MaDiaChi)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT CK_DonHang_TongTien
        CHECK (TongTien >= 0),

    CONSTRAINT CK_DonHang_PhiVanChuyen
        CHECK (PhiVanChuyen >= 0)
) ENGINE=InnoDB;


-- =========================================================
-- 15. BẢNG CHI TIẾT ĐƠN HÀNG
-- =========================================================

CREATE TABLE ChiTietDonHang (
    MaChiTietDonHang INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL,
    MaBienThe INT NOT NULL,

    TenSanPham VARCHAR(150) NOT NULL,
    Mau VARCHAR(50),
    KichThuoc VARCHAR(20),

    SoLuong INT NOT NULL,
    DonGia DECIMAL(12,2) NOT NULL,

    ThanhTien DECIMAL(12,2)
        GENERATED ALWAYS AS (SoLuong * DonGia) STORED,

    CONSTRAINT FK_CT_DonHang_DonHang
        FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_CT_DonHang_BienThe
        FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT CK_CT_DonHang_SoLuong
        CHECK (SoLuong > 0),

    CONSTRAINT CK_CT_DonHang_DonGia
        CHECK (DonGia >= 0)
) ENGINE=InnoDB;


-- =========================================================
-- 16. BẢNG YÊU THÍCH
-- =========================================================

CREATE TABLE YeuThich (
    MaYeuThich INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaSanPham INT NOT NULL,
    NgayThem DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_YeuThich_NguoiDung
        FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_YeuThich_SanPham
        FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT UQ_YeuThich
        UNIQUE (MaNguoiDung, MaSanPham)
) ENGINE=InnoDB;


-- =========================================================
-- 17. BẢNG ĐÁNH GIÁ
-- =========================================================

CREATE TABLE DanhGia (
    MaDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaSanPham INT NOT NULL,
    MaDonHang INT,

    SoSao INT NOT NULL,
    NoiDung TEXT,

    NgayDanhGia DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_DanhGia_NguoiDung
        FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_DanhGia_SanPham
        FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_DanhGia_DonHang
        FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT CK_DanhGia_SoSao
        CHECK (SoSao BETWEEN 1 AND 5)
) ENGINE=InnoDB;


-- =========================================================
-- DỮ LIỆU MẪU
-- =========================================================


-- =========================================================
-- 18. VAI TRÒ
-- =========================================================

INSERT INTO VaiTro (TenVaiTro) VALUES
('Admin'),
('KhachHang');


-- =========================================================
-- 19. NGƯỜI DÙNG
-- =========================================================

INSERT INTO NguoiDung
(
    MaVaiTro,
    HoTen,
    Email,
    SoDienThoai,
    MatKhau,
    TrangThai
)
VALUES
(
    1,
    'Quản trị viên',
    'admin@gmail.com',
    '0900000000',
    '123456',
    1
),
(
    2,
    'Nguyễn Văn An',
    'an@gmail.com',
    '0912345678',
    '123456',
    1
),
(
    2,
    'Trần Văn Bình',
    'binh@gmail.com',
    '0923456789',
    '123456',
    1
);


-- =========================================================
-- 20. DANH MỤC
-- =========================================================

INSERT INTO DanhMuc
(
    TenDanhMuc,
    MoTa,
    HinhAnh
)
VALUES
(
    'Áo',
    'Các loại áo thời trang nam nữ',
    'images/categories/ao.jpg'
),
(
    'Quần',
    'Các loại quần thời trang',
    'images/categories/quan.jpg'
),
(
    'Áo khoác',
    'Các loại áo khoác thời trang',
    'images/categories/aokhoac.jpg'
),
(
    'Váy',
    'Các loại váy thời trang nữ',
    'images/categories/vay.jpg'
),
(
    'Giày',
    'Các loại giày thời trang',
    'images/categories/giay.jpg'
),
(
    'Phụ kiện',
    'Các loại phụ kiện thời trang',
    'images/categories/phukien.jpg'
);


-- =========================================================
-- 21. THƯƠNG HIỆU
-- =========================================================

INSERT INTO ThuongHieu
(
    TenThuongHieu,
    MoTa,
    Logo
)
VALUES
(
    'FASHION',
    'Thương hiệu thời trang hiện đại',
    'images/brands/fashion.png'
),
(
    'YOUNG STYLE',
    'Thời trang dành cho giới trẻ',
    'images/brands/youngstyle.png'
),
(
    'URBAN WEAR',
    'Phong cách thời trang đường phố',
    'images/brands/urbanwear.png'
);


-- =========================================================
-- 22. MÀU SẮC
-- =========================================================

INSERT INTO MauSac
(
    TenMau,
    MaHex
)
VALUES
('Đen', '#000000'),
('Trắng', '#FFFFFF'),
('Xanh', '#0000FF'),
('Đỏ', '#FF0000'),
('Xám', '#808080'),
('Be', '#F5F5DC');


-- =========================================================
-- 23. KÍCH THƯỚC
-- =========================================================

INSERT INTO KichThuoc (TenKichThuoc) VALUES
('S'),
('M'),
('L'),
('XL'),
('XXL');


-- =========================================================
-- 24. SẢN PHẨM
-- =========================================================

INSERT INTO SanPham
(
    MaDanhMuc,
    MaThuongHieu,
    TenSanPham,
    MoTa,
    Gia,
    GiaCu,
    SanPhamMoi,
    NoiBat
)
VALUES

(
    1,
    1,
    'Áo Polo Nam Basic',
    'Áo polo nam phong cách đơn giản, chất liệu cotton mềm mại, phù hợp đi học và đi chơi.',
    199000,
    249000,
    1,
    1
),

(
    1,
    2,
    'Áo Thun Nam Oversize',
    'Áo thun oversize phong cách trẻ trung, phù hợp với phong cách thời trang hiện đại.',
    149000,
    199000,
    1,
    1
),

(
    1,
    3,
    'Áo Sơ Mi Nam Công Sở',
    'Áo sơ mi nam thiết kế thanh lịch, phù hợp đi học và đi làm.',
    259000,
    299000,
    0,
    1
),

(
    2,
    1,
    'Quần Jean Nam Classic',
    'Quần jean nam kiểu dáng hiện đại, dễ phối với nhiều loại áo.',
    299000,
    349000,
    0,
    1
),

(
    2,
    3,
    'Quần Jogger Nam',
    'Quần jogger nam thoải mái, phù hợp mặc hàng ngày.',
    249000,
    299000,
    1,
    0
),

(
    3,
    2,
    'Áo Khoác Bomber',
    'Áo khoác bomber phong cách trẻ trung, thích hợp thời tiết se lạnh.',
    399000,
    499000,
    1,
    1
),

(
    3,
    3,
    'Áo Khoác Hoodie',
    'Hoodie nam nữ phong cách năng động, chất liệu nỉ mềm.',
    349000,
    399000,
    1,
    1
),

(
    4,
    1,
    'Váy Nữ Thanh Lịch',
    'Váy nữ thiết kế thanh lịch, phù hợp đi chơi và dự tiệc.',
    329000,
    399000,
    1,
    0
),

(
    5,
    2,
    'Giày Sneaker Basic',
    'Giày sneaker phong cách đơn giản, dễ phối đồ.',
    499000,
    599000,
    1,
    1
),

(
    6,
    1,
    'Túi Đeo Chéo Mini',
    'Túi đeo chéo nhỏ gọn, phù hợp đi chơi và đi học.',
    159000,
    199000,
    0,
    0
);


-- =========================================================
-- 25. BIẾN THỂ SẢN PHẨM
-- =========================================================

-- ÁO POLO
INSERT INTO BienTheSanPham
(
    MaSanPham,
    MaMau,
    MaKichThuoc,
    MaSKU,
    GiaBan,
    SoLuongTon
)
VALUES
(1, 1, 1, 'POLO-DEN-S', 199000, 10),
(1, 1, 2, 'POLO-DEN-M', 199000, 15),
(1, 1, 3, 'POLO-DEN-L', 199000, 12),
(1, 2, 2, 'POLO-TRANG-M', 199000, 10),
(1, 2, 3, 'POLO-TRANG-L', 199000, 8),
(1, 3, 3, 'POLO-XANH-L', 199000, 8);

-- ÁO THUN
INSERT INTO BienTheSanPham
VALUES
(NULL, 2, 1, 1, 'TSHIRT-DEN-S', 149000, 15),
(NULL, 2, 1, 2, 'TSHIRT-DEN-M', 149000, 20),
(NULL, 2, 1, 3, 'TSHIRT-DEN-L', 149000, 15),
(NULL, 2, 2, 2, 'TSHIRT-TRANG-M', 149000, 10),
(NULL, 2, 2, 3, 'TSHIRT-TRANG-L', 149000, 10);

-- ÁO SƠ MI
INSERT INTO BienTheSanPham
VALUES
(NULL, 3, 2, 2, 'SHIRT-TRANG-M', 259000, 10),
(NULL, 3, 2, 3, 'SHIRT-TRANG-L', 259000, 10),
(NULL, 3, 1, 3, 'SHIRT-DEN-L', 259000, 7);

-- QUẦN JEAN
INSERT INTO BienTheSanPham
VALUES
(NULL, 4, 1, 2, 'JEAN-DEN-M', 299000, 10),
(NULL, 4, 1, 3, 'JEAN-DEN-L', 299000, 12),
(NULL, 4, 3, 4, 'JEAN-XANH-XL', 299000, 8);

-- QUẦN JOGGER
INSERT INTO BienTheSanPham
VALUES
(NULL, 5, 1, 2, 'JOGGER-DEN-M', 249000, 10),
(NULL, 5, 1, 3, 'JOGGER-DEN-L', 249000, 10),
(NULL, 5, 5, 3, 'JOGGER-XAM-L', 249000, 7);

-- BOMBER
INSERT INTO BienTheSanPham
VALUES
(NULL, 6, 1, 2, 'BOMBER-DEN-M', 399000, 8),
(NULL, 6, 1, 3, 'BOMBER-DEN-L', 399000, 10),
(NULL, 6, 3, 3, 'BOMBER-XANH-L', 399000, 6);

-- HOODIE
INSERT INTO BienTheSanPham
VALUES
(NULL, 7, 1, 2, 'HOODIE-DEN-M', 349000, 10),
(NULL, 7, 1, 3, 'HOODIE-DEN-L', 349000, 12),
(NULL, 7, 5, 3, 'HOODIE-XAM-L', 349000, 8);

-- VÁY
INSERT INTO BienTheSanPham
VALUES
(NULL, 8, 2, 1, 'VAY-TRANG-S', 329000, 10),
(NULL, 8, 2, 2, 'VAY-TRANG-M', 329000, 12),
(NULL, 8, 4, 2, 'VAY-DO-M', 329000, 8);

-- GIÀY
INSERT INTO BienTheSanPham
VALUES
(NULL, 9, 1, 3, 'GIAY-DEN-L', 499000, 10),
(NULL, 9, 2, 3, 'GIAY-TRANG-L', 499000, 8);

-- TÚI
INSERT INTO BienTheSanPham
VALUES
(NULL, 10, 1, 1, 'TUI-DEN-S', 159000, 15),
(NULL, 10, 6, 1, 'TUI-BE-S', 159000, 10);


-- =========================================================
-- 26. HÌNH ẢNH SẢN PHẨM
-- =========================================================

INSERT INTO HinhAnhSanPham
(
    MaSanPham,
    DuongDanAnh,
    AnhChinh,
    ThuTu
)
VALUES

-- Áo Polo
(1, 'images/products/polo1.jpg', 1, 1),
(1, 'images/products/polo2.jpg', 0, 2),
(1, 'images/products/polo3.jpg', 0, 3),

-- Áo thun
(2, 'images/products/tshirt1.jpg', 1, 1),
(2, 'images/products/tshirt2.jpg', 0, 2),

-- Sơ mi
(3, 'images/products/shirt1.jpg', 1, 1),
(3, 'images/products/shirt2.jpg', 0, 2),

-- Jean
(4, 'images/products/jean1.jpg', 1, 1),
(4, 'images/products/jean2.jpg', 0, 2),

-- Jogger
(5, 'images/products/jogger1.jpg', 1, 1),
(5, 'images/products/jogger2.jpg', 0, 2),

-- Bomber
(6, 'images/products/bomber1.jpg', 1, 1),
(6, 'images/products/bomber2.jpg', 0, 2),
(6, 'images/products/bomber3.jpg', 0, 3),

-- Hoodie
(7, 'images/products/hoodie1.jpg', 1, 1),
(7, 'images/products/hoodie2.jpg', 0, 2),

-- Váy
(8, 'images/products/vay1.jpg', 1, 1),
(8, 'images/products/vay2.jpg', 0, 2),

-- Giày
(9, 'images/products/giay1.jpg', 1, 1),
(9, 'images/products/giay2.jpg', 0, 2),

-- Túi
(10, 'images/products/tui1.jpg', 1, 1),
(10, 'images/products/tui2.jpg', 0, 2);


-- =========================================================
-- 27. GIỎ HÀNG
-- =========================================================

INSERT INTO GioHang
(
    MaNguoiDung
)
VALUES
(2),
(3);


-- =========================================================
-- 28. CHI TIẾT GIỎ HÀNG
-- =========================================================

INSERT INTO ChiTietGioHang
(
    MaGioHang,
    MaBienThe,
    SoLuong
)
VALUES
(1, 2, 1),
(1, 9, 1),
(2, 7, 2);


-- =========================================================
-- 29. ĐỊA CHỈ NGƯỜI DÙNG
-- =========================================================

INSERT INTO DiaChi
(
    MaNguoiDung,
    HoTenNguoiNhan,
    SoDienThoai,
    TinhThanh,
    QuanHuyen,
    PhuongXa,
    DiaChiChiTiet,
    MacDinh
)
VALUES
(
    2,
    'Nguyễn Văn An',
    '0912345678',
    'Hải Dương',
    'Thành phố Hải Dương',
    'Phường Thanh Bình',
    'Số 10 đường Nguyễn Lương Bằng',
    1
),
(
    2,
    'Nguyễn Văn An',
    '0912345678',
    'Hưng Yên',
    'Thành phố Hưng Yên',
    'Phường Hiến Nam',
    'Số 20 đường Nguyễn Văn Linh',
    0
),
(
    3,
    'Trần Văn Bình',
    '0923456789',
    'Hà Nội',
    'Cầu Giấy',
    'Dịch Vọng',
    'Số 15 đường Cầu Giấy',
    1
);


-- =========================================================
-- 30. ĐƠN HÀNG MẪU
-- =========================================================

INSERT INTO DonHang
(
    MaNguoiDung,
    MaDiaChi,
    HoTenNguoiNhan,
    SoDienThoaiNguoiNhan,
    TinhThanh,
    QuanHuyen,
    PhuongXa,
    DiaChiGiaoHang,
    TongTien,
    PhiVanChuyen,
    PhuongThucThanhToan,
    TrangThai,
    GhiChu
)
VALUES
(
    2,
    1,
    'Nguyễn Văn An',
    '0912345678',
    'Hải Dương',
    'Thành phố Hải Dương',
    'Phường Thanh Bình',
    'Số 10 đường Nguyễn Lương Bằng',
    398000,
    30000,
    'COD',
    'ChoXacNhan',
    'Giao hàng giờ hành chính'
),
(
    3,
    3,
    'Trần Văn Bình',
    '0923456789',
    'Hà Nội',
    'Cầu Giấy',
    'Dịch Vọng',
    'Số 15 đường Cầu Giấy',
    299000,
    30000,
    'COD',
    'DaXacNhan',
    NULL
);


-- =========================================================
-- 31. CHI TIẾT ĐƠN HÀNG
-- =========================================================

INSERT INTO ChiTietDonHang
(
    MaDonHang,
    MaBienThe,
    TenSanPham,
    Mau,
    KichThuoc,
    SoLuong,
    DonGia
)
VALUES
(
    1,
    2,
    'Áo Polo Nam Basic',
    'Đen',
    'M',
    1,
    199000
),
(
    1,
    9,
    'Áo Thun Nam Oversize',
    'Trắng',
    'M',
    1,
    199000
),
(
    2,
    15,
    'Quần Jean Nam Classic',
    'Đen',
    'M',
    1,
    299000
);


-- =========================================================
-- 32. SẢN PHẨM YÊU THÍCH
-- =========================================================

INSERT INTO YeuThich
(
    MaNguoiDung,
    MaSanPham
)
VALUES
(2, 1),
(2, 5),
(2, 6),
(3, 3),
(3, 9);


-- =========================================================
-- 33. ĐÁNH GIÁ
-- =========================================================

INSERT INTO DanhGia
(
    MaNguoiDung,
    MaSanPham,
    MaDonHang,
    SoSao,
    NoiDung
)
VALUES
(
    2,
    1,
    NULL,
    5,
    'Sản phẩm đẹp, chất lượng tốt, mặc rất vừa.'
),
(
    3,
    4,
    2,
    5,
    'Quần đẹp, đúng mô tả và giao hàng nhanh.'
);


-- =========================================================
-- 34. KIỂM TRA DATABASE
-- =========================================================

SHOW TABLES;


-- =========================================================
-- 35. KIỂM TRA DỮ LIỆU SẢN PHẨM
-- =========================================================

SELECT
    sp.MaSanPham,
    sp.TenSanPham,
    dm.TenDanhMuc,
    th.TenThuongHieu,
    sp.Gia,
    sp.GiaCu,
    sp.SanPhamMoi,
    sp.NoiBat
FROM SanPham sp
JOIN DanhMuc dm
    ON sp.MaDanhMuc = dm.MaDanhMuc
LEFT JOIN ThuongHieu th
    ON sp.MaThuongHieu = th.MaThuongHieu;


-- =========================================================
-- 36. KIỂM TRA BIẾN THỂ SẢN PHẨM
-- =========================================================

SELECT
    sp.TenSanPham,
    ms.TenMau,
    kt.TenKichThuoc,
    bt.MaSKU,
    bt.GiaBan,
    bt.SoLuongTon
FROM BienTheSanPham bt
JOIN SanPham sp
    ON bt.MaSanPham = sp.MaSanPham
JOIN MauSac ms
    ON bt.MaMau = ms.MaMau
JOIN KichThuoc kt
    ON bt.MaKichThuoc = kt.MaKichThuoc
ORDER BY sp.MaSanPham;


-- =========================================================
-- 37. KIỂM TRA ĐƠN HÀNG
-- =========================================================

SELECT
    dh.MaDonHang,
    nd.HoTen,
    dh.TongTien,
    dh.PhiVanChuyen,
    dh.PhuongThucThanhToan,
    dh.TrangThai,
    dh.NgayDat
FROM DonHang dh
JOIN NguoiDung nd
    ON dh.MaNguoiDung = nd.MaNguoiDung
ORDER BY dh.MaDonHang DESC;


-- =========================================================
-- 38. KIỂM TRA ĐÁNH GIÁ
-- =========================================================

SELECT
    dg.MaDanhGia,
    nd.HoTen,
    sp.TenSanPham,
    dg.SoSao,
    dg.NoiDung,
    dg.NgayDanhGia
FROM DanhGia dg
JOIN NguoiDung nd
    ON dg.MaNguoiDung = nd.MaNguoiDung
JOIN SanPham sp
    ON dg.MaSanPham = sp.MaSanPham;