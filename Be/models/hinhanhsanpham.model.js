const Hinhanhsanpham = {};

const db = require('../common/db');

Hinhanhsanpham.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `hinhanhsanpham`');
    return rows;
};

Hinhanhsanpham.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `hinhanhsanpham` WHERE `MaHinhAnh` = ?', [id]);
    return rows[0] || null;
};

Hinhanhsanpham.create = async (data) => {
    const [result] = await db.query('INSERT INTO `hinhanhsanpham` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Hinhanhsanpham.update = async (id, data) => {
    const [result] = await db.query('UPDATE `hinhanhsanpham` SET ? WHERE `MaHinhAnh` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Hinhanhsanpham.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `hinhanhsanpham` WHERE `MaHinhAnh` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Hinhanhsanpham.search = async (keyword) => {
    const sql = 'SELECT * FROM `hinhanhsanpham` WHERE `DuongDanAnh` LIKE ? OR `MoTa` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Hinhanhsanpham;
