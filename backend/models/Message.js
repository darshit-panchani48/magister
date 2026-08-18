// models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Admin',
      required: true,
    },
    to: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    subject: {
      type:    String,
      trim:    true,
      default: 'Message from Admin',
    },
    message: {
      type:     String,
      required: [true, 'Message content is required'],
      trim:     true,
    },
    relatedRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'ExamRecord',
    },
    isRead: {
      type:    Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

messageSchema.index({ to: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
