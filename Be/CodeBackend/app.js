require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./common/db');

const app = express();
const productImageDirectory = path.join(__dirname, 'public', 'images', 'products');
fs.mkdirSync(productImageDirectory, { recursive: true });
const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, productImageDirectory),
        filename: (_req, file, callback) => {
            const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '-');
            callback(null, `${Date.now()}-${safeName}`);
        },
    }),
    limits: { files: 10, fileSize: 5 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

app.post('/api/images/upload', upload.array('images', 10), (req, res) => {
    const files = req.files || [];
    res.status(201).json({
        success: true,
        data: files.map((file) => `images/products/${file.filename}`),
    });
});

app.get('/health', (req, res) => {
    db.query('SELECT 1 AS ok')
        .then(() => res.json({ success: true, database: process.env.DB_NAME || 'AppBanQuanAo' }))
        .catch((error) => {
            console.error(error.message);
            res.status(503).json({ success: false, message: 'Không kết nối được MySQL' });
        });
});

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/products', require('./routes/catalog.route'));
app.use('/api/cart', require('./routes/giohang.route'));
app.use('/api/orders', require('./routes/donhang.route'));

app.use('/api/bienthesanpham', require('./routes/bienthesanpham.route'));
app.use('/api/danhgia', require('./routes/danhgia.route'));
app.use('/api/danhmuc', require('./routes/danhmuc.route'));
app.use('/api/diachi', require('./routes/diachi.route'));
app.use('/api/donhang', require('./routes/donhang.route'));
app.use('/api/hinhanhsanpham', require('./routes/hinhanhsanpham.route'));
app.use('/api/kichthuoc', require('./routes/kichthuoc.route'));
app.use('/api/mausac', require('./routes/mausac.route'));
app.use('/api/nguoidung', require('./routes/nguoidung.route'));
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
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
