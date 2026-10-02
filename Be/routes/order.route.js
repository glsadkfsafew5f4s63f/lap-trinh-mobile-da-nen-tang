const router = require('express').Router();
const c = require('../controllers/order.controller');
const checkout = require('../controllers/checkout.controller');
const orderPayments = require('../utils/orderPayments');
const auth = require('../middleware/auth');
router.use(auth);
router.post('/voucher/preview', checkout.previewVoucher);
router.post('/quote', checkout.quote);
router.get('/checkout-config', (req, res) => res.json({ success: true, data: { PhiGiaoHang: Number(process.env.SHIPPING_FEE || 30000) } }));
router.post('/', (req, res, next) => {
    if (!['COD', 'MOMO'].includes(req.body.PhuongThuc)) {
        return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
    }
    req.body.PhiGiaoHang = Number(process.env.SHIPPING_FEE || 30000);
    next();
}, checkout.create);
router.get('/', c.myOrders);
router.post('/:orderId/return-requests', require('../controllers/returnRequest.controller').createForCustomer);
router.get('/:orderId/return-requests', require('../controllers/returnRequest.controller').getForCustomer);
router.get('/:id', c.detail);
router.put('/:id/cancel', async (req, res) => {
    try {
        const result = await orderPayments.cancelOrder({ orderId: Number(req.params.id), userId: req.user.id });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
module.exports = router;
