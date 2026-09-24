const router=require('express').Router(); const c=require('../controllers/catalog.controller');
router.get('/categories',c.categories); router.get('/brands',c.brands); router.get('/colors',c.colors); router.get('/sizes',c.sizes);
module.exports=router;
