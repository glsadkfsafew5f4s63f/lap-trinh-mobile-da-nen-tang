const Bienthesanpham = {};

const db = require('../common/db');

Bienthesanpham.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `bienthesanpham`');
    return rows;
};

Bienthesanpham.getByProductId = async (productId) => {
    const [rows] = await db.query(`
        SELECT
            bt.MaBienThe AS id,
            bt.MaSanPham AS productId,
            bt.MaMau AS colorId,
            ms.TenMau AS color,
            ms.MaHex AS hex,
            bt.MaKichThuoc AS sizeId,
            kt.TenKichThuoc AS size,
            bt.MaSKU AS sku,
            COALESCE(bt.GiaBan, sp.Gia) AS price,
            bt.SoLuongTon AS stock
        FROM BienTheSanPham bt
        INNER JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
        INNER JOIN MauSac ms ON ms.MaMau = bt.MaMau
        INNER JOIN KichThuoc kt ON kt.MaKichThuoc = bt.MaKichThuoc
        WHERE bt.MaSanPham = ?
        ORDER BY bt.MaBienThe
    `, [productId]);
    return rows;
};

Bienthesanpham.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `bienthesanpham` WHERE `MaBienThe` = ?', [id]);
    return rows[0] || null;
};

Bienthesanpham.create = async (data) => {
    const [result] = await db.query('INSERT INTO `bienthesanpham` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Bienthesanpham.update = async (id, data) => {
    const [result] = await db.query('UPDATE `bienthesanpham` SET ? WHERE `MaBienThe` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Bienthesanpham.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `bienthesanpham` WHERE `MaBienThe` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Bienthesanpham.search = async (keyword) => {
    const sql = 'SELECT * FROM `bienthesanpham` WHERE `MaSKU` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Bienthesanpham;
