const express = require('express');
const router = express.Router();
const controller = require('../controllers/catalog.controller');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id/variants', async (req, res) => {
	try {
		const db = require('../common/db');
		const [rows] = await db.query(`
			SELECT bt.MaBienThe AS id, bt.MaSanPham AS productId,
				ms.MaMau AS colorId, ms.TenMau AS color, ms.MaHex AS hex,
				kt.MaKichThuoc AS sizeId, kt.TenKichThuoc AS size,
				bt.MaSKU AS sku, COALESCE(bt.GiaBan, sp.Gia) AS price, bt.SoLuongTon AS stock
			FROM BienTheSanPham bt
			JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
			JOIN MauSac ms ON ms.MaMau = bt.MaMau
			JOIN KichThuoc kt ON kt.MaKichThuoc = bt.MaKichThuoc
			WHERE bt.MaSanPham = ?
			ORDER BY bt.MaBienThe
		`, [req.params.id]);
		res.json(rows);
	} catch (error) {
		res.status(500).json({ message: 'Không thể tải biến thể sản phẩm.', detail: error.message });
	}
});

module.exports = router;