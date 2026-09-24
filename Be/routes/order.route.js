const router=require('express').Router(); const c=require('../controllers/order.controller'); const auth=require('../middleware/auth'); router.use(auth);
router.post('/voucher/preview',c.previewVoucher); router.post('/',c.create); router.get('/',c.myOrders); router.get('/:id',c.detail); router.put('/:id/cancel',c.cancel); module.exports=router;
