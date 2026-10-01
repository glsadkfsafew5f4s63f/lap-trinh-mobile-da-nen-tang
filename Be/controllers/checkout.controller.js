const db = require('../common/db');
const { effectiveVariantPriceSql } = require('../utils/pricing');

const priceSql = effectiveVariantPriceSql('bt');
const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

async function calcVoucher(conn, code, userId, subtotal) {
    if (!code) return { id: null, discount: 0 };

    const [[voucher]] = await conn.query('SELECT * FROM MaGiamGia WHERE MaCode=? FOR UPDATE', [code]);
    if (!voucher) throw new Error('Mã giảm giá không tồn tại.');

    const now = new Date();
    if (Number(voucher.TrangThai) !== 1 || now < new Date(voucher.NgayBatDau) || now > new Date(voucher.NgayKetThuc)) {
        throw new Error('Mã giảm giá đã hết hạn hoặc chưa hoạt động.');
    }
    if (subtotal < Number(voucher.DonToiThieu)) throw new Error(`Đơn tối thiểu để dùng mã là ${voucher.DonToiThieu}.`);
    if (voucher.TongSoLuong !== null && Number(voucher.SoLuongDaSuDung) >= Number(voucher.TongSoLuong)) {
        throw new Error('Mã giảm giá đã hết lượt sử dụng.');
    }

    const [[userVoucher]] = await conn.query(
        'SELECT * FROM MaGiamGiaNguoiDung WHERE MaGiamGia=? AND MaNguoiDung=? FOR UPDATE',
        [voucher.MaGiamGia, userId],
    );
    const used = Number(userVoucher?.SoLanDaSuDung || 0);
    if (used >= Number(voucher.SoLanSuDungMoiNguoi)) throw new Error('Bạn đã dùng mã giảm giá quá số lần cho phép.');

    let discount = voucher.LoaiGiam === 'PHAN_TRAM'
        ? subtotal * Number(voucher.GiaTriGiam) / 100
        : Number(voucher.GiaTriGiam);
    if (voucher.GiamToiDa !== null) discount = Math.min(discount, Number(voucher.GiamToiDa));
    discount = roundMoney(Math.min(discount, subtotal));
    return { id: voucher.MaGiamGia, discount, userVoucher };
}

async function getCartItems(conn, cartId) {
    const [items] = await conn.query(
        `SELECT ct.MaBienThe,ct.SoLuong,bt.SKU,bt.SoLuongTon,bt.SoLuongTamGiu,
                sp.MaSanPham,sp.TenSanPham,ms.TenMau,kt.TenKichThuoc,(${priceSql}) GiaSauGiam
         FROM ChiTietGioHang ct
         JOIN BienTheSanPham bt ON bt.MaBienThe=ct.MaBienThe
         JOIN SanPham sp ON sp.MaSanPham=bt.MaSanPham
         LEFT JOIN MauSac ms ON ms.MaMauSac=bt.MaMauSac
         LEFT JOIN KichThuoc kt ON kt.MaKichThuoc=bt.MaKichThuoc
         WHERE ct.MaGioHang=? FOR UPDATE`,
        [cartId],
    );
    return items;
}

function subtotalFor(items) {
    return roundMoney(items.reduce((sum, item) => sum + roundMoney(Number(item.GiaSauGiam) * Number(item.SoLuong)), 0));
}

async function quoteCart(conn, userId, code) {
    const [[cart]] = await conn.query('SELECT MaGioHang FROM GioHang WHERE MaNguoiDung=? FOR UPDATE', [userId]);
    if (!cart) throw new Error('Giỏ hàng chưa tồn tại.');

    const items = await getCartItems(conn, cart.MaGioHang);
    if (!items.length) throw new Error('Giỏ hàng đang trống.');
    for (const item of items) {
        if (Number(item.SoLuong) > Number(item.SoLuongTon) - Number(item.SoLuongTamGiu)) {
            throw new Error(`Sản phẩm ${item.TenSanPham} không đủ tồn kho có thể bán.`);
        }
    }

    const subtotal = subtotalFor(items);
    const voucher = await calcVoucher(conn, code, userId, subtotal);
    const shipping = Number(process.env.SHIPPING_FEE || 30000);
    return {
        TongTien: subtotal,
        GiamGia: voucher.discount,
        PhiGiaoHang: shipping,
        ThanhTien: roundMoney(Math.max(subtotal - voucher.discount + shipping, 0)),
    };
}

exports.quote = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const quote = await quoteCart(conn, req.user.id, String(req.body.code || '').trim() || null);
        await conn.rollback();
        res.json({ success: true, data: quote });
    } catch (error) {
        try { await conn.rollback(); } catch (_) {}
        res.status(400).json({ success: false, message: error.message });
    } finally {
        conn.release();
    }
};

exports.previewVoucher = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const code = String(req.body.code || '').trim();
        if (!code) throw new Error('Nhập mã giảm giá.');
        await conn.beginTransaction();
        const quote = await quoteCart(conn, req.user.id, code);
        await conn.rollback();
        res.json({ success: true, data: { MaCode: code, ...quote } });
    } catch (error) {
        try { await conn.rollback(); } catch (_) {}
        res.status(400).json({ success: false, message: error.message });
    } finally {
        conn.release();
    }
};

