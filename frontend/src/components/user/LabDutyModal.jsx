// src/components/user/LabDutyModal.jsx — Fully Responsive, Clean & Fixed with Safe Basic Info Sync

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import examService from '../../services/examService';

const YEARS     = ['FY', 'SY', 'TY', 'HONOURS'];
const EXAM_TYPES = ['Regular', 'ATKT', 'Purak', 'On-demand'];
const SEMESTERS  = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

const toMins = (t) => {
  if (!t || typeof t !== 'string') return null;
  const p = t.split(':');
  const h = parseInt(p[0], 10), m = parseInt(p[1], 10);
  return (isNaN(h) || isNaN(m)) ? null : h * 60 + m;
};
const minsToStr = (mins) => {
  if (!mins || mins <= 0) return '';
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};
const extractNum = (r) => { const m = String(r || '').match(/(\d+)$/); return m ? parseInt(m[1], 10) : null; };

const lS = { fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 5, display: 'block' };
const rD = <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;
const iB = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, background: 'var(--bg-input)', color: 'var(--text-main)', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' };

const INIT = { labName: '', floor: '', labNumber: '', year: 'FY', examName: '', semester: 'Sem 1', subject: '', examType: 'Regular', startTime: '', endTime: '', totalHours: '', startRollNo: '', endRollNo: '', totalStudents: '', absentStudents: '', expelledStudents: '' };

const SH = ({ color, label, icon }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 3, height: 14, background: color, borderRadius: 2, display: 'inline-block' }} />
    {icon && <i className={`ti ${icon}`} style={{ color, fontSize: 13 }} />}
    {label}
  </div>
);

