// utils/calcHours.js — Final Accurate Hours and Minutes Calculator

const toMins = (t) => {
  if (!t || typeof t !== 'string') return null;
  let cleanTime = t.trim();
  let isPM = /pm/i.test(cleanTime);
  let isAM = /am/i.test(cleanTime);
  cleanTime = cleanTime.replace(/(am|pm)/gi, '').trim();
  const parts = cleanTime.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  let h = parts[0];
  const m = parts[1];
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

// Parse strings like "2h", "1h 30m", or decimal numbers to minutes
const parseDurationToMins = (str) => {
  if (typeof str === 'number') return Math.round(str * 60);
  if (!str || typeof str !== 'string') return 0;
  let totalMins = 0;
  
  const hMatch = str.match(/([\d.]+)\s*(?:h|hour|hours)/i);
  if (hMatch) totalMins += Math.round(parseFloat(hMatch[1]) * 60);
  
  const mMatch = str.match(/([\d.]+)\s*(?:m|min|mins)/i);
  if (mMatch) totalMins += Math.round(parseFloat(mMatch[1]));

  if (totalMins === 0 && str.includes(':')) {
    const parsed = toMins(str);
    if (parsed !== null) totalMins = parsed;
  }
  
  if (totalMins === 0 && !isNaN(Number(str))) {
    totalMins = Math.round(parseFloat(str) * 60);
  }

  return totalMins;
};

// Format total minutes to clean "Xh Ym" or "Xh" format
const formatHours = (totalMins) => {
  if (!totalMins || totalMins <= 0) return '0h';
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Calculate minutes for any single record (Exam, Lab, or General) - Fixed Double Counting
const calcRecordMins = (record) => {
  if (!record || record.status !== 'Completed') return 0;
  const rType = record.recordType || 'exam';

  if (rType === 'lab' && record.labDuty) {
    const s = toMins(record.labDuty.startTime);
    const e = toMins(record.labDuty.endTime);
    if (s !== null && e !== null && e > s) return e - s;
    return parseDurationToMins(record.labDuty.totalHours);
  }

  if (rType === 'general' && record.generalDuty) {
    const s = toMins(record.generalDuty.startTime);
    const e = toMins(record.generalDuty.endTime);
    if (s !== null && e !== null && e > s) return e - s;
    return parseDurationToMins(record.generalDuty.totalDutyHours);
  }

  let minStart = null, maxEnd = null;
  for (const d of (record.examDetails || [])) {
    const s = toMins(d.fromTime);
    const e = toMins(d.toTime);
    if (s !== null && (minStart === null || s < minStart)) minStart = s;
    if (e !== null && (maxEnd === null || e > maxEnd)) maxEnd = e;
  }

  if (minStart !== null && maxEnd !== null && maxEnd > minStart) {
    return maxEnd - minStart;
  }

  let mins = 0;
  for (const d of (record.examDetails || [])) {
    mins += parseDurationToMins(d.duration);
  }
  return mins;
};

// Main function to calculate total hours across all completed records
const calcTotalHours = (records = []) => {
  let totalMins = 0;
  records.forEach((rec) => {
    totalMins += calcRecordMins(rec);
  });
  return formatHours(totalMins);
};

module.exports = { calcTotalHours, calcRecordMins, formatHours, parseDurationToMins, toMins };