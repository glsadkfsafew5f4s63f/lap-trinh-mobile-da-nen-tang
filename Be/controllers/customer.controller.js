const db = require('../common/db');

exports.list = async (_req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT nd.MaNguoiDung,nd.TenDangNhap,nd.HoTen,nd.Email,nd.DienThoai,nd.TrangThai,nd.NgayTao,
                    GROUP_CONCAT(DISTINCT vt.TenVaiTro ORDER BY vt.TenVaiTro SEPARATOR ', ') roles
             FROM NguoiDung nd
             JOIN NguoiDungVaiTro ndvt ON ndvt.MaNguoiDung=nd.MaNguoiDung
             JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
             WHERE vt.TenVaiTro='KHACH_HANG'
             GROUP BY nd.MaNguoiDung ORDER BY nd.MaNguoiDung DESC`,
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const status = req.body.TrangThai;
    if (!['HOAT_DONG', 'KHOA'].includes(status)) {
        return res.status(400).json({ success: false, message: 'TrangThai không hợp lệ.' });
    }
    try {
        const [result] = await db.query(
            `UPDATE NguoiDung nd SET nd.TrangThai=?
             WHERE nd.MaNguoiDung=? AND EXISTS (
                 SELECT 1 FROM NguoiDungVaiTro ndvt JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
                 WHERE ndvt.MaNguoiDung=nd.MaNguoiDung AND vt.TenVaiTro='KHACH_HANG'
             )`,
            [status, req.params.id],
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
        res.json({ success: true, affectedRows: result.affectedRows });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};