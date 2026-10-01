const db = require('../common/db');
const { effectiveVariantPriceSql } = require('../utils/pricing');
const { toPublicImageUrl } = require('../utils/imagePaths');

const priceSql = effectiveVariantPriceSql('bt');

async function ensureCart(userId) {
    let [[cart]] = await db.query('SELECT MaGioHang FROM GioHang WHERE MaNguoiDung=?', [userId]);
    if (!cart) {
        const [result] = await db.query('INSERT INTO GioHang(MaNguoiDung) VALUES(?)', [userId]);
        return result.insertId;
    }
    return cart.MaGioHang;
}

exports.get = async (req, res) => {
    try {
        const cartId = await ensureCart(req.user.id);
        const [items] = await db.query(
            `SELECT ct.MaChiTietGioHang,ct.MaBienThe,ct.SoLuong,(${priceSql}) DonGia,
                    sp.MaSanPham,sp.TenSanPham,bt.SKU,bt.GiaBan,ms.TenMau,kt.TenKichThuoc,
                    (SELECT DuongDanAnh FROM HinhAnhSanPham WHERE MaSanPham=sp.MaSanPham ORDER BY LaAnhChinh DESC,ThuTu LIMIT 1) AnhChinh,
                    GREATEST(bt.SoLuongTon-bt.SoLuongTamGiu,0) SoLuongCoTheBan
             FROM ChiTietGioHang ct
             JOIN BienTheSanPham bt ON bt.MaBienThe=ct.MaBienThe
             JOIN SanPham sp ON sp.MaSanPham=bt.MaSanPham
             LEFT JOIN MauSac ms ON ms.MaMauSac=bt.MaMauSac
             LEFT JOIN KichThuoc kt ON kt.MaKichThuoc=bt.MaKichThuoc
             WHERE ct.MaGioHang=? ORDER BY ct.MaChiTietGioHang DESC`,
            [cartId],
        );
        for (const item of items) item.AnhChinh = toPublicImageUrl(item.AnhChinh);
        const total = items.reduce((sum, item) => sum + Number(item.DonGia) * Number(item.SoLuong), 0);
        res.json({ success: true, data: { MaGioHang: cartId, items, total } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.add = async (req, res) => {
    try {
        const { MaBienThe } = req.body;
        const quantity = Math.max(Number(req.body.SoLuong) || 0, 1);
        const cartId = await ensureCart(req.user.id);
        const [[variant]] = await db.query(
            `SELECT bt.MaBienThe,bt.SoLuongTon,bt.SoLuongTamGiu,bt.TrangThai,(${priceSql}) GiaSauGiam
             FROM BienTheSanPham bt WHERE bt.MaBienThe=?`,
            [MaBienThe],
        );
        if (!variant || Number(variant.TrangThai) !== 1) {
            return res.status(404).json({ success: false, message: 'Biến thể không tồn tại hoặc đã ngừng kinh doanh.' });
        }

        const [[oldItem]] = await db.query(
            'SELECT SoLuong FROM ChiTietGioHang WHERE MaGioHang=? AND MaBienThe=?',
            [cartId, MaBienThe],
        );
        const newQuantity = Number(oldItem?.SoLuong || 0) + quantity;
        if (newQuantity > Number(variant.SoLuongTon) - Number(variant.SoLuongTamGiu)) {
            return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho có thể bán.' });
        }

        await db.query(
            `INSERT INTO ChiTietGioHang(MaGioHang,MaBienThe,SoLuong,DonGia) VALUES(?,?,?,?)
             ON DUPLICATE KEY UPDATE SoLuong=VALUES(SoLuong),DonGia=VALUES(DonGia)`,
            [cartId, MaBienThe, newQuantity, variant.GiaSauGiam],
        );
        res.json({ success: true, message: 'Đã thêm vào giỏ hàng.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const quantity = Math.max(Number(req.body.SoLuong) || 0, 0);
        const [[item]] = await db.query(
            `SELECT ct.MaChiTietGioHang,ct.MaBienThe,bt.SoLuongTon,bt.SoLuongTamGiu,bt.TrangThai,(${priceSql}) GiaSauGiam
             FROM ChiTietGioHang ct
             JOIN GioHang gh ON gh.MaGioHang=ct.MaGioHang
             JOIN BienTheSanPham bt ON bt.MaBienThe=ct.MaBienThe
             WHERE ct.MaChiTietGioHang=? AND gh.MaNguoiDung=?`,
            [req.params.id, req.user.id],
        );
        if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ.' });
        if (quantity === 0) {
            await db.query('DELETE FROM ChiTietGioHang WHERE MaChiTietGioHang=?', [req.params.id]);
            return res.json({ success: true });
        }
        if (Number(item.TrangThai) !== 1) {
            return res.status(400).json({ success: false, message: 'Biến thể đã ngừng kinh doanh.' });
        }
        if (quantity > Number(item.SoLuongTon) - Number(item.SoLuongTamGiu)) {
            return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho có thể bán.' });
        }

        await db.query(
            'UPDATE ChiTietGioHang SET SoLuong=?,DonGia=? WHERE MaChiTietGioHang=?',
            [quantity, item.GiaSauGiam, req.params.id],
        );
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const [result] = await db.query(
            `DELETE ct FROM ChiTietGioHang ct
             JOIN GioHang gh ON gh.MaGioHang=ct.MaGioHang
             WHERE ct.MaChiTietGioHang=? AND gh.MaNguoiDung=?`,
            [req.params.id, req.user.id],
        );
        res.json({ success: true, affectedRows: result.affectedRows });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};