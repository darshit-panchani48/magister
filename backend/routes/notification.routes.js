// routes/notification.routes.js — Notification routes

const express = require('express');
const router  = express.Router();
const { getNotifications, markAllAsRead, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/',            getNotifications);
router.put('/read-all',    markAllAsRead);   // MUST be before /:id
router.put('/:id/read',    markAsRead);
router.delete('/:id',      deleteNotification);

module.exports = router;
