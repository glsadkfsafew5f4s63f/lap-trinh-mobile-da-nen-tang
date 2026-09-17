const express = require('express');
const router = express.Router();
const controller = require('../controllers/bienthesanpham.controller');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/product/:productId', controller.getByProductId);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
