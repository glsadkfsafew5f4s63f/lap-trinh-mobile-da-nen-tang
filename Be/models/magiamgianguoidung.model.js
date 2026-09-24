const Magiamgianguoidung = {};

const db = require('../common/db');

Magiamgianguoidung.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `magiamgianguoidung`');
    return rows;
};

Magiamgianguoidung.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `magiamgianguoidung` WHERE `MaGiamGiaNguoiDung` = ?', [id]);
    return rows[0] || null;
};

Magiamgianguoidung.create = async (data) => {
    const [result] = await db.query('INSERT INTO `magiamgianguoidung` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Magiamgianguoidung.update = async (id, data) => {
    const [result] = await db.query('UPDATE `magiamgianguoidung` SET ? WHERE `MaGiamGiaNguoiDung` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Magiamgianguoidung.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `magiamgianguoidung` WHERE `MaGiamGiaNguoiDung` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

module.exports = Magiamgianguoidung;
