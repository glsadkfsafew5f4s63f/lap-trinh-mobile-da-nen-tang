const Chitietgiohang = {};

const db = require('../common/db');

Chitietgiohang.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `chitietgiohang`');
    return rows;
};

Chitietgiohang.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `chitietgiohang` WHERE `MaChiTietGioHang` = ?', [id]);
    return rows[0] || null;
};

Chitietgiohang.create = async (data) => {
    const [result] = await db.query('INSERT INTO `chitietgiohang` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Chitietgiohang.update = async (id, data) => {
    const [result] = await db.query('UPDATE `chitietgiohang` SET ? WHERE `MaChiTietGioHang` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Chitietgiohang.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `chitietgiohang` WHERE `MaChiTietGioHang` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

module.exports = Chitietgiohang;
