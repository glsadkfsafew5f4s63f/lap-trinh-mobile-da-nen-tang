const Danhgia = {};

const db = require('../common/db');

Danhgia.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `danhgia`');
    return rows;
};

Danhgia.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `danhgia` WHERE `MaDanhGia` = ?', [id]);
    return rows[0] || null;
};

Danhgia.create = async (data) => {
    const [result] = await db.query('INSERT INTO `danhgia` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Danhgia.update = async (id, data) => {
    const [result] = await db.query('UPDATE `danhgia` SET ? WHERE `MaDanhGia` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Danhgia.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `danhgia` WHERE `MaDanhGia` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Danhgia.search = async (keyword) => {
    const sql = 'SELECT * FROM `danhgia` WHERE `NoiDung` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Danhgia;
