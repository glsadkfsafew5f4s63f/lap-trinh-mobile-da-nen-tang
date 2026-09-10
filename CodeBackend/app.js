require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Backend cửa hàng quần áo đang hoạt động' });
});

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/products', require('./routes/product.route'));
app.use('/api/cart', require('./routes/cart.route'));
app.use('/api/orders', require('./routes/order.route'));

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
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
