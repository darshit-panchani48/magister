// controllers/examController.js — Complete & Fixed

const ExamRecord = require('../models/ExamRecord');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const { calcTotalHours } = require('../utils/calcHours');

const notifyAdmins = async (type, title, message, examId, userId) => {
  try {
    const admins = await Admin.find({ isActive: true });
    await Promise.all(admins.map(admin =>
      Notification.create({
        recipient: admin._id, recipientModel: 'Admin',
        type, title, message, examRecord: examId,
        triggeredBy: userId, triggeredByModel: 'User',
      })
    ));
  } catch (e) { console.error('Notify admins error:', e.message); }
};

const createExam = async (req, res, next) => {
  try {
    const {
      university, department, examCategory, date, role, block, room,
      examDetails, status, recordType, labDuty, generalDuty,
    } = req.body;

    if (!university || !department || !examCategory || !date || !role || !block) {
      return res.status(400).json({ success: false, message: 'All basic fields are required' });
    }

    const rType = recordType || 'exam';
    if (rType === 'exam' && (!examDetails || !Array.isArray(examDetails) || examDetails.length === 0)) {
      return res.status(400).json({ success: false, message: 'At least one year section must be filled' });
    }

    const finalStatus = status === 'Draft' ? 'Draft' : 'Completed';

    const record = await ExamRecord.create({
      user: req.userId,
      recordType: rType,
      university, department, examCategory,
      date: new Date(date),
      role, block, 
      room: role === 'Other' ? '' : (room || ''),
      examDetails: examDetails || [],
      labDuty:     rType === 'lab'     ? labDuty     : null,
      generalDuty: rType === 'general' ? generalDuty : null,
      status: finalStatus,
    });

    if (finalStatus === 'Completed') {
      const typeLabel = rType === 'lab' ? 'Lab Duty' : rType === 'general' ? 'General Duty' : 'Exam Record';
      await notifyAdmins('RECORD_ADDED', `New ${typeLabel} Added`,
        `${req.user.appId} added: ${department} - ${university} — ${examCategory}`,
        record._id, req.userId
      );
    }

    res.status(201).json({ success: true, message: 'Record created', record });
  } catch (error) { next(error); }
};

const getMyExams = async (req, res, next) => {
  try {
    const {
      search = '', field = 'all',
      role:      roleFilter   = '',
      date:      dateFilter   = '',
      status:    statusFilter = '',
      recordType: typeFilter  = '',
      page = 1, limit = 10,
    } = req.query;

    const query = { user: req.userId, isDeleted: false };

    if (search.trim()) {
      const rx = { $regex: search.trim(), $options: 'i' };
      if (field === 'all') {
        query.$or = [
          { university: rx }, { department: rx }, { examCategory: rx },
          { role: rx }, { block: rx }, { room: rx },
          { 'examDetails.examName': rx }, { 'examDetails.subject': rx },
          { 'labDuty.labName': rx }, { 'labDuty.examName': rx },
          { 'generalDuty.location': rx }, { 'generalDuty.roleType': rx },
        ];
      } else if (field === 'university')   { query.university   = rx; }
      else if   (field === 'department')   { query.department   = rx; }
      else if   (field === 'examCategory') { query.examCategory = rx; }
      else if   (field === 'role')         { query.role         = rx; }
      else if   (field === 'block')        { query.block        = rx; }
      else if   (field === 'room')         { query.room         = rx; }
      else if   (field === 'examName')     { query['examDetails.examName'] = rx; }
      else if   (field === 'subject')      { query['examDetails.subject']  = rx; }
    }

    if (roleFilter)   query.role       = roleFilter;
    if (statusFilter) query.status     = statusFilter;
    if (typeFilter)   query.recordType = typeFilter;

    if (dateFilter) {
      const start = new Date(dateFilter);
      const end   = new Date(dateFilter);
      end.setDate(end.getDate() + 1);
      query.date  = { $gte: start, $lt: end };
    }

    const skip    = (Number(page) - 1) * Number(limit);
    const records = await ExamRecord.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total   = await ExamRecord.countDocuments(query);

    const allCompleted = await ExamRecord.find({
      user: req.userId, isDeleted: false, status: 'Completed',
    });
    const totalExams = allCompleted.length;
    const totalHours = calcTotalHours(allCompleted);

    const now           = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth      = allCompleted.filter(r => new Date(r.date) >= thisMonthStart);
    const lastMonth      = allCompleted.filter(r => new Date(r.date) >= lastMonthStart && new Date(r.date) < thisMonthStart);
    const thisMH = calcTotalHours(thisMonth);
    const lastMH = calcTotalHours(lastMonth);

    res.status(200).json({
      success: true, count: records.length, total,
      page: Number(page), pages: Math.ceil(total / Number(limit)),
      records,
      stats: {
        totalExams, totalHours,
        requiredHours: 0, remainingHours: 0,
        thisMonth: {
          exams: thisMonth.length, hours: thisMH,
          examsChangePercent: lastMonth.length ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100) : 0,
          hoursChangePercent: lastMH ? Math.round(((thisMH - lastMH) / lastMH) * 100) : 0,
        },
      },
    });
  } catch (error) { next(error); }
};

