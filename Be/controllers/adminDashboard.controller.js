const db = require('../common/db');

exports.dashboard = async (_req, res) => {
    try {
        const [[users], [products], [orders], [revenue], [stock], [pending], [lowStock], [activeProducts]] = await Promise.all([
            db.query('SELECT COUNT(*) total FROM NguoiDung'),
            db.query('SELECT COUNT(*) total FROM SanPham'),
            db.query('SELECT COUNT(*) total FROM DonHang'),
            db.query("SELECT COALESCE(SUM(ThanhTien), 0) total FROM DonHang WHERE TrangThaiDonHang = 'DA_GIAO'"),
            db.query('SELECT COALESCE(SUM(SoLuongTon), 0) ton, COALESCE(SUM(SoLuongTamGiu), 0) tamgiu FROM BienTheSanPham'),
            db.query("SELECT COUNT(*) total FROM DonHang WHERE TrangThaiDonHang = 'CHO_XAC_NHAN'"),
            db.query('SELECT COUNT(*) total FROM BienTheSanPham WHERE GREATEST(SoLuongTon - SoLuongTamGiu, 0) <= 10'),
            db.query('SELECT COUNT(DISTINCT MaSanPham) total FROM BienTheSanPham WHERE SoLuongTon > SoLuongTamGiu')
        ]);

        const [statusBreakdown] = await db.query(`
            SELECT TrangThaiDonHang status, COUNT(*) total
            FROM DonHang
            GROUP BY TrangThaiDonHang
        `);
        const [monthlyRevenue] = await db.query(`
            SELECT DATE_FORMAT(NgayDat, '%Y-%m') period,
                   COALESCE(SUM(ThanhTien), 0) revenue,
                   COUNT(*) orders
            FROM DonHang
            WHERE NgayDat >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY DATE_FORMAT(NgayDat, '%Y-%m')
            ORDER BY period
        `);
        const [categoryRevenue] = await db.query(`
            SELECT dm.MaDanhMuc id, dm.TenDanhMuc name,
                   COALESCE(SUM(ctdh.ThanhTien), 0) revenue
            FROM ChiTietDonHang ctdh
            JOIN BienTheSanPham bt ON bt.MaBienThe = ctdh.MaBienThe
            JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
            JOIN DanhMuc dm ON dm.MaDanhMuc = sp.MaDanhMuc
            JOIN DonHang dh ON dh.MaDonHang = ctdh.MaDonHang
            WHERE dh.TrangThaiDonHang <> 'DA_HUY'
            GROUP BY dm.MaDanhMuc, dm.TenDanhMuc
            ORDER BY revenue DESC
            LIMIT 6
        `);
        const [recentOrders] = await db.query(`
            SELECT MaDonHang, MaDonHangCode, MaNguoiDung, ThanhTien,
                   TrangThaiDonHang, TrangThaiThanhToan, NgayDat
            FROM DonHang
            ORDER BY NgayDat DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                users: Number(users.total),
                products: Number(products.total),
                orders: Number(orders.total),
                revenue: Number(revenue.total),
                stock: { ton: Number(stock.ton), tamgiu: Number(stock.tamgiu) },
                pendingConfirmation: Number(pending.total),
                lowStock: Number(lowStock.total),
                activeProducts: Number(activeProducts.total),
                statusBreakdown,
                monthlyRevenue,
                categoryRevenue,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
