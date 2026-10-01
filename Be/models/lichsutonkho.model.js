const Lichsutonkho = {};

const db = require('../common/db');

Lichsutonkho.getAll = async () => {
    const [rows] = await db.query(`
        SELECT ls.*, bt.SKU, sp.TenSanPham, pn.SoPhieuNhap,
               dh.MaDonHangCode, nd.HoTen AS NguoiThucHien
        FROM LichSuTonKho ls
        LEFT JOIN BienTheSanPham bt ON bt.MaBienThe = ls.MaBienThe
        LEFT JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
        LEFT JOIN PhieuNhap pn ON pn.MaPhieuNhap = ls.MaPhieuNhap
        LEFT JOIN DonHang dh ON dh.MaDonHang = ls.MaDonHang
        LEFT JOIN NguoiDung nd ON nd.MaNguoiDung = ls.MaNguoiThucHien
        ORDER BY ls.NgayTao DESC, ls.MaLichSuTonKho DESC
    `);
    return rows;
};

Lichsutonkho.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `lichsutonkho` WHERE `MaLichSuTonKho` = ?', [id]);
    return rows[0] || null;
};

Lichsutonkho.create = async (data) => {
    const [result] = await db.query('INSERT INTO `lichsutonkho` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Lichsutonkho.update = async (id, data) => {
    const [result] = await db.query('UPDATE `lichsutonkho` SET ? WHERE `MaLichSuTonKho` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Lichsutonkho.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `lichsutonkho` WHERE `MaLichSuTonKho` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Lichsutonkho.search = async (keyword) => {
    const sql = 'SELECT * FROM `lichsutonkho` WHERE `LyDo` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Lichsutonkho;
