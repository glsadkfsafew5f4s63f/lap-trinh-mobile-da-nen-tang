const Phieunhap = {};

const db = require('../common/db');

Phieunhap.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `phieunhap`');
    return rows;
};

Phieunhap.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `phieunhap` WHERE `MaPhieuNhap` = ?', [id]);
    return rows[0] || null;
};

Phieunhap.create = async (data) => {
    const [result] = await db.query('INSERT INTO `phieunhap` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Phieunhap.update = async (id, data) => {
    const [result] = await db.query('UPDATE `phieunhap` SET ? WHERE `MaPhieuNhap` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Phieunhap.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `phieunhap` WHERE `MaPhieuNhap` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Phieunhap.search = async (keyword) => {
    const sql = 'SELECT * FROM `phieunhap` WHERE `SoPhieuNhap` LIKE ? OR `GhiChu` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Phieunhap;
