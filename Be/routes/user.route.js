const router=require('express').Router(); const c=require('../controllers/user.controller'); const auth=require('../middleware/auth'); router.use(auth);
router.get('/addresses',c.addresses); router.post('/addresses',c.addAddress); router.put('/addresses/:id',c.updateAddress); router.delete('/addresses/:id',c.deleteAddress); module.exports=router;
