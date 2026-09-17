const Sanpham = require('../models/sanpham.model');
const db = require('../common/db');

exports.getAll = async (_req, res) => {
    try {
        const data = await Sanpham.getCatalog();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải sản phẩm.', detail: error.message });
    }
};

exports.create = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const {
            MaDanhMuc,
            MaThuongHieu = null,
            TenSanPham,
            MoTa = null,
            Gia,
            GiaCu = null,
            SanPhamMoi = 0,
            NoiBat = 0,
            TrangThai = 1,
            images = [],
            colors = [],
            sizes = [],
            stock = 0,
        } = req.body;

        if (!MaDanhMuc || !TenSanPham || Gia === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu danh mục, tên hoặc giá sản phẩm.' });
        }

        const normalizedColors = colors.length ? colors : [{ name: 'Mặc định', hex: '#808080' }];
        const normalizedSizes = sizes.length ? sizes : ['Mặc định'];
        await connection.beginTransaction();

        const [productResult] = await connection.query(
            'INSERT INTO SanPham (MaDanhMuc, MaThuongHieu, TenSanPham, MoTa, Gia, GiaCu, SanPhamMoi, NoiBat, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [MaDanhMuc, MaThuongHieu || null, TenSanPham, MoTa, Gia, GiaCu || null, SanPhamMoi ? 1 : 0, NoiBat ? 1 : 0, TrangThai ? 1 : 0],
        );
        const productId = productResult.insertId;

        for (const image of images) {
            if (typeof image === 'string' && image.trim()) {
                await connection.query(
                    'INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, AnhChinh, ThuTu) VALUES (?, ?, ?, ?)',
                    [productId, image.trim(), images.indexOf(image) === 0 ? 1 : 0, images.indexOf(image) + 1],
                );
            }
        }

        const colorIds = [];
        for (const color of normalizedColors) {
            const [existing] = await connection.query('SELECT MaMau FROM MauSac WHERE TenMau = ?', [color.name]);
            let colorId = existing[0]?.MaMau;
            if (!colorId) {
                const [colorResult] = await connection.query('INSERT INTO MauSac (TenMau, MaHex) VALUES (?, ?)', [color.name, color.hex || null]);
                colorId = colorResult.insertId;
            }
            colorIds.push({ id: colorId, name: color.name });
        }

        const sizeIds = [];
        for (const size of normalizedSizes) {
            const [existing] = await connection.query('SELECT MaKichThuoc FROM KichThuoc WHERE TenKichThuoc = ?', [size]);
            let sizeId = existing[0]?.MaKichThuoc;
            if (!sizeId) {
                const [sizeResult] = await connection.query('INSERT INTO KichThuoc (TenKichThuoc) VALUES (?)', [size]);
                sizeId = sizeResult.insertId;
            }
            sizeIds.push({ id: sizeId, name: size });
        }

        for (const color of colorIds) {
            for (const size of sizeIds) {
                const sku = `SP${productId}-${color.id}-${size.id}`;
                await connection.query(
                    'INSERT INTO BienTheSanPham (MaSanPham, MaMau, MaKichThuoc, MaSKU, GiaBan, SoLuongTon) VALUES (?, ?, ?, ?, ?, ?)',
                    [productId, color.id, size.id, sku, Gia, Number(stock) || 0],
                );
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, data: { insertId: productId } });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};