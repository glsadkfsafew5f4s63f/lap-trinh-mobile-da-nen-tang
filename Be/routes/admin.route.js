const router = require('express').Router();
const c = require('../controllers/admin.controller');
const staff = require('../controllers/staff.controller');
const customer = require('../controllers/customer.controller');
const dashboard = require('../controllers/adminDashboard.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const permissions = require('../config/permissions');
const allow = (domain) => role(...permissions[domain]);

router.use(auth);
router.get('/dashboard', allow('overview'), dashboard.dashboard);
router.post('/users', role('ADMIN'), staff.create);
router.get('/users', role('ADMIN'), staff.list);
router.put('/users/:id/status', role('ADMIN'), staff.updateStatus);
router.put('/users/:id/roles', role('ADMIN'), staff.updateRoles);
router.get('/customers', allow('customers'), customer.list);
router.put('/customers/:id/status', allow('customers'), customer.updateStatus);

router.get('/products', allow('products'), c.products);
router.post('/products', allow('products'), c.createProduct);
router.put('/products/:id', allow('products'), c.updateProduct);
router.get('/products/:productId/variants', allow('products'), c.variants);
router.post('/products/:productId/variants', allow('products'), c.createVariant);
router.put('/variants/:id', allow('products'), c.updateVariant);
router.get('/products/:productId/images', allow('products'), c.images);
router.post('/products/:productId/images', allow('products'), c.addImage);
router.delete('/products/:productId/images/:id', allow('products'), c.deleteImage);

router.get('/vouchers', allow('promotions'), c.vouchers);
router.post('/vouchers', allow('promotions'), c.createVoucher);
router.put('/vouchers/:id', allow('promotions'), c.updateVoucher);
router.get('/discount-programs', allow('promotions'), c.programs);
router.post('/discount-programs', allow('promotions'), c.createProgram);
router.put('/discount-programs/:id', allow('promotions'), c.updateProgram);

router.get('/orders', allow('orders'), c.orders);
router.get('/orders/:id', allow('orders'), c.orderDetail);
router.put('/orders/:id/status', allow('orders'), c.updateOrderStatus);
router.get('/reviews', allow('customers'), c.reviews);
router.put('/reviews/:id/reply', allow('customers'), c.replyReview);
router.put('/reviews/:id/status', allow('customers'), c.updateReviewStatus);
router.get('/inventory', allow('warehouse'), c.inventory);
router.get('/suppliers', allow('warehouse'), c.suppliers);
router.get('/purchase-orders', allow('warehouse'), c.purchaseOrders);
router.post('/purchase-orders', allow('warehouse'), c.purchaseCreate);
router.get('/purchase-orders/:id', allow('warehouse'), c.purchaseDetail);
router.put('/purchase-orders/:id/approve', allow('warehouse'), c.approvePurchase);
router.put('/purchase-orders/:id/cancel', allow('warehouse'), c.cancelPurchase);

module.exports = router;
