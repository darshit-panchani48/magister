// src/components/user/AddExamModal.jsx — Updated with "Xh Ym" exact duration formatting

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import examService from '../../services/examService';

const UNIVERSITIES = ['VNSGU', 'GTU', 'Other'];
const DEPARTMENTS = ['BCA', 'B.Sc. Computer Science', 'B.Sc. Chemistry', 'B.Sc. Microbiology', 'M.Sc. Chemistry', 'Other'];
const EXAM_CATS = ['Internal Theory', 'External Theory', 'Internal Practical', 'External Practical', 'Viva', 'Other'];
const ROLES = ['Superintendent', 'Supervisor', 'Lab Assistant', 'Lab Superintendent', 'Other'];
const ROOMS = ['G1', 'G4', 'F1', 'S1', 'S2', 'S3', 'S4', 'S5', 'S8', 'T1', 'T4', 'T5', 'COMPUTER LAB-1', 'COMPUTER LAB-2', 'BOTANY LAB', 'MICRO LAB', 'CHEMISTRY LAB-1', 'CHEMISTRY LAB-2', 'CHEMISTRY LAB-3', 'PHYSICS LAB', 'STRONG ROOM'];
const LAB_ROOMS = ['COMPUTER LAB-1', 'COMPUTER LAB-2', 'BOTANY LAB', 'MICRO LAB', 'CHEMISTRY LAB-1', 'CHEMISTRY LAB-2', 'CHEMISTRY LAB-3', 'PHYSICS LAB'];
const EXAM_TYPES = ['Regular', 'ATKT', 'Purak', 'On-demand'];
const EXAM_NATURES = ['Offline', 'Online'];
const MEDIUMS = ['English', 'Gujarati', 'Hindi', 'Other'];
const YEARS = ['FY', 'SY', 'TY', 'HONOURS'];
const SEMESTERS = { FY: ['Sem 1', 'Sem 2'], SY: ['Sem 3', 'Sem 4'], TY: ['Sem 5', 'Sem 6'], HONOURS: ['Sem 7', 'Sem 8'] };
const DEFAULT_SEM = { FY: 'Sem 1', SY: 'Sem 3', TY: 'Sem 5', HONOURS: 'Sem 7' };

