const Kichthuoc = {};

const db = require('../common/db');

Kichthuoc.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `kichthuoc`');
    return rows;
};

Kichthuoc.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `kichthuoc` WHERE `MaKichThuoc` = ?', [id]);
    return rows[0] || null;
};

Kichthuoc.create = async (data) => {
    const [result] = await db.query('INSERT INTO `kichthuoc` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Kichthuoc.update = async (id, data) => {
    const [result] = await db.query('UPDATE `kichthuoc` SET ? WHERE `MaKichThuoc` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Kichthuoc.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `kichthuoc` WHERE `MaKichThuoc` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Kichthuoc.search = async (keyword) => {
    const sql = 'SELECT * FROM `kichthuoc` WHERE `TenKichThuoc` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Kichthuoc;
