const Mausac = {};

const db = require('../common/db');

Mausac.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `mausac`');
    return rows;
};

Mausac.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `mausac` WHERE `MaMau` = ?', [id]);
    return rows[0] || null;
};

Mausac.create = async (data) => {
    const [result] = await db.query('INSERT INTO `mausac` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Mausac.update = async (id, data) => {
    const [result] = await db.query('UPDATE `mausac` SET ? WHERE `MaMau` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Mausac.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `mausac` WHERE `MaMau` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Mausac.search = async (keyword) => {
    const sql = 'SELECT * FROM `mausac` WHERE `TenMau` LIKE ? OR `MaHex` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Mausac;
