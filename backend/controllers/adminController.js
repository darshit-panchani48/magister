// controllers/adminController.js — FIXED: Accurate hour calculations and clean response

const User = require('../models/User');
const Profile = require('../models/Profile');
const ExamRecord = require('../models/ExamRecord');
const Notification = require('../models/Notification');
const generateAppId = require('../utils/generateAppId');
const { calcTotalHours } = require('../utils/calcHours');

// POST /api/admin/members
const createMember = async (req, res, next) => {
  try {
    const { appId, password, confirmPassword } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const finalAppId = appId?.trim()
      ? appId.trim().toUpperCase()
      : await generateAppId();

    const existing = await User.findOne({ appId: finalAppId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `APP ID ${finalAppId} already exists`,
      });
    }

    const user = await User.create({
      appId: finalAppId,
      password,
      createdBy: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      user: { id: user._id, appId: user.appId },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/members
const getAllMembers = async (req, res, next) => {
  try {
    const {
      search = '',
      field = 'all',
      status = '',
      department = '',
      page = 1,
      limit = 10,
    } = req.query;

    const userQuery = {};
    if (status === 'active') userQuery.isActive = true;
    if (status === 'inactive') userQuery.isActive = false;

    const allUsers = await User.find(userQuery).sort({ createdAt: -1 });

    let data = await Promise.all(
      allUsers.map(async (u) => {
        const profile = await Profile.findOne({ user: u._id });

        // Member list: only Completed records count
        const records = await ExamRecord.find({
          user: u._id,
          isDeleted: false,
          status: 'Completed',
        });

        // 🌟 Returns clean string like "19h" or "19h 35m" directly
        const totalHours = calcTotalHours(records);

        return {
          id: u._id,
          appId: u.appId,
          isActive: u.isActive,
          isProfileComplete: u.isProfileComplete,
          name: profile?.name || '',
          email: profile?.email || '',
          designation: profile?.designation || '',
          department: profile?.department || '',
          photo: profile?.photo?.url || '',
          totalRecords: records.length,
          totalHours,
          records, // 🌟 Included records so frontend can safely parse minutes if needed
          createdAt: u.createdAt,
        };
      })
    );

    // Search on joined data
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      if (field === 'all') {
        data = data.filter(
          (d) =>
            d.appId?.toLowerCase().includes(s) ||
            d.name?.toLowerCase().includes(s) ||
            d.email?.toLowerCase().includes(s) ||
            d.department?.toLowerCase().includes(s) ||
            d.designation?.toLowerCase().includes(s)
        );
      } else if (field === 'name') {
        data = data.filter((d) => d.name?.toLowerCase().includes(s));
      } else if (field === 'appId') {
        data = data.filter((d) => d.appId?.toLowerCase().includes(s));
      } else if (field === 'email') {
        data = data.filter((d) => d.email?.toLowerCase().includes(s));
      } else if (field === 'department') {
        data = data.filter((d) => d.department?.toLowerCase().includes(s));
      } else if (field === 'designation') {
        data = data.filter((d) => d.designation?.toLowerCase().includes(s));
      }
    }

    if (department) {
      data = data.filter(
        (d) => d.department?.toLowerCase() === department.toLowerCase()
      );
    }

    const total = data.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paged = data.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: paged,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/members/:id/records
const getMemberRecords = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const profile = await Profile.findOne({ user: id });

    // Admin sees Completed + Cancelled (not Draft, not hard-deleted)
    const records = await ExamRecord.find({
      user: id,
      isDeleted: false,
      status: { $in: ['Completed', 'Cancelled'] },
    }).sort({ date: -1 });

    // Total hours: only from Completed records
    const completedRecords = records.filter((r) => r.status === 'Completed');
    const totalHours = calcTotalHours(completedRecords);

    res.status(200).json({
      success: true,
      user: { _id: user._id, appId: user.appId, isActive: user.isActive },
      profile: profile || null,
      records,
      totalHours,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/members/:id/toggle-status
const toggleMemberStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await Notification.create({
      recipient: user._id,
      recipientModel: 'User',
      type: 'ADMIN_MESSAGE',
      title: user.isActive ? 'Account Activated' : 'Account Deactivated',
      message: user.isActive
        ? 'Your account has been activated by admin.'
        : 'Your account has been deactivated by admin. Contact admin for help.',
      triggeredBy: req.userId,
      triggeredByModel: 'Admin',
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/records/:id
const adminDeleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const record = await ExamRecord.findOne({
      _id: id,
      isDeleted: false,
      status: { $in: ['Completed', 'Draft'] },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or already cancelled',
      });
    }

    // Cancelled so user sees it — isDeleted stays false
    record.status = 'Cancelled';
    record.isDeleted = false;
    record.deletedReason = reason || 'Deleted by admin';
    record.deletedAt = new Date();
    await record.save();

    await Notification.create({
      recipient: record.user,
      recipientModel: 'User',
      type: 'RECORD_DELETED_BY_ADMIN',
      title: 'Exam Record Deleted by Admin',
      message: `Your exam record for ${record.university} — ${record.examCategory} was deleted. Reason: ${record.deletedReason}`,
      examRecord: record._id,
      triggeredBy: req.userId,
      triggeredByModel: 'Admin',
    });

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberRecords,
  toggleMemberStatus,
  adminDeleteRecord,
};