const Chitietphieunhap = {};

const db = require('../common/db');

Chitietphieunhap.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `chitietphieunhap`');
    return rows;
};

Chitietphieunhap.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `chitietphieunhap` WHERE `MaChiTietPhieuNhap` = ?', [id]);
    return rows[0] || null;
};

Chitietphieunhap.create = async (data) => {
    const [result] = await db.query('INSERT INTO `chitietphieunhap` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Chitietphieunhap.update = async (id, data) => {
    const [result] = await db.query('UPDATE `chitietphieunhap` SET ? WHERE `MaChiTietPhieuNhap` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Chitietphieunhap.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `chitietphieunhap` WHERE `MaChiTietPhieuNhap` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

module.exports = Chitietphieunhap;
