const Nguoidung = {};

const db = require('../common/db');

Nguoidung.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `nguoidung`');
    return rows;
};

Nguoidung.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `nguoidung` WHERE `MaNguoiDung` = ?', [id]);
    return rows[0] || null;
};

Nguoidung.create = async (data) => {
    const [result] = await db.query('INSERT INTO `nguoidung` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Nguoidung.update = async (id, data) => {
    const [result] = await db.query('UPDATE `nguoidung` SET ? WHERE `MaNguoiDung` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Nguoidung.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `nguoidung` WHERE `MaNguoiDung` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Nguoidung.search = async (keyword) => {
    const sql = 'SELECT * FROM `nguoidung` WHERE `HoTen` LIKE ? OR `Email` LIKE ? OR `SoDienThoai` LIKE ? OR `MatKhau` LIKE ? OR `AnhDaiDien` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Nguoidung;
