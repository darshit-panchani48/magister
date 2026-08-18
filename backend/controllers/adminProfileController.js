// controllers/adminProfileController.js — Admin profile CRUD

const AdminProfile = require('../models/AdminProfile');
const Admin = require('../models/Admin');
const cloudinary = require('../config/cloudinary');

// GET /api/admin/profile
const getAdminProfile = async (req, res, next) => {
  try {
    const profile = await AdminProfile.findOne({ admin: req.userId });
    res.status(200).json({ success: true, profile: profile || null });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/profile — Create or update admin profile
const upsertAdminProfile = async (req, res, next) => {
  try {
    const { name, email, contact, designation, department, joiningDate } =
      req.body;

    if (!name || !email || !contact) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and contact are required',
      });
    }

    let profile = await AdminProfile.findOne({ admin: req.userId });

    const profileData = {
      name,
      email,
      contact,
      designation: designation || 'select',
      department: department || 'select',
      joiningDate: joiningDate || undefined,
    };

    // Handle photo upload
    if (req.file) {
      if (profile?.photo?.publicId) {
        try {
          await cloudinary.uploader.destroy(profile.photo.publicId);
        } catch {}
      }
      profileData.photo = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    if (profile) {
      profile = await AdminProfile.findOneAndUpdate(
        { admin: req.userId },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      profile = await AdminProfile.create({
        ...profileData,
        admin: req.userId,
      });
    }

    // Update admin name
    await Admin.findByIdAndUpdate(req.userId, { name });

    res.status(200).json({
      success: true,
      message: 'Admin profile saved successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminProfile, upsertAdminProfile };