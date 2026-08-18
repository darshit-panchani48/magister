// controllers/authController.js — COMPLETE with direct password reset

const User = require('../models/User');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { appId, password, role } = req.body;
    if (!appId || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'APP ID, password and role are required',
      });
    }

    const Model = role === 'admin' ? Admin : User;
    const entity = await Model.findOne({
      appId: appId.trim().toUpperCase(),
    }).select('+password');

    if (!entity) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid APP ID or Password' });
    }
    if (entity.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Contact admin.',
      });
    }

    const isMatch = await entity.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid APP ID or Password' });
    }

    entity.lastLogin = new Date();
    await entity.save();

    const token = generateToken(entity._id, role, entity.appId);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: entity._id,
        appId: entity.appId,
        role,
        ...(role === 'user' && { isProfileComplete: entity.isProfileComplete }),
        ...(role === 'admin' && { name: entity.name }),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, role: req.role, user: req.user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password — Direct reset, no email needed
const forgotPassword = async (req, res, next) => {
  try {
    const { appId, newPassword, confirmPassword, role } = req.body;

    if (!appId || !newPassword || !confirmPassword || !role) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const Model = role === 'admin' ? Admin : User;
    const entity = await Model.findOne({ appId: appId.trim().toUpperCase() });

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this APP ID',
      });
    }

    entity.password = newPassword; // pre-save hook hashes it
    await entity.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login.',
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password — Logged in user changes password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Both fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const Model = req.role === 'admin' ? Admin : User;
    const entity = await Model.findById(req.userId).select('+password');
    const isMatch = await entity.matchPassword(currentPassword);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Current password is incorrect' });
    }

    entity.password = newPassword;
    await entity.save();

    res
      .status(200)
      .json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, forgotPassword, changePassword };