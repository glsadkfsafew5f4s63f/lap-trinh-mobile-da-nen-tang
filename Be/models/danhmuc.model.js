const Danhmuc = {};

const db = require('../common/db');

Danhmuc.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `danhmuc`');
    return rows;
};

Danhmuc.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `danhmuc` WHERE `MaDanhMuc` = ?', [id]);
    return rows[0] || null;
};

Danhmuc.create = async (data) => {
    const [result] = await db.query('INSERT INTO `danhmuc` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Danhmuc.update = async (id, data) => {
    const [result] = await db.query('UPDATE `danhmuc` SET ? WHERE `MaDanhMuc` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Danhmuc.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `danhmuc` WHERE `MaDanhMuc` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Danhmuc.search = async (keyword) => {
    const sql = 'SELECT * FROM `danhmuc` WHERE `TenDanhMuc` LIKE ? OR `MoTa` LIKE ? OR `HinhAnh` LIKE ?';
    const paramsValue = [keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Danhmuc;
