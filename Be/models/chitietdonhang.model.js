const Chitietdonhang = {};

const db = require('../common/db');

Chitietdonhang.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `chitietdonhang`');
    return rows;
};

Chitietdonhang.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `chitietdonhang` WHERE `MaChiTietDonHang` = ?', [id]);
    return rows[0] || null;
};

Chitietdonhang.create = async (data) => {
    const [result] = await db.query('INSERT INTO `chitietdonhang` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Chitietdonhang.update = async (id, data) => {
    const [result] = await db.query('UPDATE `chitietdonhang` SET ? WHERE `MaChiTietDonHang` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Chitietdonhang.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `chitietdonhang` WHERE `MaChiTietDonHang` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Chitietdonhang.search = async (keyword) => {
    const sql = 'SELECT * FROM `chitietdonhang` WHERE `TenSanPham` LIKE ? OR `SKU` LIKE ? OR `MauSac` LIKE ? OR `KichThuoc` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Chitietdonhang;
