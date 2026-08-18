// controllers/profileController.js — User profile CRUD

const Profile   = require('../models/Profile');
const User      = require('../models/User');
const cloudinary = require('../config/cloudinary');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });
    res.status(200).json({ success: true, profile: profile || null });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile — Create or update profile
const upsertProfile = async (req, res, next) => {
  try {
    const {
      teacherId, name, email, contact,
      designation, department, joiningDate,
      accountNumber,
    } = req.body;

    if (!teacherId || !name || !email || !contact || !designation || !department || !joiningDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled',
      });
    }

    let profile = await Profile.findOne({ user: req.userId });

    const profileData = {
      teacherId, name, email, contact,
      designation, department, joiningDate,
      accountNumber: accountNumber || '',
    };

    // Handle photo upload
    if (req.file) {
      if (profile?.photo?.publicId) {
        try { await cloudinary.uploader.destroy(profile.photo.publicId); } catch {}
      }
      profileData.photo = {
        url:      req.file.path,
        publicId: req.file.filename,
      };
    }

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.userId },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      profile = await Profile.create({ ...profileData, user: req.userId });
    }



    // Mark profile complete
    await User.findByIdAndUpdate(req.userId, {
      isProfileComplete: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, upsertProfile };
    