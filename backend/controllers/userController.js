const ExamRecord = require('../models/ExamRecord');
const Profile    = require('../models/Profile');
const { calcRecordMins, calcTotalHours, formatHours } = require('../utils/calcHours');

const getDashboard = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });
    const completedRecords = await ExamRecord.find({ user: req.userId, isDeleted: false, status: 'Completed' });
    const allRecords = await ExamRecord.find({ user: req.userId, isDeleted: false }).sort({ createdAt: -1 });

    const totalExams = completedRecords.length;
    const totalHours = calcTotalHours(completedRecords);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonth = completedRecords.filter(r => new Date(r.date) >= thisMonthStart);
    const lastMonth = completedRecords.filter(r => new Date(r.date) >= lastMonthStart && new Date(r.date) < thisMonthStart);

    const thisMH = calcTotalHours(thisMonth);
    const lastMH = calcTotalHours(lastMonth);

    // Monthly activity — last 6 months
    const monthly = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = 0;
    }
    completedRecords.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthly[key] !== undefined) monthly[key]++;
    });

    // Date-wise breakdown for hours modal
    const dateBreakdown = {};
    completedRecords.forEach(r => {
      const dateKey = new Date(r.date).toISOString().split('T')[0];
      if (!dateBreakdown[dateKey]) dateBreakdown[dateKey] = { totalMins: 0, entries: [] };
      const mins = calcRecordMins(r);
      const rType = r.recordType || 'exam';
      let timeStr = '';
      if (rType === 'lab' && r.labDuty) timeStr = `${r.labDuty.startTime} – ${r.labDuty.endTime}`;
      else if (rType === 'general' && r.generalDuty) timeStr = `${r.generalDuty.startTime} – ${r.generalDuty.endTime}`;
      else if (r.examDetails?.length) {
        const times = r.examDetails.map(d => `${d.fromTime}–${d.toTime}`).join(', ');
        timeStr = times;
      }
      dateBreakdown[dateKey].totalMins += mins;
      dateBreakdown[dateKey].entries.push({ recordType: rType, timeStr, mins, hoursStr: formatHours(mins) });
    });

    res.status(200).json({
      success: true,
      data: {
        profile: profile || null,
        records: allRecords.map(r => ({
          _id: r._id, recordType: r.recordType || 'exam',
          university: r.university, department: r.department,
          examCategory: r.examCategory, date: r.date,
          role: r.role, block: r.block, room: r.room,
          status: r.status, examDetails: r.examDetails,
          labDuty: r.labDuty, generalDuty: r.generalDuty,
          createdAt: r.createdAt,
        })),
        stats: {
          totalExams, totalHours,
          requiredHours: 0, remainingHours: 0,
          monthly, dateBreakdown,
          thisMonth: {
            exams: thisMonth.length, hours: thisMH,
            examsChangePercent: lastMonth.length ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100) : 0,
            hoursChangePercent: lastMH ? Math.round(((thisMH - lastMH) / lastMH) * 100) : 0,
          },
        },
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getDashboard };
