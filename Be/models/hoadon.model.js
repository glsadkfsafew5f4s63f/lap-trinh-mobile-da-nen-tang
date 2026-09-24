const Hoadon = {};

const db = require('../common/db');

Hoadon.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `hoadon`');
    return rows;
};

Hoadon.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `hoadon` WHERE `MaHoaDon` = ?', [id]);
    return rows[0] || null;
};

Hoadon.create = async (data) => {
    const [result] = await db.query('INSERT INTO `hoadon` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Hoadon.update = async (id, data) => {
    const [result] = await db.query('UPDATE `hoadon` SET ? WHERE `MaHoaDon` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Hoadon.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `hoadon` WHERE `MaHoaDon` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Hoadon.search = async (keyword) => {
    const sql = 'SELECT * FROM `hoadon` WHERE `SoHoaDon` LIKE ? OR `GhiChu` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Hoadon;
