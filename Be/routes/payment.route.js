const router = require('express').Router();
const c = require('../controllers/payment.controller');
const auth = require('../middleware/auth');

router.post('/momo/ipn', c.momoIpn);
router.use(auth);
router.post('/:orderId/momo', c.createMomoPayment);
router.post('/:orderId/retry', c.retry);

module.exports = router;
