// models/Profile.js

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },

    teacherId: {
      type:     String,
      required: [true, 'Teacher ID is required'],
      trim:     true,
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
      type:     String,
      required: [true, 'Designation is required'],
      trim:     true,
    },
    department: {
      type:     String,
      required: [true, 'Department is required'],
      trim:     true,
    },
    joiningDate: {
      type:     Date,
      required: [true, 'Joining date is required'],
    },
    accountNumber: {
      type:  String,
      trim:  true,
      default: '',
    },
    photo: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
