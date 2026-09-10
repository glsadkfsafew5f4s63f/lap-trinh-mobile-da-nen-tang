const Vaitro = {};

const db = require('../common/db');

Vaitro.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `vaitro`');
    return rows;
};

Vaitro.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `vaitro` WHERE `MaVaiTro` = ?', [id]);
    return rows[0] || null;
};

Vaitro.create = async (data) => {
    const [result] = await db.query('INSERT INTO `vaitro` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Vaitro.update = async (id, data) => {
    const [result] = await db.query('UPDATE `vaitro` SET ? WHERE `MaVaiTro` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Vaitro.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `vaitro` WHERE `MaVaiTro` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Vaitro.search = async (keyword) => {
    const sql = 'SELECT * FROM `vaitro` WHERE `TenVaiTro` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Vaitro;
