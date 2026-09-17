require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./common/db');

const app = express();

async function ensurePaymentColumns() {
    const columns = ['TienCoc', 'TienConLai', 'TrangThaiThanhToan'];
    for (const column of columns) {
        const [rows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'DonHang' AND COLUMN_NAME = ?`,
            [column]
        );
        if (Number(rows[0].total) > 0) {
            continue;
        }

        const definition = column === 'TrangThaiThanhToan'
            ? "ENUM('ChuaCoc', 'DaCoc', 'DaThanhToan') DEFAULT 'ChuaCoc'"
            : 'DECIMAL(12,2) NOT NULL DEFAULT 0';
        await db.query(`ALTER TABLE DonHang ADD COLUMN ${column} ${definition}`);
    }
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    db.query('SELECT 1 AS ok')
        .then(() => res.json({ success: true, database: process.env.DB_NAME || 'AppBanQuanAo' }))
        .catch((error) => {
            console.error(error.message);
            res.status(503).json({ success: false, message: 'Không kết nối được MySQL' });
        });
});

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/products', require('./routes/sanpham.route'));
app.use('/api/cart', require('./routes/giohang.route'));
app.use('/api/orders', require('./routes/donhang.route'));

app.use('/api/bienthesanpham', require('./routes/bienthesanpham.route'));
app.use('/api/danhgia', require('./routes/danhgia.route'));
app.use('/api/danhmuc', require('./routes/danhmuc.route'));
app.use('/api/diachi', require('./routes/diachi.route'));
app.use('/api/hinhanhsanpham', require('./routes/hinhanhsanpham.route'));
app.use('/api/kichthuoc', require('./routes/kichthuoc.route'));
app.use('/api/mausac', require('./routes/mausac.route'));
app.use('/api/sanpham', require('./routes/sanpham.route'));
app.use('/api/thuonghieu', require('./routes/thuonghieu.route'));
app.use('/api/vaitro', require('./routes/vaitro.route'));
app.use('/api/yeuthich', require('./routes/yeuthich.route'));

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Không tìm thấy API: ${req.method} ${req.originalUrl}`
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = Number(process.env.PORT || 7000);
ensurePaymentColumns()
    .then(() => app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
    }))
    .catch((error) => {
        console.error('Không thể chuẩn bị schema thanh toán:', error.message);
        process.exit(1);
    });
