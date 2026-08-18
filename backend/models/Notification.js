// models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      required: true,
      refPath:  'recipientModel',
    },
    recipientModel: {
      type:     String,
      required: true,
      enum:     ['User', 'Admin'],
    },
    type: {
      type: String,
      enum: [
        'RECORD_ADDED',
        'RECORD_UPDATED',
        'RECORD_DELETED_BY_USER',
        'RECORD_DELETED_BY_ADMIN',
        'ADMIN_MESSAGE',
        'PASSWORD_RESET',
      ],
      required: true,
    },
    title: {
      type:     String,
      required: true,
      trim:     true,
    },
    message: {
      type:     String,
      required: true,
      trim:     true,
    },
    examRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'ExamRecord',
    },
    triggeredBy: {
      type:    mongoose.Schema.Types.ObjectId,
      refPath: 'triggeredByModel',
    },
    triggeredByModel: {
      type: String,
      enum: ['User', 'Admin'],
    },
    isRead: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
