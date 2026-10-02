ALTER TABLE ThanhToan
    MODIFY TrangThai ENUM('CHO_XU_LY','THANH_CONG','THAT_BAI','HOAN_TIEN','DA_HUY') NOT NULL DEFAULT 'CHO_XU_LY',
    ADD COLUMN MaYeuCauThanhToan VARCHAR(100) NULL,
    ADD COLUMN UrlThanhToan TEXT NULL,
    ADD UNIQUE KEY UQ_ThanhToan_MaYeuCau (MaYeuCauThanhToan);

ALTER TABLE DonHang
    ADD COLUMN VoucherDaHoanLai TINYINT(1) NOT NULL DEFAULT 0 AFTER MaGiamGia;

CREATE TABLE YeuCauHoanTien (
    MaHoanTien INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaThanhToan INT UNSIGNED NOT NULL,
    MaDonHang INT UNSIGNED NOT NULL,
    MaYeuCau VARCHAR(100) NOT NULL,
    MaGiaoDich VARCHAR(100),
    PhuongThuc ENUM('MOMO','THU_TAY') NOT NULL,
    SoTien DECIMAL(15,2) NOT NULL,
    TrangThai ENUM('CHO_XU_LY','THANH_CONG','THAT_BAI') NOT NULL DEFAULT 'CHO_XU_LY',
    LyDo VARCHAR(500),
    MaNguoiXuLy INT UNSIGNED,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_YeuCauHoanTien_ThanhToan FOREIGN KEY (MaThanhToan)
        REFERENCES ThanhToan(MaThanhToan) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_YeuCauHoanTien_DonHang FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_YeuCauHoanTien_NguoiXuLy FOREIGN KEY (MaNguoiXuLy)
        REFERENCES NguoiDung(MaNguoiDung) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CK_YeuCauHoanTien_SoTien CHECK (SoTien > 0),
    UNIQUE KEY UQ_YeuCauHoanTien_MaYeuCau (MaYeuCau),
    INDEX IX_YeuCauHoanTien_DonHang (MaDonHang),
    INDEX IX_YeuCauHoanTien_TrangThai (TrangThai)
) ENGINE=InnoDB;

INSERT IGNORE INTO HoaDon(MaDonHang,MaNguoiLap,SoHoaDon,TongTien,GhiChu)
SELECT MaDonHang,NULL,CONCAT('HD',MaDonHang),ThanhTien,'Tạo bù hóa đơn cho đơn đã giao.'
FROM DonHang
WHERE TrangThaiDonHang='DA_GIAO';

DELIMITER $$

CREATE TRIGGER trg_DonHang_TaoHoaDonSauGiao
AFTER UPDATE ON DonHang
FOR EACH ROW
BEGIN
    IF OLD.TrangThaiDonHang <> 'DA_GIAO' AND NEW.TrangThaiDonHang = 'DA_GIAO' THEN
        INSERT IGNORE INTO HoaDon(MaDonHang,MaNguoiLap,SoHoaDon,TongTien,GhiChu)
        VALUES(NEW.MaDonHang,NULL,CONCAT('HD',NEW.MaDonHang),NEW.ThanhTien,'Tạo tự động khi xác nhận giao thành công.');
    END IF;
END$$

DELIMITER ;