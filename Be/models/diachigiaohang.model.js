const Diachigiaohang = {};

const db = require('../common/db');

Diachigiaohang.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `diachigiaohang`');
    return rows;
};

Diachigiaohang.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `diachigiaohang` WHERE `MaDiaChi` = ?', [id]);
    return rows[0] || null;
};

Diachigiaohang.create = async (data) => {
    const [result] = await db.query('INSERT INTO `diachigiaohang` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Diachigiaohang.update = async (id, data) => {
    const [result] = await db.query('UPDATE `diachigiaohang` SET ? WHERE `MaDiaChi` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Diachigiaohang.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `diachigiaohang` WHERE `MaDiaChi` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Diachigiaohang.search = async (keyword) => {
    const sql = 'SELECT * FROM `diachigiaohang` WHERE `TenNguoiNhan` LIKE ? OR `SoDienThoai` LIKE ? OR `DiaChiChiTiet` LIKE ? OR `PhuongXa` LIKE ? OR `QuanHuyen` LIKE ? OR `TinhThanh` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Diachigiaohang;
