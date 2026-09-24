const Bienthesanpham = {};

const db = require('../common/db');

Bienthesanpham.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `bienthesanpham`');
    return rows;
};

Bienthesanpham.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `bienthesanpham` WHERE `MaBienThe` = ?', [id]);
    return rows[0] || null;
};

Bienthesanpham.create = async (data) => {
    const [result] = await db.query('INSERT INTO `bienthesanpham` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Bienthesanpham.update = async (id, data) => {
    const [result] = await db.query('UPDATE `bienthesanpham` SET ? WHERE `MaBienThe` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Bienthesanpham.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `bienthesanpham` WHERE `MaBienThe` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Bienthesanpham.search = async (keyword) => {
    const sql = 'SELECT * FROM `bienthesanpham` WHERE `SKU` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Bienthesanpham;
