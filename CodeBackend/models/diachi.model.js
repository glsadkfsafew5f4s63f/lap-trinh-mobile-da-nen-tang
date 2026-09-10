const Diachi = {};

const db = require('../common/db');

Diachi.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `diachi`');
    return rows;
};

Diachi.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `diachi` WHERE `MaDiaChi` = ?', [id]);
    return rows[0] || null;
};

Diachi.create = async (data) => {
    const [result] = await db.query('INSERT INTO `diachi` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Diachi.update = async (id, data) => {
    const [result] = await db.query('UPDATE `diachi` SET ? WHERE `MaDiaChi` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Diachi.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `diachi` WHERE `MaDiaChi` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Diachi.search = async (keyword) => {
    const sql = 'SELECT * FROM `diachi` WHERE `HoTenNguoiNhan` LIKE ? OR `SoDienThoai` LIKE ? OR `TinhThanh` LIKE ? OR `QuanHuyen` LIKE ? OR `PhuongXa` LIKE ? OR `DiaChiChiTiet` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Diachi;
