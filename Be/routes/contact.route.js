const router = require('express').Router();
const controller = require('../controllers/lienhe.controller');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/', optionalAuth, controller.createFromCustomer);

module.exports = router;