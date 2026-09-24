const Chuongtrinhgiamgia = {};

const db = require('../common/db');

Chuongtrinhgiamgia.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `chuongtrinhgiamgia`');
    return rows;
};

Chuongtrinhgiamgia.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `chuongtrinhgiamgia` WHERE `MaChuongTrinh` = ?', [id]);
    return rows[0] || null;
};

Chuongtrinhgiamgia.create = async (data) => {
    const [result] = await db.query('INSERT INTO `chuongtrinhgiamgia` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Chuongtrinhgiamgia.update = async (id, data) => {
    const [result] = await db.query('UPDATE `chuongtrinhgiamgia` SET ? WHERE `MaChuongTrinh` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Chuongtrinhgiamgia.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `chuongtrinhgiamgia` WHERE `MaChuongTrinh` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Chuongtrinhgiamgia.search = async (keyword) => {
    const sql = 'SELECT * FROM `chuongtrinhgiamgia` WHERE `TenChuongTrinh` LIKE ? OR `MoTa` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Chuongtrinhgiamgia;
