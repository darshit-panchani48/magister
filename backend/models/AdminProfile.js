// models/AdminProfile.js

const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema(
  {
    admin: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Admin',
      required: true,
      unique:   true,
    },
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      trim:      true,
      lowercase: true,
    },
    contact: {
      type:     String,
      required: [true, 'Contact is required'],
      trim:     true,
    },
    designation: {
      type:    String,
      trim:    true,
      default: 'select',
    },
    department: {
      type:    String,
      trim:    true,
      default: 'select',
    },
    joiningDate: {
      type: Date,
    },
    photo: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
