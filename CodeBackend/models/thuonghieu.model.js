const Thuonghieu = {};

const db = require('../common/db');

Thuonghieu.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `thuonghieu`');
    return rows;
};

Thuonghieu.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `thuonghieu` WHERE `MaThuongHieu` = ?', [id]);
    return rows[0] || null;
};

Thuonghieu.create = async (data) => {
    const [result] = await db.query('INSERT INTO `thuonghieu` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Thuonghieu.update = async (id, data) => {
    const [result] = await db.query('UPDATE `thuonghieu` SET ? WHERE `MaThuongHieu` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Thuonghieu.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `thuonghieu` WHERE `MaThuongHieu` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Thuonghieu.search = async (keyword) => {
    const sql = 'SELECT * FROM `thuonghieu` WHERE `TenThuongHieu` LIKE ? OR `MoTa` LIKE ? OR `Logo` LIKE ?';
    const paramsValue = [keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Thuonghieu;
