DROP TRIGGER IF EXISTS trg_PhieuNhap_DuyetCongTon;

DELIMITER $$

CREATE TRIGGER trg_PhieuNhap_DuyetCongTon
AFTER UPDATE ON PhieuNhap
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE vMaBienThe INT UNSIGNED;
    DECLARE vSoLuong INT UNSIGNED;
    DECLARE vDonGiaNhap DECIMAL(15,2);
    DECLARE vTonTruoc INT UNSIGNED;
    DECLARE vTonSau INT UNSIGNED;
    DECLARE vGiaNhapCu DECIMAL(15,2);
    DECLARE vGiaNhapMoi DECIMAL(15,2);

    DECLARE cur CURSOR FOR
        SELECT MaBienThe, SUM(SoLuong),
               SUM(SoLuong * DonGia) / NULLIF(SUM(SoLuong), 0)
        FROM ChiTietPhieuNhap
        WHERE MaPhieuNhap = NEW.MaPhieuNhap
        GROUP BY MaBienThe;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    IF OLD.TrangThai <> 'DA_DUYET'
       AND NEW.TrangThai = 'DA_DUYET'
       AND OLD.DaCapNhatTonKho = 0 THEN

        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO vMaBienThe, vSoLuong, vDonGiaNhap;
            IF done = 1 THEN
                LEAVE read_loop;
            END IF;

            SELECT SoLuongTon, GiaNhap
            INTO vTonTruoc, vGiaNhapCu
            FROM BienTheSanPham
            WHERE MaBienThe = vMaBienThe
            FOR UPDATE;

            SET vTonSau = vTonTruoc + vSoLuong;
            SET vGiaNhapMoi = ROUND(
                ((vTonTruoc * vGiaNhapCu) + (vSoLuong * vDonGiaNhap)) / vTonSau,
                2
            );

            UPDATE BienTheSanPham
            SET SoLuongTon = vTonSau,
                GiaNhap = vGiaNhapMoi
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
