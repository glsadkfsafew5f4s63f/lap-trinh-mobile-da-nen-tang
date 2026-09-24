const Nguoidungvaitro = {};

const db = require('../common/db');

Nguoidungvaitro.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `nguoidungvaitro`');
    return rows;
};

Nguoidungvaitro.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `nguoidungvaitro` WHERE `MaNguoiDungVaiTro` = ?', [id]);
    return rows[0] || null;
};

Nguoidungvaitro.create = async (data) => {
    const [result] = await db.query('INSERT INTO `nguoidungvaitro` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Nguoidungvaitro.update = async (id, data) => {
    const [result] = await db.query('UPDATE `nguoidungvaitro` SET ? WHERE `MaNguoiDungVaiTro` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Nguoidungvaitro.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `nguoidungvaitro` WHERE `MaNguoiDungVaiTro` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Nguoidungvaitro.search = async (keyword) => {
    const sql = 'SELECT * FROM `nguoidungvaitro` WHERE CAST(`MaNguoiDung` AS CHAR) LIKE ? OR CAST(`MaVaiTro` AS CHAR) LIKE ?';
    const [rows] = await db.query(sql, [keyword, keyword]);
    return rows;
};

module.exports = Nguoidungvaitro;
