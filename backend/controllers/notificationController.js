  // controllers/notificationController.js — COMPLETE

  const Notification = require('../models/Notification');

  // GET /api/notifications
  const getNotifications = async (req, res, next) => {
    try {
      const recipientModel = req.role === 'admin' ? 'Admin' : 'User';

      const notifications = await Notification.find({
        recipient: req.userId,
        recipientModel,
      })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        recipient: req.userId,
        recipientModel,
        isRead: false,
      });

      res.status(200).json({ success: true, unreadCount, notifications });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/notifications/read-all — MUST come before /:id route
  const markAllAsRead = async (req, res, next) => {
    try {
      const recipientModel = req.role === 'admin' ? 'Admin' : 'User';

      await Notification.updateMany(
        { recipient: req.userId, recipientModel, isRead: false },
        { isRead: true }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/notifications/:id/read
  const markAsRead = async (req, res, next) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.userId },
        { isRead: true },
        { new: true }
      );
      if (!notification) {
        return res
          .status(404)
          .json({ success: false, message: 'Notification not found' });
      }
      res.status(200).json({ success: true, notification });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/notifications/:id
  const deleteNotification = async (req, res, next) => {
    try {
      const notif = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.userId,
      });
      if (!notif) {
        return res
          .status(404)
          .json({ success: false, message: 'Notification not found' });
      }
      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  };

  module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };