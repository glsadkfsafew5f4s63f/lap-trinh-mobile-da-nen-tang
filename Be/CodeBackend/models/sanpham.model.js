const Sanpham = {};

const db = require('../common/db');

Sanpham.getCatalog = async () => {
    const [rows] = await db.query(`
        SELECT
            sp.MaSanPham AS id,
            sp.TenSanPham AS name,
            sp.MoTa AS description,
            sp.Gia AS price,
            sp.GiaCu AS oldPrice,
            sp.SanPhamMoi AS isNew,
            sp.NoiBat AS isFeatured,
            dm.TenDanhMuc AS category,
            th.TenThuongHieu AS brand,
            COALESCE(
                JSON_ARRAYAGG(
                    CASE
                        WHEN ha.MaHinhAnh IS NULL THEN NULL
                        ELSE JSON_OBJECT(
                            'url', ha.DuongDanAnh,
                            'isPrimary', ha.AnhChinh,
                            'order', ha.ThuTu
                        )
                    END
                ),
                JSON_ARRAY()
            ) AS images
        FROM SanPham sp
        JOIN DanhMuc dm ON dm.MaDanhMuc = sp.MaDanhMuc
        LEFT JOIN ThuongHieu th ON th.MaThuongHieu = sp.MaThuongHieu
        LEFT JOIN HinhAnhSanPham ha ON ha.MaSanPham = sp.MaSanPham
        WHERE sp.TrangThai = 1
        GROUP BY sp.MaSanPham
        ORDER BY sp.MaSanPham
    `);
    return rows;
};

Sanpham.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `sanpham`');
    return rows;
};

Sanpham.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `sanpham` WHERE `MaSanPham` = ?', [id]);
    return rows[0] || null;
};

Sanpham.create = async (data) => {
    const [result] = await db.query('INSERT INTO `sanpham` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Sanpham.update = async (id, data) => {
    const [result] = await db.query('UPDATE `sanpham` SET ? WHERE `MaSanPham` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Sanpham.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `sanpham` WHERE `MaSanPham` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Sanpham.search = async (keyword) => {
    const sql = 'SELECT * FROM `sanpham` WHERE `TenSanPham` LIKE ? OR `MoTa` LIKE ?';
    const paramsValue = [keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Sanpham;
