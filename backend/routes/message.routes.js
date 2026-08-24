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

// ── DELETE /api/messages/:id — Delete a specific message ─────────
router.delete('/:id', async (req, res, next) => {
  try {
    const Message = require('../models/Message');
    
    // हमने recipient चेक हटा दिया है ताकि आईडी सही मिलने पर तुरंत डिलीट हो जाए
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found in database' });
    }
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
