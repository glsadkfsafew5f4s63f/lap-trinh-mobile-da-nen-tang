const express = require('express');
const router = express.Router();
const controller = require('../controllers/donhang.controller');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.post('/checkout', controller.checkout);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
