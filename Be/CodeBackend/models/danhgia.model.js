const Danhgia = {};

const db = require('../common/db');

Danhgia.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `danhgia`');
    return rows;
};

Danhgia.getByProductId = async (productId) => {
    const [rows] = await db.query(`
        SELECT
            dg.MaDanhGia AS id,
            dg.MaSanPham AS productId,
            dg.MaNguoiDung AS userId,
            dg.MaDonHang AS orderId,
            dg.SoSao AS stars,
            dg.NoiDung AS comment,
            dg.NgayDanhGia AS date,
            nd.HoTen AS author
        FROM DanhGia dg
        INNER JOIN NguoiDung nd ON nd.MaNguoiDung = dg.MaNguoiDung
        WHERE dg.MaSanPham = ?
        ORDER BY dg.NgayDanhGia DESC
    `, [productId]);
    return rows;
};

Danhgia.createVerified = async (data) => {
    const [orders] = await db.query(`
        SELECT dh.MaDonHang
        FROM DonHang dh
        INNER JOIN ChiTietDonHang ct ON ct.MaDonHang = dh.MaDonHang
        INNER JOIN BienTheSanPham bt ON bt.MaBienThe = ct.MaBienThe
        WHERE dh.MaDonHang = ?
          AND dh.MaNguoiDung = ?
          AND bt.MaSanPham = ?
          AND dh.TrangThai = 'DaGiao'
        LIMIT 1
    `, [data.MaDonHang, data.MaNguoiDung, data.MaSanPham]);

    if (orders.length === 0) {
        throw new Error('Chỉ người mua sản phẩm trong đơn đã giao mới được đánh giá');
    }

    const [existing] = await db.query(
        'SELECT MaDanhGia FROM DanhGia WHERE MaNguoiDung = ? AND MaDonHang = ? AND MaSanPham = ?',
        [data.MaNguoiDung, data.MaDonHang, data.MaSanPham]
    );
    if (existing.length > 0) {
        throw new Error('Bạn đã đánh giá sản phẩm này trong đơn hàng');
    }

    return Danhgia.create(data);
};

Danhgia.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `danhgia` WHERE `MaDanhGia` = ?', [id]);
    return rows[0] || null;
};

Danhgia.create = async (data) => {
    const [result] = await db.query('INSERT INTO `danhgia` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Danhgia.update = async (id, data) => {
    const [result] = await db.query('UPDATE `danhgia` SET ? WHERE `MaDanhGia` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Danhgia.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `danhgia` WHERE `MaDanhGia` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Danhgia.search = async (keyword) => {
    const sql = 'SELECT * FROM `danhgia` WHERE `NoiDung` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Danhgia;
