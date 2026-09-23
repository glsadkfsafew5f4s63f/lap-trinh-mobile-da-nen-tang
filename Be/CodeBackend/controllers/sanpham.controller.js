const Sanpham = require('../models/sanpham.model');
const db = require('../common/db');

exports.getAll = async (req, res) => {
    try {
        const data = await Sanpham.getAll();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Sanpham.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    const { images = [], colors = [], sizes = [], stock = 0, ...productData } = req.body;
    const name = String(productData.TenSanPham || '').trim();
    const price = Number(productData.Gia);
    const availableStock = Number(stock);
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(availableStock) || availableStock < 0) {
        return res.status(400).json({ success: false, message: 'Tên sản phẩm, giá và tồn kho không hợp lệ.' });
    }
    productData.TenSanPham = name;
    productData.Gia = price;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        if (productData.MaThuongHieu !== null && productData.MaThuongHieu !== undefined) {
            const brandId = Number(productData.MaThuongHieu);
            const [brands] = await connection.query('SELECT MaThuongHieu FROM ThuongHieu WHERE MaThuongHieu = ? LIMIT 1', [brandId]);
            productData.MaThuongHieu = brands.length > 0 ? brandId : null;
        }
        const [productResult] = await connection.query('INSERT INTO SanPham SET ?', [productData]);
        const productId = productResult.insertId;

        for (const [index, image] of images.entries()) {
            if (typeof image !== 'string' || !image.trim()) continue;
            await connection.query(
                'INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, AnhChinh, ThuTu) VALUES (?, ?, ?, ?)',
                [productId, image.trim(), index === 0 ? 1 : 0, index + 1]
            );
        }

        const colorRows = [];
        for (const color of colors) {
            const colorName = String(color?.name || '').trim();
            if (!colorName) continue;
            const [existing] = await connection.query('SELECT MaMau FROM MauSac WHERE TenMau = ? LIMIT 1', [colorName]);
            let colorId = existing[0]?.MaMau;
            if (!colorId) {
                const [created] = await connection.query('INSERT INTO MauSac (TenMau, MaHex) VALUES (?, ?)', [colorName, color?.hex || '#808080']);
                colorId = created.insertId;
            }
            colorRows.push({ id: colorId, name: colorName });
        }

        const sizeRows = [];
        for (const size of sizes) {
            const sizeName = String(size || '').trim();
            if (!sizeName) continue;
            const [existing] = await connection.query('SELECT MaKichThuoc FROM KichThuoc WHERE TenKichThuoc = ? LIMIT 1', [sizeName]);
            let sizeId = existing[0]?.MaKichThuoc;
            if (!sizeId) {
                const [created] = await connection.query('INSERT INTO KichThuoc (TenKichThuoc) VALUES (?)', [sizeName]);
                sizeId = created.insertId;
            }
            sizeRows.push({ id: sizeId, name: sizeName });
        }

        const variantStock = Math.max(0, Number(stock) || 0);
        for (const color of colorRows) {
            for (const size of sizeRows) {
                const sku = `SP${productId}-${color.id}-${size.id}`;
                await connection.query(
                    `INSERT INTO BienTheSanPham (MaSanPham, MaMau, MaKichThuoc, MaSKU, GiaBan, SoLuongTon)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [productId, color.id, size.id, sku, productData.Gia, variantStock]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Thêm thành công', data: { insertId: productId, affectedRows: 1 } });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.update = async (req, res) => {
    try {
        const result = await Sanpham.update(req.params.id, req.body);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const result = await Sanpham.delete(req.params.id);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.search = async (req, res) => {
    try {
        const keyword = `%${req.query.keyword || ''}%`;
        const data = await Sanpham.search(keyword);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