export default function LabDutyModal({ examBasic, onBack, onClose, onSaved, editRecord = null }) {
  const isEdit = !!editRecord;
  const [form,    setForm]    = useState(() => {
    if (editRecord?.labDuty) return { ...INIT, ...editRecord.labDuty };
    return INIT;
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.body.classList.add('no-scroll'); return () => document.body.classList.remove('no-scroll'); }, []);

  const handle = (e) => {
    const { name, value } = e.target;
    setError('');
    setForm(p => {
      const next = { ...p, [name]: value };
      if (name === 'startRollNo' || name === 'endRollNo') next[name] = value.toUpperCase();
      if (name === 'startTime' || name === 'endTime') {
        const s = toMins(name === 'startTime' ? value : next.startTime);
        const e = toMins(name === 'endTime'   ? value : next.endTime);
        next.totalHours = (s !== null && e !== null && e > s) ? minsToStr(e - s) : '';
      }
      if (name === 'startRollNo' || name === 'endRollNo') {
        const sn = extractNum(name === 'startRollNo' ? value.toUpperCase() : next.startRollNo);
        const en = extractNum(name === 'endRollNo'   ? value.toUpperCase() : next.endRollNo);
        next.totalStudents = (sn !== null && en !== null && en >= sn) ? String(en - sn + 1) : '';
      }
      return next;
    });
  };

  const validate = () => {
    if (!form.labName.trim())   return 'Lab Name is required';
    if (!form.floor.trim())     return 'Floor is required';
    if (!form.labNumber.trim())  return 'Lab Number is required';
    if (!form.examName.trim())   return 'Exam Name is required';
    if (!form.subject.trim())    return 'Subject is required';
    if (!form.startTime)         return 'Start Time is required';
    if (!form.endTime)           return 'End Time is required';
    const s = toMins(form.startTime), e = toMins(form.endTime);
    if (s !== null && e !== null && e <= s) return 'End Time must be > Start Time';
    if (!form.startRollNo.trim()) return 'Start Roll No is required';
    if (!form.endRollNo.trim())   return 'End Roll No is required';
    const sn = extractNum(form.startRollNo), en = extractNum(form.endRollNo);
    if (sn !== null && en !== null && en < sn) return 'End Roll No must be > Start Roll No';
    const tot = parseInt(form.totalStudents, 10) || 0;
    const abs = parseInt(form.absentStudents, 10) || 0;
    const exp = parseInt(form.expelledStudents, 10) || 0;
    if (abs + exp > tot && tot > 0) return 'Absent + Expelled cannot exceed Total Students';
    return null;
  };

  const save = async (status) => {
    if (status === 'Completed') { const err = validate(); if (err) { setError(err); return; } }
    setLoading(true);
    try {
      const cleanBasic = {
        university: examBasic?.university || '',
        department: examBasic?.department || '',
        examCategory: examBasic?.examCategory || '',
        date: examBasic?.date || '',
        role: examBasic?.role || '',
        block: examBasic?.block || '',
        room: examBasic?.room || '',
      };

      const labDuty = { ...form, totalStudents: parseInt(form.totalStudents, 10) || 0, absentStudents: parseInt(form.absentStudents, 10) || 0, expelledStudents: parseInt(form.expelledStudents, 10) || 0 };
      
      if (isEdit) {
        await examService.updateExam(editRecord._id, { ...cleanBasic, labDuty, status });
      } else {
        await examService.createExam({ ...cleanBasic, examDetails: [], recordType: 'lab', status, labDuty });
      }
      toast.success(status === 'Draft' ? 'Lab duty saved as Draft 📝' : 'Lab duty submitted! ✅');
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const tot = parseInt(form.totalStudents, 10) || 0;
  const abs = parseInt(form.absentStudents, 10) || 0;
  const exp = parseInt(form.expelledStudents, 10) || 0;
  const overCount = abs + exp > tot && tot > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div className="lab-modal-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-2xl)', width: '100%', maxWidth: 640, maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 80px rgba(0,0,0,.3)', border: '1px solid var(--border)', animation: 'scaleIn .35s ease', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontSize: 15, flexShrink: 0 }}>
                <i className="ti ti-flask" />
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 17, fontWeight: 700, color: 'var(--success)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isEdit ? 'Edit Lab Duty' : 'Lab Duty Details'}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Role: <strong style={{ color: 'var(--text-sub)' }}>{examBasic?.role}</strong> · Room: <strong style={{ color: 'var(--text-sub)' }}>{examBasic?.room}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {onBack && (
              <button onClick={() => onBack(form)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg-page)', color: 'var(--text-sub)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <i className="ti ti-arrow-left" style={{ fontSize: 12 }} />Back
              </button>
            )}
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>
              <i className="ti ti-x" />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '8px 20px', background: 'var(--danger-light)', borderBottom: '1px solid var(--danger-border)', fontSize: 12, color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, wordBreak: 'break-word' }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 14, flexShrink: 0 }} /><span>{error}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Lab Info */}
          <div>
            <SH color="var(--success)" label="Lab Information" icon="ti-flask" />
            <div className="lab-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 12px' }}>
              <div><label style={lS}>Lab Name {rD}</label><input name="labName" value={form.labName} onChange={handle} placeholder="Chemistry Lab" style={iB} /></div>
              <div><label style={lS}>Floor {rD}</label><input name="floor" value={form.floor} onChange={handle} placeholder="Ground Floor" style={iB} /></div>
              <div><label style={lS}>Lab Number {rD}</label><input name="labNumber" value={form.labNumber} onChange={handle} placeholder="LAB-1" style={iB} /></div>
            </div>
          </div>

          {/* Exam Info */}
          <div>
            <SH color="var(--primary)" label="Exam Information" icon="ti-book" />
            <div className="lab-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 12px' }}>
              <div><label style={lS}>Year</label>
                <select name="year" value={form.year} onChange={handle} style={{ ...iB, appearance: 'auto' }}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div><label style={lS}>Semester</label>
                <select name="semester" value={form.semester} onChange={handle} style={{ ...iB, appearance: 'auto' }}>
                  {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={lS}>Exam Name {rD}</label><input name="examName" value={form.examName} onChange={handle} placeholder="Exam name" style={iB} /></div>
              <div><label style={lS}>Subject {rD}</label><input name="subject" value={form.subject} onChange={handle} placeholder="Subject" style={iB} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={lS}>Exam Type</label>
                <select name="examType" value={form.examType} onChange={handle} style={{ ...iB, appearance: 'auto' }}>
                  {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div>
            <SH color="var(--pro)" label="Timing" icon="ti-clock" />
            <div className="lab-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 12px' }}>
              <div><label style={lS}>Start Time {rD}</label><input type="time" name="startTime" value={form.startTime} onChange={handle} style={iB} /></div>
              <div><label style={lS}>End Time {rD}</label><input type="time" name="endTime" value={form.endTime} onChange={handle} style={iB} /></div>
              <div><label style={lS}>Total Hours (Auto)</label>
                <input value={form.totalHours || '—'} readOnly style={{ ...iB, background: form.totalHours ? 'var(--success-light)' : 'var(--bg-hover)', color: form.totalHours ? 'var(--success-text)' : 'var(--text-muted)', borderColor: form.totalHours ? 'var(--success-border)' : 'var(--border)', cursor: 'default', fontWeight: form.totalHours ? 600 : 400 }} />
              </div>
            </div>
          </div>

          {/* Students */}
          <div>
            <SH color="var(--warning)" label="Student Details" icon="ti-users" />
            <div className="lab-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px', marginBottom: 10 }}>
              <div><label style={lS}>Start Roll No {rD}</label><input name="startRollNo" value={form.startRollNo} onChange={handle} placeholder="BCA001" style={{ ...iB, textTransform: 'uppercase' }} /></div>
              <div><label style={lS}>End Roll No {rD}</label><input name="endRollNo" value={form.endRollNo} onChange={handle} placeholder="BCA070" style={{ ...iB, textTransform: 'uppercase' }} /></div>
            </div>
            <div className="lab-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 12px' }}>
              <div><label style={lS}>Total (Auto)</label><input value={form.totalStudents || '0'} readOnly style={{ ...iB, background: 'var(--success-light)', color: 'var(--success-text)', borderColor: 'var(--success-border)', cursor: 'default', fontWeight: 600 }} /></div>
              <div><label style={lS}>Absent</label><input type="number" min="0" name="absentStudents" value={form.absentStudents} onChange={handle} placeholder="0" style={{ ...iB, borderColor: overCount ? 'var(--danger-border)' : 'var(--border)' }} /></div>
              <div><label style={lS}>Expelled</label><input type="number" min="0" name="expelledStudents" value={form.expelledStudents} onChange={handle} placeholder="0" style={{ ...iB, borderColor: overCount ? 'var(--danger-border)' : 'var(--border)' }} /></div>
            </div>
            {overCount && (
              <div style={{ marginTop: 8, padding: '7px 10px', background: 'var(--danger-light)', border: '1px solid var(--danger-border)', borderRadius: 8, fontSize: 11, color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-alert-circle" />Absent+Expelled ({abs + exp}) cannot exceed Total ({tot})
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="lab-footer-row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-sub)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => save('Draft')} disabled={loading} style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-sub)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-device-floppy" style={{ fontSize: 13 }} />Save Draft
          </button>
          <button onClick={() => save('Completed')} disabled={loading} style={{ padding: '8px 20px', borderRadius: 'var(--r-md)', border: 'none', background: loading ? '#9ca3af' : 'var(--success)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: loading ? 'none' : '0 2px 8px rgba(22,163,74,.35)' }}>
            {loading ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />Saving...</> : <><i className="ti ti-check" style={{ fontSize: 13 }} />{isEdit ? 'Update' : 'Submit'}</>}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){
          .lab-modal-card { max-width: 95% !important; max-height: 90vh !important; }
          .lab-grid-3 { grid-template-columns: 1fr !important; gap: 10px !important; }
          .lab-grid-2 { grid-template-columns: 1fr !important; gap: 10px !important; }
          .lab-footer-row { flex-direction: column-reverse !important; }
          .lab-footer-row button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}