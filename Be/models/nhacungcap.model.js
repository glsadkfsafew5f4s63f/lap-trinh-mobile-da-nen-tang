const Nhacungcap = {};

const db = require('../common/db');

Nhacungcap.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `nhacungcap`');
    return rows;
};

Nhacungcap.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `nhacungcap` WHERE `MaNhaCungCap` = ?', [id]);
    return rows[0] || null;
};

Nhacungcap.create = async (data) => {
    const [result] = await db.query('INSERT INTO `nhacungcap` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Nhacungcap.update = async (id, data) => {
    const [result] = await db.query('UPDATE `nhacungcap` SET ? WHERE `MaNhaCungCap` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Nhacungcap.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `nhacungcap` WHERE `MaNhaCungCap` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Nhacungcap.search = async (keyword) => {
    const sql = 'SELECT * FROM `nhacungcap` WHERE `TenNhaCungCap` LIKE ? OR `NguoiLienHe` LIKE ? OR `SoDienThoai` LIKE ? OR `Email` LIKE ? OR `DiaChi` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Nhacungcap;