exports.create = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { MaDiaChi, PhuongThuc, MaGiamGiaCode, GhiChu = null } = req.body;
        const userId = req.user.id;
        await conn.beginTransaction();

        const [[address]] = await conn.query(
            'SELECT * FROM DiaChiGiaoHang WHERE MaDiaChi=? AND MaNguoiDung=?',
            [MaDiaChi, userId],
        );
        if (!address) throw new Error('Địa chỉ giao hàng không hợp lệ.');

        const [[cart]] = await conn.query('SELECT MaGioHang FROM GioHang WHERE MaNguoiDung=? FOR UPDATE', [userId]);
        if (!cart) throw new Error('Giỏ hàng chưa tồn tại.');
        const items = await getCartItems(conn, cart.MaGioHang);
        if (!items.length) throw new Error('Giỏ hàng đang trống.');

        for (const item of items) {
            if (Number(item.SoLuong) > Number(item.SoLuongTon) - Number(item.SoLuongTamGiu)) {
                throw new Error(`Sản phẩm ${item.TenSanPham} không đủ tồn kho có thể bán.`);
            }
        }

        const subtotal = subtotalFor(items);
        const voucher = await calcVoucher(conn, String(MaGiamGiaCode || '').trim() || null, userId, subtotal);
        const shipping = Number(process.env.SHIPPING_FEE || 30000);
        const total = roundMoney(Math.max(subtotal - voucher.discount + shipping, 0));
        const code = `DH${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const addressText = [address.DiaChiChiTiet, address.PhuongXa, address.QuanHuyen, address.TinhThanh].filter(Boolean).join(', ');
        const [orderResult] = await conn.query(
            `INSERT INTO DonHang(MaNguoiDung,MaDiaChi,MaDonHangCode,TenNguoiNhan,SoDienThoaiNhan,DiaChiGiaoHang,TongTien,GiamGia,PhiGiaoHang,ThanhTien,MaGiamGia,GhiChu)
             VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
            [userId, address.MaDiaChi, code, address.TenNguoiNhan, address.SoDienThoai, addressText, subtotal, voucher.discount, shipping, total, voucher.id, GhiChu],
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            const price = Number(item.GiaSauGiam);
            const lineTotal = roundMoney(price * Number(item.SoLuong));
            await conn.query(
                `INSERT INTO ChiTietDonHang(MaDonHang,MaBienThe,TenSanPham,SKU,MauSac,KichThuoc,SoLuong,DonGia,GiamGia,ThanhTien)
                 VALUES(?,?,?,?,?,?,?,?,?,?)`,
                [orderId, item.MaBienThe, item.TenSanPham, item.SKU, item.TenMau || null, item.TenKichThuoc || null, item.SoLuong, price, 0, lineTotal],
            );
            await conn.query('UPDATE BienTheSanPham SET SoLuongTamGiu=SoLuongTamGiu+? WHERE MaBienThe=?', [item.SoLuong, item.MaBienThe]);
            const [[stock]] = await conn.query('SELECT SoLuongTon,SoLuongTamGiu FROM BienTheSanPham WHERE MaBienThe=?', [item.MaBienThe]);
            await conn.query(
                `INSERT INTO LichSuTonKho(MaBienThe,LoaiGiaoDich,SoLuongThayDoi,TonTruoc,TonSau,TamGiuTruoc,TamGiuSau,MaDonHang,MaNguoiThucHien,LyDo)
                 VALUES(?,?,?,?,?,?,?,?,?,?)`,
                [item.MaBienThe, 'GIU_HANG', item.SoLuong, stock.SoLuongTon, stock.SoLuongTon, Number(stock.SoLuongTamGiu) - Number(item.SoLuong), stock.SoLuongTamGiu, orderId, userId, 'Tạm giữ khi tạo đơn'],
            );
        }

        await conn.query(
            'INSERT INTO ThanhToan(MaDonHang,PhuongThuc,LanThu,SoTien,TrangThai) VALUES(?,?,?,?,?)',
            [orderId, PhuongThuc || 'COD', 1, total, 'CHO_XU_LY'],
        );
        if (voucher.id) {
            if (voucher.userVoucher) {
                await conn.query(
                    'UPDATE MaGiamGiaNguoiDung SET SoLanDaSuDung=SoLanDaSuDung+1,LanSuDungCuoi=NOW() WHERE MaGiamGia=? AND MaNguoiDung=?',
                    [voucher.id, userId],
                );
            } else {
                await conn.query(
                    'INSERT INTO MaGiamGiaNguoiDung(MaGiamGia,MaNguoiDung,SoLanDaSuDung,LanSuDungCuoi) VALUES(?,?,1,NOW())',
                    [voucher.id, userId],
                );
            }
            await conn.query('UPDATE MaGiamGia SET SoLuongDaSuDung=SoLuongDaSuDung+1 WHERE MaGiamGia=?', [voucher.id]);
        }

        await conn.query(
            'INSERT INTO LichSuDonHang(MaDonHang,TrangThaiCu,TrangThaiMoi,MaNguoiThayDoi,GhiChu) VALUES(?,NULL,?,?,?)',
            [orderId, 'CHO_XAC_NHAN', userId, 'Tạo đơn hàng và tạm giữ tồn kho.'],
        );
        await conn.query('DELETE FROM ChiTietGioHang WHERE MaGioHang=?', [cart.MaGioHang]);
        await conn.commit();
        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công.',
            data: { MaDonHang: orderId, MaDonHangCode: code, TongTien: subtotal, GiamGia: voucher.discount, PhiGiaoHang: shipping, ThanhTien: total, TrangThaiDonHang: 'CHO_XAC_NHAN' },
        });
    } catch (error) {
        try { await conn.rollback(); } catch (_) {}
        res.status(400).json({ success: false, message: error.message });
    } finally {
        conn.release();
    }
};