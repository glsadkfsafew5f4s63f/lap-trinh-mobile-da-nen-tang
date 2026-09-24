const Thanhtoan = {};

const db = require('../common/db');

Thanhtoan.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `thanhtoan`');
    return rows;
};

Thanhtoan.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `thanhtoan` WHERE `MaThanhToan` = ?', [id]);
    return rows[0] || null;
};

Thanhtoan.create = async (data) => {
    const [result] = await db.query('INSERT INTO `thanhtoan` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Thanhtoan.update = async (id, data) => {
    const [result] = await db.query('UPDATE `thanhtoan` SET ? WHERE `MaThanhToan` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Thanhtoan.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `thanhtoan` WHERE `MaThanhToan` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Thanhtoan.search = async (keyword) => {
    const sql = 'SELECT * FROM `thanhtoan` WHERE `MaGiaoDich` LIKE ? OR `GhiChu` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Thanhtoan;
