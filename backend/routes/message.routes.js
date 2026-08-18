// routes/message.routes.js — Message routes

const express = require('express');
const router  = express.Router();
const { sendMessage, getMyMessages, markMessageRead, getSentMessages,sendAppMessageOnly } = require('../controllers/messageController');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly, userOnly } = require('../middleware/adminMiddleware');

router.use(protect);

router.post('/',         adminOnly, sendMessage);
router.get('/sent',      adminOnly, getSentMessages);
router.get('/',          userOnly,  getMyMessages);
router.put('/:id/read',  userOnly,  markMessageRead);
router.post('/app-only', protect, adminOnly, sendAppMessageOnly);

module.exports = router;