const getExamById = async (req, res, next) => {
  try {
    const record = await ExamRecord.findOne({ _id: req.params.id, isDeleted: false });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (req.role !== 'admin' && String(record.user) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, record });
  } catch (error) { next(error); }
};

const updateExam = async (req, res, next) => {
  try {
    const record = await ExamRecord.findOne({ _id: req.params.id, user: req.userId, isDeleted: false });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found or no permission' });
    if (record.status === 'Cancelled') return res.status(403).json({ success: false, message: 'Cancelled records cannot be edited' });

    const {
      university, department, examCategory, date, role, block, room,
      examDetails, status, recordType, labDuty, generalDuty,
    } = req.body;

    const finalStatus = status === 'Draft' ? 'Draft' : 'Completed';

    Object.assign(record, {
      university:   university   !== undefined ? university   : record.university,
      department:   department   !== undefined ? department   : record.department,
      examCategory: examCategory !== undefined ? examCategory : record.examCategory,
      date:         date         !== undefined ? new Date(date) : record.date,
      role:         role         !== undefined ? role         : record.role,
      block:        block        !== undefined ? block        : record.block,
      room:         role === 'Other' ? '' : (room !== undefined ? room : record.room),
      recordType:   recordType   !== undefined ? recordType   : record.recordType,
      examDetails:  examDetails  !== undefined ? examDetails  : record.examDetails,
      labDuty:      labDuty      !== undefined ? labDuty      : record.labDuty,
      generalDuty:  generalDuty  !== undefined ? generalDuty  : record.generalDuty,
      status:       finalStatus,
    });

    await record.save();

    if (finalStatus === 'Completed') {
      await notifyAdmins('RECORD_UPDATED', 'Exam Record Updated',
        `${req.user.appId} updated: ${department} - ${university} — ${examCategory}`,
        record._id, req.userId
      );
    }
    res.status(200).json({ success: true, message: 'Record updated', record });
  } catch (error) { next(error); }
};

const deleteExam = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const record = await ExamRecord.findOne({ _id: req.params.id, user: req.userId, isDeleted: false });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found or no permission' });
    record.isDeleted = true;
    record.deletedReason = reason || 'No reason';
    record.deletedAt = new Date();
    await record.save();
    await notifyAdmins('RECORD_DELETED_BY_USER', 'Record Deleted by User',
      `${req.user.appId} deleted: ${record.university}. Reason: ${record.deletedReason}`,
      record._id, req.userId
    );
    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) { next(error); }
};

module.exports = { createExam, getMyExams, getExamById, updateExam, deleteExam };