const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getNonLus } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

router.get('/non-lus', protect, getNonLus);
router.get('/:orderId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;