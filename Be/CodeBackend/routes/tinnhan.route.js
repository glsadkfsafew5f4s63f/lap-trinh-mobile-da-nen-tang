const express = require('express');
const controller = require('../controllers/tinnhan.controller');

const router = express.Router();

router.get('/conversations', controller.getConversations);
router.get('/:userId', controller.getMessages);
router.post('/', controller.create);
router.post('/:userId/read', controller.markRead);

module.exports = router;
