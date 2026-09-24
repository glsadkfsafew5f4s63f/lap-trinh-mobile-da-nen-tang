const Magiamgia = {};

const db = require('../common/db');

Magiamgia.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `magiamgia`');
    return rows;
};

Magiamgia.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `magiamgia` WHERE `MaGiamGia` = ?', [id]);
    return rows[0] || null;
};

Magiamgia.create = async (data) => {
    const [result] = await db.query('INSERT INTO `magiamgia` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Magiamgia.update = async (id, data) => {
    const [result] = await db.query('UPDATE `magiamgia` SET ? WHERE `MaGiamGia` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Magiamgia.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `magiamgia` WHERE `MaGiamGia` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Magiamgia.search = async (keyword) => {
    const sql = 'SELECT * FROM `magiamgia` WHERE `MaCode` LIKE ? OR `TenMaGiamGia` LIKE ? OR `MoTa` LIKE ?';
    const paramsValue = [keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Magiamgia;
