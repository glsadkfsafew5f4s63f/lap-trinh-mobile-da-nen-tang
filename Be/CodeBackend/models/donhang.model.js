const Donhang = {};

const db = require('../common/db');

Donhang.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `donhang`');
    return rows;
};

Donhang.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `donhang` WHERE `MaDonHang` = ?', [id]);
    return rows[0] || null;
};

Donhang.getItemsByOrderId = async (orderId) => {
    const [rows] = await db.query(`
         SELECT ct.MaDonHang, ct.MaBienThe, bt.MaSanPham, bt.MaSKU AS SKU,
             ct.TenSanPham, ct.Mau, ct.KichThuoc, ct.SoLuong, ct.DonGia
         FROM ChiTietDonHang ct
         INNER JOIN BienTheSanPham bt ON bt.MaBienThe = ct.MaBienThe
         WHERE ct.MaDonHang = ?
         ORDER BY ct.MaChiTietDonHang
    `, [orderId]);
    return rows;
};

Donhang.create = async (data) => {
    const [result] = await db.query('INSERT INTO `donhang` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Donhang.createCheckout = async (data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const items = [];
        let subtotal = 0;
        for (const item of data.items || []) {
            const [variants] = await connection.query(`
                SELECT bt.MaBienThe, bt.MaSanPham, bt.SoLuongTon,
                       COALESCE(bt.GiaBan, sp.Gia) AS Gia,
                       sp.TenSanPham, ms.TenMau AS Mau, kt.TenKichThuoc AS KichThuoc
                FROM BienTheSanPham bt
                INNER JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
                INNER JOIN MauSac ms ON ms.MaMau = bt.MaMau
                INNER JOIN KichThuoc kt ON kt.MaKichThuoc = bt.MaKichThuoc
                WHERE bt.MaBienThe = ?
                FOR UPDATE
            `, [item.MaBienThe]);

            const variant = variants[0];
            if (!variant) {
                throw new Error(`Không tìm thấy biến thể ${item.MaBienThe}`);
            }
            if (variant.SoLuongTon < Number(item.SoLuong)) {
                throw new Error(`Biến thể ${variant.MaBienThe} không đủ tồn kho`);
            }

            const quantity = Number(item.SoLuong);
            const price = Number(variant.Gia);
            subtotal += price * quantity;
            items.push({ item, variant, quantity, price });
        }

        const shippingFee = Number(data.PhiVanChuyen || 0);
        const total = subtotal + shippingFee;
        const deposit = Math.round(total * 0.2);
        const remaining = total - deposit;
        if (Number(data.TienCoc) !== deposit || Number(data.TienConLai) !== remaining) {
            throw new Error('Tiền cọc phải bằng đúng 20% tổng đơn hàng');
        }

        const [orderResult] = await connection.query(`
            INSERT INTO DonHang
                (MaNguoiDung, HoTenNguoiNhan, SoDienThoaiNguoiNhan, DiaChiGiaoHang,
                  TongTien, PhiVanChuyen, TienCoc, TienConLai,
                  PhuongThucThanhToan, TrangThaiThanhToan)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.MaNguoiDung,
            data.HoTenNguoiNhan,
            data.SoDienThoaiNguoiNhan,
            data.DiaChiGiaoHang,
            total,
            shippingFee,
            deposit,
            remaining,
            data.PhuongThucThanhToan || 'Coc 20%',
            data.TrangThaiThanhToan || 'ChuaCoc'
        ]);

        for (const { variant, quantity, price } of items) {
            await connection.query(`
                INSERT INTO ChiTietDonHang
                    (MaDonHang, MaBienThe, TenSanPham, Mau, KichThuoc, SoLuong, DonGia)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                orderResult.insertId,
                variant.MaBienThe,
                variant.TenSanPham,
                variant.Mau,
                variant.KichThuoc,
                quantity,
                price
            ]);

            await connection.query(
                'UPDATE BienTheSanPham SET SoLuongTon = SoLuongTon - ? WHERE MaBienThe = ?',
                [quantity, variant.MaBienThe]
            );
        }

        await connection.commit();
        return { insertId: orderResult.insertId, affectedRows: orderResult.affectedRows };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

Donhang.update = async (id, data) => {
    const [result] = await db.query('UPDATE `donhang` SET ? WHERE `MaDonHang` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Donhang.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `donhang` WHERE `MaDonHang` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Donhang.search = async (keyword) => {
    const sql = 'SELECT * FROM `donhang` WHERE `HoTenNguoiNhan` LIKE ? OR `SoDienThoaiNguoiNhan` LIKE ? OR `TinhThanh` LIKE ? OR `QuanHuyen` LIKE ? OR `PhuongXa` LIKE ? OR `DiaChiGiaoHang` LIKE ? OR `PhuongThucThanhToan` LIKE ? OR `GhiChu` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Donhang;
