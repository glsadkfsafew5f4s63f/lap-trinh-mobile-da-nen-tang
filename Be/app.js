require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const role = require('./middleware/role');
const adminAccess = [auth, role('ADMIN', 'NHAN_VIEN')];

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Backend cửa hàng quần áo đang hoạt động' });
});

app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/products', require('./routes/product.route'));
app.use('/api/catalog', require('./routes/catalog.route'));
app.use('/api/cart', require('./routes/cart.route'));
app.use('/api/orders', require('./routes/order.route'));
app.use('/api/reviews', require('./routes/review.route'));
app.use('/api/payments', require('./routes/payment.route'));
app.use('/api/user', require('./routes/user.route'));
app.use('/api/admin', require('./routes/admin.route'));
app.use('/api/admin/catalog', require('./routes/adminCatalog.route'));
app.use('/api/vaitro', ...adminAccess, require('./routes/vaitro.route'));
app.use('/api/nguoidungvaitro', ...adminAccess, require('./routes/nguoidungvaitro.route'));
app.use('/api/lienhe', ...adminAccess, require('./routes/lienhe.route'));
app.use('/api/lichsutonkho', ...adminAccess, require('./routes/lichsutonkho.route'));
app.use('/api/thanhtoan', ...adminAccess, require('./routes/thanhtoan.route'));
app.use('/api/hoadon', ...adminAccess, require('./routes/hoadon.route'));
app.use('/api/sanphamchuongtrinhgiamgia', ...adminAccess, require('./routes/sanphamchuongtrinhgiamgia.route'));
app.use('/api/bienthechuongtrinhgiamgia', ...adminAccess, require('./routes/bienthechuongtrinhgiamgia.route'));
app.use('/api/nhacungcap', ...adminAccess, require('./routes/nhacungcap.route'));

app.use('/api/diachigiaohang', require('./routes/diachigiaohang.route'));

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
