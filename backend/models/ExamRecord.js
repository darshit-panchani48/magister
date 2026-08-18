// models/ExamRecord.js — Fixed conditional room requirement for general/other roles

const mongoose = require('mongoose');

const examDetailSchema = new mongoose.Schema({
  year:             { type: String, enum: ['FY','SY','TY','HONOURS'], required: true },
  semester:         { type: String, trim: true, default: '' },
  examName:         { type: String, trim: true, default: '' },
  subject:          { type: String, trim: true, default: '' },
  examType:         { type: String, enum: ['Regular','ATKT','Purak','On-demand'], default: 'Regular' },
  examNature:       { type: String, enum: ['Offline','Online'], default: 'Offline' },
  medium:           { type: String, enum: ['English','Gujarati','Hindi','Other'], default: 'English' },
  duration:         { type: String, default: '' },
  fromTime:         { type: String, default: '' },
  toTime:           { type: String, default: '' },
  totalStudents:    { type: Number, default: 0 },
  presentStudents:  { type: Number, default: 0 },
  absentStudents:   { type: Number, default: 0 },
  expelledStudents: { type: Number, default: 0 },
  startRollNo:      { type: String, trim: true, default: '' },
  endRollNo:        { type: String, trim: true, default: '' },
}, { _id: false });

const labDutySchema = new mongoose.Schema({
  labName:          { type: String, trim: true, default: '' },
  floor:            { type: String, trim: true, default: '' },
  labNumber:        { type: String, trim: true, default: '' },
  examName:         { type: String, trim: true, default: '' },
  semester:         { type: String, trim: true, default: '' },
  subject:          { type: String, trim: true, default: '' },
  examType:         { type: String, trim: true, default: '' },
  startTime:        { type: String, default: '' },
  endTime:          { type: String, default: '' },
  totalHours:       { type: String, default: '' },
  startRollNo:      { type: String, trim: true, default: '' },
  endRollNo:        { type: String, trim: true, default: '' },
  totalStudents:    { type: Number, default: 0 },
  absentStudents:   { type: Number, default: 0 },
  expelledStudents: { type: Number, default: 0 },
}, { _id: false });

const generalDutySchema = new mongoose.Schema({
  startTime:      { type: String, default: '' },
  endTime:        { type: String, default: '' },
  totalDutyHours: { type: String, default: '' },
  location:       { type: String, trim: true, default: '' },
  locations:      { type: [String], default: [] },
  otherLocation:  { type: String, trim: true, default: '' },
  roleType:       { type: String, trim: true, default: '' },
  workPerformed:  { type: [String], default: [] },
  otherWork:      { type: String, trim: true, default: '' },
  remarks:        { type: String, trim: true, default: '' },
}, { _id: false });

const examRecordSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recordType:   { type: String, enum: ['exam','lab','general'], default: 'exam' },
  university:   { type: String, required: [true,'University is required'], trim: true },
  department:   { type: String, required: [true,'Department is required'], trim: true },
  examCategory: { type: String, required: [true,'Exam category is required'], trim: true },
  date:         { type: Date,   required: [true,'Date is required'] },
  role:         { type: String, required: [true,'Role is required'], trim: true },
  block:        { type: String, required: [true,'Block is required'], trim: true },
  
  // 🌟 FIXED ROOM REQUIREMENT CHECK
  room: { 
    type: String, 
    required: function() {
      return this.recordType === 'exam' && this.role !== 'Other';
    }, 
    trim: true, 
    default: '' 
  },

  examDetails:  [examDetailSchema],
  labDuty:      { type: labDutySchema,     default: null },
  generalDuty:  { type: generalDutySchema, default: null },
  status: {
    type:    String,
    enum:    ['Draft','Completed','Cancelled'],
    default: 'Draft',
  },
  isDeleted:     { type: Boolean, default: false },
  deletedReason: { type: String,  default: '' },
  deletedAt:     { type: Date },
}, { timestamps: true });

examRecordSchema.index({ user: 1, isDeleted: 1 });
examRecordSchema.index({ date: -1 });
examRecordSchema.index({
  university:             'text',
  department:             'text',
  examCategory:           'text',
  'examDetails.examName': 'text',
  'examDetails.subject':  'text',
});

module.exports = mongoose.model('ExamRecord', examRecordSchema);