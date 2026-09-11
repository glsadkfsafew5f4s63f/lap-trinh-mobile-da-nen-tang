const Sanpham = {};

const db = require('../common/db');

Sanpham.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `sanpham`');
    return rows;
};

Sanpham.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `sanpham` WHERE `MaSanPham` = ?', [id]);
    return rows[0] || null;
};

Sanpham.create = async (data) => {
    const [result] = await db.query('INSERT INTO `sanpham` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Sanpham.update = async (id, data) => {
    const [result] = await db.query('UPDATE `sanpham` SET ? WHERE `MaSanPham` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Sanpham.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `sanpham` WHERE `MaSanPham` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Sanpham.search = async (keyword) => {
    const sql = 'SELECT * FROM `sanpham` WHERE `TenSanPham` LIKE ? OR `MoTa` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Sanpham;