const toMins = (t) => {
  if (!t) return null;
  const p = t.split(':');
  if (p.length < 2) return null;
  const h = parseInt(p[0], 10), m = parseInt(p[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

// 🌟 Updated to return exact "Xh Ym" format (e.g., "3h 30m", "1h", "45m")
const minsToDuration = (mins) => {
  if (!mins || mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const extractNum = (roll) => {
  const m = roll.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
};

const emptyYearDetail = (year) => ({
  year, semester: DEFAULT_SEM[year], examName: '', subject: '', examType: 'Regular', examNature: 'Offline', medium: 'English', duration: '', fromTime: '', toTime: '', totalStudents: '', presentStudents: '', absentStudents: '', expelledStudents: '', startRollNo: '', endRollNo: '',
});

const INIT_BASIC = { university: '', department: '', examCategory: '', date: '', role: '', block: '', room: '' };

const lS = { fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 5, display: 'block', letterSpacing: '0.04em', textTransform: 'uppercase' };
const rD = <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>;
const iB = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, background: 'var(--bg-input)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' };

export default function AddExamModal({ onClose, onSaved, onNextTrigger, editRecord = null, prefillBasic = null }) {
  const isEdit = !!editRecord;
  const [step, setStep] = useState(1);
  const [basic, setBasic] = useState(prefillBasic ? { ...INIT_BASIC, ...prefillBasic } : INIT_BASIC);
  const [details, setDetails] = useState(YEARS.map((y) => emptyYearDetail(y)));
  const [activeYears, setActiveYears] = useState(['FY']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  useEffect(() => {
    if (prefillBasic) setBasic(p => ({ ...p, ...prefillBasic }));
  }, [prefillBasic]);

  useEffect(() => {
    if (!editRecord) return;
    setBasic({
      university: editRecord.university || '',
      department: editRecord.department || '',
      examCategory: editRecord.examCategory || '',
      date: editRecord.date ? new Date(editRecord.date).toISOString().split('T')[0] : '',
      role: editRecord.role || '',
      block: editRecord.block || '',
      room: editRecord.room || '',
    });
    if (editRecord.examDetails?.length) {
      const filled = editRecord.examDetails.map((d) => ({
        ...emptyYearDetail(d.year), ...d,
        fromTime: d.fromTime || '', toTime: d.toTime || '',
        totalStudents: String(d.totalStudents || ''), presentStudents: String(d.presentStudents || ''),
        absentStudents: String(d.absentStudents || ''), expelledStudents: String(d.expelledStudents || ''),
      }));
      setActiveYears(filled.map((d) => d.year));
      setDetails(YEARS.map((y) => filled.find((d) => d.year === y) || emptyYearDetail(y)));
    }
  }, [editRecord]);

  const handleBasic = useCallback((e) => {
    const { name, value } = e.target;
    setError('');
    setBasic((p) => {
      const next = { ...p, [name]: value };
      if (name === 'role' && value === 'Other') next.room = 'N/A';
      if (name === 'role' && value !== 'Other' && p.room === 'N/A') next.room = '';
      return next;
    });
  }, []);

  const handleDetail = useCallback((yi, field, value) => {
    setError('');
    setDetails((prev) => {
      const next = [...prev];
      const row = { ...next[yi], [field]: value };
      if (field === 'startRollNo' || field === 'endRollNo') row[field] = value.toUpperCase();
      if (['totalStudents', 'absentStudents', 'expelledStudents'].includes(field)) {
        const t = parseInt(field === 'totalStudents' ? value : row.totalStudents, 10) || 0;
        const a = parseInt(field === 'absentStudents' ? value : row.absentStudents, 10) || 0;
        const x = parseInt(field === 'expelledStudents' ? value : row.expelledStudents, 10) || 0;
        row.presentStudents = String(Math.max(0, t - a - x));
      }
      if (field === 'fromTime' || field === 'toTime') {
        const s = toMins(field === 'fromTime' ? value : row.fromTime);
        const e = toMins(field === 'toTime' ? value : row.toTime);
        row.duration = s !== null && e !== null && e > s ? minsToDuration(e - s) : '';
      }
      next[yi] = row;
      return next;
    });
  }, []);

  const toggleYear = (year) => {
    if (activeYears.includes(year) && activeYears.length === 1) return;
    setActiveYears((prev) => prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]);
  };

  const buildExamDetails = () =>
    details.filter((d) => activeYears.includes(d.year)).map((d) => ({
      ...d,
      totalStudents: parseInt(d.totalStudents, 10) || 0,
      presentStudents: parseInt(d.presentStudents, 10) || 0,
      absentStudents: parseInt(d.absentStudents, 10) || 0,
      expelledStudents: parseInt(d.expelledStudents, 10) || 0,
    }));

  const validateStep1 = () => {
    if (!basic.university) return 'University is required';
    if (!basic.department) return 'Department is required';
    if (!basic.examCategory) return 'Exam Category is required';
    if (!basic.date) return 'Date is required';
    if (!basic.role) return 'Role is required';
    if (!basic.block.trim()) return 'Block is required';
    if (basic.role !== 'Other' && !basic.room) return 'Room is required';
    return null;
  };

  const validateStep2 = () => {
    const sel = details.filter((d) => activeYears.includes(d.year));
    if (sel.length === 0) return 'Select at least one year section';
    for (const d of sel) {
      if (!d.examName.trim()) return `Exam Name required for ${d.year}`;
      if (!d.subject.trim()) return `Subject required for ${d.year}`;
      if (!d.startRollNo.trim()) return `Start Roll No required for ${d.year}`;
      if (!d.endRollNo.trim()) return `End Roll No required for ${d.year}`;
      const total = parseInt(d.totalStudents, 10) || 0;
      if (total > 0) {
        const sn = extractNum(d.startRollNo), en = extractNum(d.endRollNo);
        if (sn !== null && en !== null) {
          if (en < sn) return `${d.year}: End Roll must be > Start Roll`;
          if (en - sn + 1 !== total) return `${d.year}: Roll count ${en - sn + 1} ≠ Total Students ${total}`;
        }
      }
    }
    return null;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (e) { setError(e); return; }
    setError('');
    const roleLower = (basic.role || '').toLowerCase();
    const isLabRole = roleLower.includes('lab');
    const isLabRoom = LAB_ROOMS.includes(basic.room);
    const isOtherRole = basic.role === 'Other';
    
    if (isLabRole && isLabRoom) {
      if (typeof onNextTrigger === 'function') { onNextTrigger(basic); }
      else { onSaved(null, { ...basic, _triggerLab: true }); onClose(); }
      return;
    }
    if (isOtherRole) {
      if (typeof onNextTrigger === 'function') { onNextTrigger(basic); }
      else { onSaved(null, { ...basic, _triggerGeneral: true }); onClose(); }
      return;
    }
    setStep(2);
  };

  const handleDraft = async () => {
    const e = validateStep1();
    if (e) { setError(e); return; }
    setLoading(true); setError('');
    try {
      const payload = { ...basic, examDetails: buildExamDetails(), status: 'Draft' };
      if (isEdit && editRecord.recordType === 'exam') {
        await examService.updateExam(editRecord._id, payload);
        toast.success('Saved as Draft ✅');
      } else {
        await examService.createExam(payload);
        toast.success('Saved as Draft 📝');
      }
      onSaved(null, null); onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save draft.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    const e = validateStep2();
    if (e) { setError(e); return; }
    setLoading(true); setError('');
    try {
      const payload = { ...basic, examDetails: buildExamDetails(), status: 'Completed' };
      let res;
      if (isEdit && editRecord.recordType === 'exam') {
        res = await examService.updateExam(editRecord._id, payload);
        toast.success('Exam updated! ✅');
      } else {
        res = await examService.createExam(payload);
        toast.success('Exam added! 🎉');
      }
      onSaved(res, { ...basic }); onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const yC = {
    FY: { bg: 'var(--primary-light)', border: 'var(--primary-border)', text: 'var(--primary-text)' },
    SY: { bg: 'var(--pro-light)', border: 'var(--pro-border)', text: 'var(--pro-text)' },
    TY: { bg: 'var(--success-light)', border: 'var(--success-border)', text: 'var(--success-text)' },
    HONOURS: { bg: 'var(--warning-light)', border: 'var(--warning-border)', text: 'var(--warning-text)' },
  };

  const renderStep1 = () => (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Step 1: Basic Exam Information</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enter your exam detail based on your role type</div>
      </div>
      <div className="ae-step1-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px 18px' }}>
        <div>
          <label style={lS}>University {rD}</label>
          <select name="university" value={basic.university} onChange={handleBasic} style={{ ...iB, appearance: 'auto' }}>
            <option value="">Select</option>
            {UNIVERSITIES.map((u) => (<option key={u} value={u}>{u}</option>))}
          </select>
        </div>
        <div>
          <label style={lS}>Department {rD}</label>
          <select name="department" value={basic.department} onChange={handleBasic} style={{ ...iB, appearance: 'auto' }}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
        </div>
        <div>
          <label style={lS}>Exam Category {rD}</label>
          <select name="examCategory" value={basic.examCategory} onChange={handleBasic} style={{ ...iB, appearance: 'auto' }}>
            <option value="">Select</option>
            {EXAM_CATS.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div>
          <label style={lS}>Date {rD}</label>
          <input type="date" name="date" value={basic.date} onChange={handleBasic} style={iB} />
        </div>
        <div>
          <label style={lS}>Role {rD}</label>
          <select name="role" value={basic.role} onChange={handleBasic} style={{ ...iB, appearance: 'auto' }}>
            <option value="">Select</option>
            {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
        </div>
        <div>
          <label style={lS}>Block {rD}</label>
          <input type="text" name="block" value={basic.block} onChange={handleBasic} placeholder="Enter block name/no." style={iB} />
        </div>
        <div>
          <label style={lS}>Room {basic.role === 'Other' ? '' : rD}</label>
          <select
            name="room"
            value={basic.role === 'Other' ? 'N/A' : basic.room}
            onChange={handleBasic}
            disabled={basic.role === 'Other'}
            style={{ ...iB, appearance: 'auto', opacity: basic.role === 'Other' ? 0.55 : 1, cursor: basic.role === 'Other' ? 'not-allowed' : 'pointer', background: basic.role === 'Other' ? 'var(--bg-hover)' : 'var(--bg-input)' }}
          >
            {basic.role === 'Other' ? (
              <option value="N/A">N/A — Not Required for Other role</option>
            ) : (
              <>
                <option value="">Select Room</option>
                {ROOMS.map((r) => (<option key={r} value={r}>{r}</option>))}
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Step 2: Year-wise Exam Details</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select year sections and enter details for each</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {YEARS.map((year) => {
          const active = activeYears.includes(year);
          const c = yC[year];
          return (
            <button key={year} type="button" onClick={() => toggleYear(year)}
              style={{
                padding: '6px 16px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                border: `1.5px solid ${active ? c.text : 'var(--border)'}`, background: active ? c.bg : 'var(--bg-input)', color: active ? c.text : 'var(--text-muted)',
              }}
            >
              {active && <i className="ti ti-check" style={{ fontSize: 11, marginRight: 5 }} />}
              {year}
            </button>
          );
        })}
      </div>
      <div className="ae-step2-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${activeYears.length},1fr)`, gap: 12 }}>
        {YEARS.filter((y) => activeYears.includes(y)).map((year) => {
          const idx = YEARS.indexOf(year);
          const d = details[idx];
          const c = yC[year];
          const ri = (() => {
            if (!d.startRollNo || !d.endRollNo) return null;
            const s = extractNum(d.startRollNo), e = extractNum(d.endRollNo);
            if (s === null || e === null) return null;
            const total = parseInt(d.totalStudents, 10) || 0;
            if (e < s) return { ok: false, msg: 'End > Start required' };
            const cnt = e - s + 1;
            if (total > 0 && cnt !== total) return { ok: false, msg: `Count ${cnt} ≠ Total ${total}` };
            return { ok: true, msg: `Roll count: ${cnt}` };
          })();
          return (
            <div key={year} style={{ border: `1.5px solid ${c.border}`, borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--bg-card)' }}>
              <div style={{ background: c.bg, padding: '10px 14px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: c.text, borderBottom: `1px solid ${c.border}`, letterSpacing: '0.05em' }}>
                {year}
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Semester {rD}</label>
                  <select value={d.semester} onChange={(e) => handleDetail(idx, 'semester', e.target.value)} style={{ ...iB, fontSize: 12, appearance: 'auto' }}>
                    {(SEMESTERS[year] || []).map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Exam Name {rD}</label>
                  <input value={d.examName} onChange={(e) => handleDetail(idx, 'examName', e.target.value)} placeholder="Enter exam name" style={{ ...iB, fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Subject {rD}</label>
                  <input value={d.subject} onChange={(e) => handleDetail(idx, 'subject', e.target.value)} placeholder="Enter subject" style={{ ...iB, fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Exam Type</label>
                  <select value={d.examType} onChange={(e) => handleDetail(idx, 'examType', e.target.value)} style={{ ...iB, fontSize: 12, appearance: 'auto' }}>
                    {EXAM_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Exam Nature</label>
                  <select value={d.examNature} onChange={(e) => handleDetail(idx, 'examNature', e.target.value)} style={{ ...iB, fontSize: 12, appearance: 'auto' }}>
                    {EXAM_NATURES.map((n) => (<option key={n} value={n}>{n}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Medium</label>
                  <select value={d.medium} onChange={(e) => handleDetail(idx, 'medium', e.target.value)} style={{ ...iB, fontSize: 12, appearance: 'auto' }}>
                    {MEDIUMS.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>From Time {rD}</label>
                  <input type="time" value={d.fromTime || ''} onChange={(e) => handleDetail(idx, 'fromTime', e.target.value)} style={{ ...iB, fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>To Time {rD}</label>
                  <input type="time" value={d.toTime || ''} onChange={(e) => handleDetail(idx, 'toTime', e.target.value)} style={{ ...iB, fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Duration (Auto)</label>
                  <input value={d.duration || '—'} readOnly style={{ ...iB, fontSize: 12, background: 'var(--success-light)', color: 'var(--success-text)', borderColor: 'var(--success-border)', cursor: 'default', fontWeight: d.duration ? 600 : 400 }} />
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }} />
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Total Students {rD}</label>
                  <input type="number" min="0" value={d.totalStudents} onChange={(e) => handleDetail(idx, 'totalStudents', e.target.value)} placeholder="0" style={{ ...iB, fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Present Students</label>
                  <input value={d.presentStudents || '0'} readOnly style={{ ...iB, fontSize: 12, background: 'var(--success-light)', color: 'var(--success-text)', borderColor: 'var(--success-border)', cursor: 'default' }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Absent Students</label>
                  <input type="number" min="0" value={d.absentStudents} onChange={(e) => handleDetail(idx, 'absentStudents', e.target.value)} placeholder="0" style={{ ...iB, fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Expelled Students</label>
                  <input type="number" min="0" value={d.expelledStudents} onChange={(e) => handleDetail(idx, 'expelledStudents', e.target.value)} placeholder="0" style={{ ...iB, fontSize: 12 }} />
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }} />
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>Start Roll No {rD}</label>
                  <input value={d.startRollNo} onChange={(e) => handleDetail(idx, 'startRollNo', e.target.value)} placeholder={`${year}001`} style={{ ...iB, fontSize: 12, textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label style={{ ...lS, fontSize: 10 }}>End Roll No {rD}</label>
                  <input value={d.endRollNo} onChange={(e) => handleDetail(idx, 'endRollNo', e.target.value)} placeholder={`${year}070`} style={{ ...iB, fontSize: 12, textTransform: 'uppercase' }} />
                </div>
                {ri && (
                  <div style={{ fontSize: 10, fontWeight: 600, padding: '5px 8px', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', gap: 4, background: ri.ok ? 'var(--success-light)' : 'var(--danger-light)', border: `1px solid ${ri.ok ? 'var(--success-border)' : 'var(--danger-border)'}`, color: ri.ok ? 'var(--success-text)' : 'var(--danger-text)' }}>
                    <i className={`ti ${ri.ok ? 'ti-circle-check' : 'ti-alert-circle'}`} style={{ fontSize: 11 }} />
                    {ri.msg}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 6000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
      <div className="ae-modal-card" style={{ background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: step === 1 ? 640 : 1100, maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 80px rgba(0,0,0,.25)', border: '1px solid var(--border)', overflow: 'hidden', animation: 'scaleIn .3s ease' }}>
        
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="ae-header-steps" style={{ display: 'flex', alignItems: 'center', marginBottom: 14, minWidth: 0, gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {step > 1 ? <i className="ti ti-check" style={{ fontSize: 12 }} /> : '1'}
              </div>
              <div className="ae-step-text">
                <div style={{ fontSize: 12, fontWeight: 700, color: step >= 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>Basic Info</div>
              </div>
            </div>
            
            <div style={{ flex: 1, height: 1, background: step > 1 ? 'var(--primary)' : 'var(--border)', minWidth: 10 }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</div>
              <div className="ae-step-text">
                <div style={{ fontSize: 12, fontWeight: 700, color: step >= 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>Year Details</div>
              </div>
            </div>

            <button onClick={onClose} className="btn btn-outline" style={{ marginLeft: 'auto', width: 30, height: 30, padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-x" />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="academic-title" style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
              {isEdit ? 'Update Exam Record' : 'Add Exam Details'}
            </div>
            {step === 1 && (
              <button onClick={() => setShowInstructionModal(true)}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)', color: '#713f12', border: '1.5px solid #facc15', borderRadius: '10px', padding: '10px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 3px 10px rgba(234, 179, 8, 0.25)', transition: 'all 0.2s ease', boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: 16 }}>🧑‍🏫</span> Before you enter exam detail please read the instruction
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 20px', background: 'var(--danger-light)', borderBottom: '1px solid var(--danger-border)', fontSize: 12, color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, wordBreak: 'break-word' }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0 }} /><span>{error}</span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', overflowX: step === 2 ? 'auto' : 'hidden', padding: '20px' }}>
          {step === 1 ? renderStep1() : renderStep2()}
        </div>

        <div className="ae-footer-row" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={onClose} disabled={loading} className="btn btn-outline">Cancel</button>
          {step === 2 && (
            <button onClick={() => { setStep(1); setError(''); }} disabled={loading} className="btn btn-outline">
              <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Back
            </button>
          )}
          {step === 1 ? (
            <button onClick={handleNext} className="btn btn-primary">
              Next <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
            </button>
          ) : (
            <>
              <button onClick={handleDraft} disabled={loading} className="btn btn-outline">
                <i className="ti ti-device-floppy" style={{ fontSize: 14 }} /> Save Draft
              </button>
              <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">
                {loading ? <span className="spinner" /> : <>{isEdit ? 'Update Exam' : 'Submit Exam'}</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Instruction Modal */}
      {showInstructionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--bg-card)', width: '100%', maxWidth: 600, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'var(--primary)', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-info-circle" style={{ fontSize: 18 }} /> Complete Exam Duty Instruction & Guide
              </div>
              <button onClick={() => setShowInstructionModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '72vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-page)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📌 Part 1: How to Select Exam Duty Form Types
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  <div>🏛️ <strong>Year-wise Model (Default):</strong> Select any standard Exam Category (like <em>Internal/External Theory</em>) + Normal Role & Room.</div>
                  <div>🧪 <strong>Lab Duty Model:</strong> Set Exam Category to <em>Internal/External Practical</em> + Role with <em>Lab</em> + Room as a <em>Lab Room</em>.</div>
                  <div>📋 <strong>General Duty Model:</strong> Simply select Role as <em>Other</em> in the dropdown.</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-page)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⭐ Part 2: Model Specialties & Smart Benefits
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  <div>⚡ <strong>Auto Hour Calculation:</strong> Hours are precisely computed automatically from From/To times.</div>
                  <div>⚡ <strong>Auto Student Calculation:</strong> Present students count updates instantly as you type absences.</div>
                  <div>🛡️ <strong>No Chance for Incorrect Record Entry:</strong> Range checking and validation prevent mistakes.</div>
                  <div>📋 <strong>Detailed Model with All Fields:</strong> Covers comprehensive academic metrics seamlessly.</div>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary-text)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid var(--primary)', marginTop: 4 }}>
                    💡 <strong>Special Benefit (Internal Theory):</strong> If you choose <em>Internal Theory</em>, you have a great benefit because in internal theory one class often has 3 types of students (FY, SY, TY). The <strong>Year-wise Model</strong> solves your problem by letting you enter students of multiple years in one record!
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-page)', textAlign: 'right' }}>
              <button onClick={() => setShowInstructionModal(false)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Understood 👍</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @media (max-width: 768px) {
          .ae-modal-card { max-width: 95% !important; max-height: 90vh !important; }
          .ae-step1-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .ae-step2-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .ae-footer-row { flex-direction: column-reverse !important; }
          .ae-footer-row button { width: 100% !important; justify-content: center !important; }
          .ae-step-text div { font-size: 11px !important; }
        }
      `}</style>
    </div>
  );
}