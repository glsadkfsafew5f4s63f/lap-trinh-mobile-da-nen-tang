const express = require('express');
const router = express.Router();
const controller = require('../controllers/bienthesanpham.controller');
const { requireAdmin } = require('../middleware/auth');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/product/:productId', controller.getByProductId);
router.get('/:id', controller.getById);
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.remove);

module.exports = router;
