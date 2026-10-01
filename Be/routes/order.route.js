const router = require('express').Router();
const c = require('../controllers/order.controller');
const checkout = require('../controllers/checkout.controller');
const auth = require('../middleware/auth');
router.use(auth);
router.post('/voucher/preview', checkout.previewVoucher);
router.post('/quote', checkout.quote);
router.get('/checkout-config', (req, res) => res.json({ success: true, data: { PhiGiaoHang: Number(process.env.SHIPPING_FEE || 30000) } }));
router.post('/', (req, res, next) => {
    if (!['COD', 'CHUYEN_KHOAN', 'VNPAY', 'MOMO'].includes(req.body.PhuongThuc)) {
        return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
    }
    req.body.PhiGiaoHang = Number(process.env.SHIPPING_FEE || 30000);
    next();
}, checkout.create);
router.get('/', c.myOrders);
router.get('/:id', c.detail);
router.put('/:id/cancel', c.cancel);
module.exports = router;
