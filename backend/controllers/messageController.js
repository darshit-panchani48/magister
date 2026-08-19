// controllers/messageController.js — Complete with Separate Email and App-Only Endpoints

const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// 1. Send Message WITH Email (For Profile Big Button)
const sendMessage = async (req, res, next) => {
  try {
    const { to, message, subject, relatedRecord } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Recipient and message are required' });
    }

    const user = await User.findById(to);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Save Message
    const newMessage = await Message.create({
      from: req.userId,
      to,
      subject: subject || 'Message from Admin',
      message,
      relatedRecord: relatedRecord || undefined,
    });

    // Create Notification
    await Notification.create({
      recipient: to,
      recipientModel: 'User',
      type: 'ADMIN_MESSAGE',
      title: subject || 'New Message from Admin',
      message,
      triggeredBy: req.userId,
      triggeredByModel: 'Admin',
    });

    // Send Gmail Notification
    let userEmail = null;
    try {
      const profile = await require('../models/Profile').findOne({ user: to });
      userEmail = profile?.email || null;
    } catch (e) {}

    if (userEmail) {
      try {
        await sendEmail({
          to: userEmail,
          subject: subject || 'New Message from Admin — Magister',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <div style="background:#2563eb;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                <h1 style="color:#fff;margin:0;font-style:italic">Magister</h1>
                <p style="color:#bfdbfe;margin:4px 0 0;font-size:12px">Exam Remuneration Management System</p>
              </div>
              <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
                <p style="color:#374151;font-size:14px;margin:0 0 8px">Hello,</p>
                <p style="color:#374151;font-size:14px;margin:0 0 16px">You have received a new message from Admin:</p>
                <div style="background:#f3f4f6;border-left:3px solid #2563eb;padding:14px 16px;border-radius:0 6px 6px 0;margin-bottom:20px">
                  <strong style="color:#111827;font-size:13px">${subject || 'Message from Admin'}</strong>
                  <p style="color:#374151;font-size:13px;margin:8px 0 0;line-height:1.6">${message}</p>
                </div>
                <p style="color:#6b7280;font-size:12px;margin:0">Please login to Magister to view and reply.</p>
              </div>
              <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:12px">
                ASSC · Atmanand Saraswati Science College, Surat
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email send failed (non-critical):', emailErr.message);
      }
    }

    await User.findByIdAndUpdate(to, { hasUnreadNotifications: true });

    res.status(201).json({
      success: true,
      message: 'Message & Email sent successfully',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Send In-App Notification ONLY - NO EMAIL (For Table Row Small Icons)
const sendAppMessageOnly = async (req, res, next) => {
  try {
    const { to, message, subject, relatedRecord } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Recipient and message are required' });
    }

    const user = await User.findById(to);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Save Message (NO EMAIL TRIGGERED)
    const newMessage = await Message.create({
      from: req.userId,
      to,
      subject: subject || 'Message from Admin',
      message,
      relatedRecord: relatedRecord || undefined,
    });

    // Create Notification Only
    await Notification.create({
      recipient: to,
      recipientModel: 'User',
      type: 'ADMIN_MESSAGE',
      title: subject || 'New Message from Admin',
      message,
      triggeredBy: req.userId,
      triggeredByModel: 'Admin',
    });

    await User.findByIdAndUpdate(to, { hasUnreadNotifications: true });

    res.status(201).json({
      success: true,
      message: 'In-App notification sent successfully',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages — User gets their messages
const getMyMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ to: req.userId })
      .populate('from', 'appId name')
      .populate('relatedRecord', 'university examCategory date')
      .sort({ createdAt: -1 });

    const unreadCount = await Message.countDocuments({
      to: req.userId,
      isRead: false,
    });

    res.status(200).json({ success: true, count: messages.length, unreadCount, messages });
  } catch (error) {
    next(error);
  }
};

// PUT /api/messages/:id/read
const markMessageRead = async (req, res, next) => {
  try {
    const msg = await Message.findOneAndUpdate(
      { _id: req.params.id, to: req.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: msg });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/sent — Admin sees sent messages
const getSentMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ from: req.userId })
      .populate('to', 'appId')
      .populate('relatedRecord', 'university examCategory')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  sendAppMessageOnly,
  getMyMessages,
  markMessageRead,
  getSentMessages,
};