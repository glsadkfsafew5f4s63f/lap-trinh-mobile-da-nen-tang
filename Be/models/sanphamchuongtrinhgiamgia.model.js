const Sanphamchuongtrinhgiamgia = {};

const db = require('../common/db');

Sanphamchuongtrinhgiamgia.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `sanphamchuongtrinhgiamgia`');
    return rows;
};

Sanphamchuongtrinhgiamgia.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `sanphamchuongtrinhgiamgia` WHERE `MaSanPhamChuongTrinh` = ?', [id]);
    return rows[0] || null;
};

Sanphamchuongtrinhgiamgia.create = async (data) => {
    const [result] = await db.query('INSERT INTO `sanphamchuongtrinhgiamgia` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Sanphamchuongtrinhgiamgia.update = async (id, data) => {
    const [result] = await db.query('UPDATE `sanphamchuongtrinhgiamgia` SET ? WHERE `MaSanPhamChuongTrinh` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Sanphamchuongtrinhgiamgia.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `sanphamchuongtrinhgiamgia` WHERE `MaSanPhamChuongTrinh` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Sanphamchuongtrinhgiamgia.search = async (keyword) => {
    const [rows] = await db.query('SELECT * FROM `sanphamchuongtrinhgiamgia` WHERE CAST(`MaSanPham` AS CHAR) LIKE ? OR CAST(`MaChuongTrinh` AS CHAR) LIKE ?', [keyword, keyword]);
    return rows;
};

module.exports = Sanphamchuongtrinhgiamgia;
