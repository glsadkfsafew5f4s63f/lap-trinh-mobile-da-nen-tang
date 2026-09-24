const Donhang = {};

const db = require('../common/db');

Donhang.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `donhang`');
    return rows;
};

Donhang.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `donhang` WHERE `MaDonHang` = ?', [id]);
    return rows[0] || null;
};

Donhang.create = async (data) => {
    const [result] = await db.query('INSERT INTO `donhang` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Donhang.update = async (id, data) => {
    const [result] = await db.query('UPDATE `donhang` SET ? WHERE `MaDonHang` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Donhang.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `donhang` WHERE `MaDonHang` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Donhang.search = async (keyword) => {
    const sql = 'SELECT * FROM `donhang` WHERE `MaDonHangCode` LIKE ? OR `TenNguoiNhan` LIKE ? OR `SoDienThoaiNhan` LIKE ? OR `DiaChiGiaoHang` LIKE ? OR `GhiChu` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Donhang;
