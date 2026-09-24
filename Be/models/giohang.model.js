const Giohang = {};

const db = require('../common/db');

Giohang.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `giohang`');
    return rows;
};

Giohang.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `giohang` WHERE `MaGioHang` = ?', [id]);
    return rows[0] || null;
};

Giohang.create = async (data) => {
    const [result] = await db.query('INSERT INTO `giohang` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Giohang.update = async (id, data) => {
    const [result] = await db.query('UPDATE `giohang` SET ? WHERE `MaGioHang` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Giohang.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `giohang` WHERE `MaGioHang` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

module.exports = Giohang;
