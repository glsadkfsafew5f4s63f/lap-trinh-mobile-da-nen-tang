const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { pool, checkDatabase } = require('./db');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get('/health', async (_request, response) => {
  try {
    await checkDatabase();
    response.json({ ok: true, database: process.env.DB_NAME || 'AppBanQuanAo' });
  } catch (error) {
    response.status(503).json({ ok: false, message: 'Không kết nối được MySQL.' });
  }
});

app.get('/api/products', async (_request, response) => {
  try {
    const [rows] = await pool.query(`
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

    response.json(rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: 'Không thể tải sản phẩm.' });
  }
});

app.get('/api/products/:id/variants', async (request, response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        bt.MaBienThe AS id,
        bt.MaSanPham AS productId,
        ms.MaMau AS colorId,
        ms.TenMau AS color,
        ms.MaHex AS hex,
        kt.MaKichThuoc AS sizeId,
        kt.TenKichThuoc AS size,
        bt.MaSKU AS sku,
        COALESCE(bt.GiaBan, sp.Gia) AS price,
        bt.SoLuongTon AS stock
      FROM BienTheSanPham bt
      JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
      JOIN MauSac ms ON ms.MaMau = bt.MaMau
      JOIN KichThuoc kt ON kt.MaKichThuoc = bt.MaKichThuoc
      WHERE bt.MaSanPham = ?
      ORDER BY bt.MaBienThe
    `, [request.params.id]);

    response.json(rows);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: 'Không thể tải biến thể sản phẩm.' });
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
