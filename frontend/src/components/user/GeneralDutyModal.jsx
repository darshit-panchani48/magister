// src/components/user/GeneralDutyModal.jsx — Fully Responsive, Clean & Fixed

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import examService from '../../services/examService';

const LOCATIONS = [
  'G1','G4','F1','S1','S2','S3','S4','S5','S8','T1','T4','T5',
  'COMPUTER LAB-1','COMPUTER LAB-2','BOTANY LAB','MICRO LAB',
  'CHEMISTRY LAB-1','CHEMISTRY LAB-2','CHEMISTRY LAB-3','PHYSICS LAB',
  'STRONG ROOM','STAFF ROOM','Other',
];

const ROLE_TYPES = [
  'Factotum','Stationary Supervisor','Waterman',
  'Lab Technician / Electrician','Storekeeper','Peon','Other',
];

const WORK_ITEMS = {
  'Factotum':                    ['Exam Material Distribution','Question Paper Distribution','Answer Book Collection','Seating Arrangement','Room Preparation','Staff Assistance'],
  'Stationary Supervisor':       ['Answer Book Distribution','Supplementary Sheet Distribution','Stationery Distribution','Stationery Collection','Stationery Stock Verification','Exam Material Packing'],
  'Waterman':                    ['Drinking Water Arrangement','Water Distribution','Water Cooler Monitoring','Water Supply Maintenance'],
  'Lab Technician / Electrician':['Computer System Checking','Electrical Maintenance','Power Supply Monitoring','Generator / UPS Support','Fan / Light Maintenance','Technical Support During Exam'],
  'Storekeeper':                 ['Issue Exam Materials','Receive Exam Materials','Stock Verification','Inventory Management','Material Packing'],
  'Peon':                        ['Question Paper Delivery','Answer Book Delivery','Document Delivery','Exam Material Transportation','Office Assistance'],
  'Other':                       ['Administrative Support','Special Assignment','University Assigned Work'],
};

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

const lS = { fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 5, display: 'block' };
const rD = <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;
const iB = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, background: 'var(--bg-input)', color: 'var(--text-main)', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' };

const SH = ({ color, label, icon }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 3, height: 14, background: color, borderRadius: 2, display: 'inline-block' }} />
    {icon && <i className={`ti ${icon}`} style={{ color, fontSize: 13 }} />}
    {label}
  </div>
);

const INIT = {
  startTime: '', endTime: '', totalDutyHours: '',
  locations: [], otherLocation: '',
  roleType: '', workPerformed: [], otherWork: '', remarks: '',
};

export default function GeneralDutyModal({ examBasic, onBack, onClose, onSaved, editRecord = null }) {
  const isEdit = !!editRecord;

  const [form, setForm] = useState(() => {
    if (editRecord?.generalDuty) {
      const gd = editRecord.generalDuty;
      return {
        ...INIT, ...gd,
        locations: gd.locations
          ? gd.locations
          : gd.location && gd.location !== 'Other'
            ? [gd.location]
            : [],
      };
    }
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
      if (name === 'startTime' || name === 'endTime') {
        const s = toMins(name === 'startTime' ? value : next.startTime);
        const ev = toMins(name === 'endTime' ? value : next.endTime);
        next.totalDutyHours = (s !== null && ev !== null && ev > s) ? minsToStr(ev - s) : '';
      }
      if (name === 'roleType') next.workPerformed = [];
      return next;
    });
  };

  const toggleLocation = (loc) => {
    setError('');
    if (loc === 'Other') {
      setForm(p => ({ ...p, locations: p.locations.includes('Other') ? p.locations.filter(l => l !== 'Other') : [...p.locations, 'Other'] }));
    } else {
      setForm(p => ({ ...p, locations: p.locations.includes(loc) ? p.locations.filter(l => l !== loc) : [...p.locations, loc] }));
    }
  };

  const toggleWork = (item) => {
    setError('');
    setForm(p => ({ ...p, workPerformed: p.workPerformed.includes(item) ? p.workPerformed.filter(w => w !== item) : [...p.workPerformed, item] }));
  };

  const validate = () => {
    if (!form.startTime)  return 'Start Time is required';
    if (!form.endTime)    return 'End Time is required';
    const s = toMins(form.startTime), e = toMins(form.endTime);
    if (s !== null && e !== null && e <= s) return 'End Time must be > Start Time';
    if (!form.locations || form.locations.length === 0) return 'Please select at least one location';
    if (form.locations.includes('Other') && !form.otherLocation.trim()) return 'Other Location Name is required';
    if (!form.roleType)   return 'Role Type is required';
    if (form.workPerformed.length === 0) return 'Select at least one Work Performed item';
    return null;
  };

  const save = async (status) => {
    if (status === 'Completed') { const err = validate(); if (err) { setError(err); return; } }
    setLoading(true);
    try {
      const cleanBasic = {
        university:   examBasic?.university   || editRecord?.university   || '',
        department:   examBasic?.department   || editRecord?.department   || '',
        examCategory: examBasic?.examCategory || editRecord?.examCategory || '',
        date:         examBasic?.date         || (editRecord?.date ? new Date(editRecord.date).toISOString().split('T')[0] : ''),
        role:         examBasic?.role         || editRecord?.role         || 'Other',
        block:        examBasic?.block        || editRecord?.block        || '',
        room:         examBasic?.room         || editRecord?.room         || 'N/A',
      };

      const generalDuty = { ...form };

      if (isEdit) {
        await examService.updateExam(editRecord._id, {
          ...cleanBasic,
          recordType: 'general',
          generalDuty,
          status,
        });
      } else {
        await examService.createExam({
          ...cleanBasic,
          examDetails: [],
          recordType: 'general',
          status,
          generalDuty,
        });
      }

      toast.success(status === 'Draft' ? 'Saved as Draft 📝' : 'General duty updated successfully! ✅');
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const items = form.roleType ? (WORK_ITEMS[form.roleType] || []) : [];
  const hasOtherLoc = form.locations.includes('Other');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div className="gen-modal-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-2xl)', width: '100%', maxWidth: 660, maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 80px rgba(0,0,0,.3)', border: '1px solid var(--border)', animation: 'scaleIn .35s ease', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--pro-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pro)', fontSize: 15, flexShrink: 0 }}>
                <i className="ti ti-clipboard-text" />
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 17, fontWeight: 700, color: 'var(--pro)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isEdit ? 'Edit General Duty' : 'General Duty Details'}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Role: <strong style={{ color: 'var(--text-sub)' }}>Other</strong> · Date: <strong style={{ color: 'var(--text-sub)' }}>{examBasic?.date || editRecord?.date?.split('T')[0]}</strong>
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

          {/* Timing */}
          <div>
            <SH color="var(--pro)" label="Duty Timing" icon="ti-clock" />
            <div className="gen-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 12px' }}>
              <div><label style={lS}>Start Time {rD}</label><input type="time" name="startTime" value={form.startTime} onChange={handle} style={iB} /></div>
              <div><label style={lS}>End Time {rD}</label><input type="time" name="endTime" value={form.endTime} onChange={handle} style={iB} /></div>
              <div><label style={lS}>Total Duty Hours (Auto)</label>
                <input value={form.totalDutyHours || '—'} readOnly style={{ ...iB, background: form.totalDutyHours ? 'var(--success-light)' : 'var(--bg-hover)', color: form.totalDutyHours ? 'var(--success-text)' : 'var(--text-muted)', borderColor: form.totalDutyHours ? 'var(--success-border)' : 'var(--border)', cursor: 'default', fontWeight: form.totalDutyHours ? 600 : 400 }} />
              </div>
            </div>
          </div>

          {/* Locations */}
          <div>
            <SH color="var(--primary)" label="Work Location (Multi-select)" icon="ti-map-pin" />
            <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
              <div className="gen-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 12px' }}>
                {LOCATIONS.filter(l => l !== 'Other').map(loc => {
                  const checked = form.locations.includes(loc);
                  return (
                    <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12, color: checked ? 'var(--text-main)' : 'var(--text-sub)', fontWeight: checked ? 600 : 400 }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleLocation(loc)} style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }} />
                      {loc}
                    </label>
                  );
                })}
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12, color: hasOtherLoc ? 'var(--text-main)' : 'var(--text-sub)', fontWeight: hasOtherLoc ? 600 : 400 }}>
                  <input type="checkbox" checked={hasOtherLoc} onChange={() => toggleLocation('Other')} style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }} />
                  Other
                </label>
              </div>
              {hasOtherLoc && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <label style={lS}>Other Location Name {rD}</label>
                  <input name="otherLocation" value={form.otherLocation} onChange={handle} placeholder="Enter location name" style={iB} />
                </div>
              )}
            </div>
          </div>

          {/* Role Type */}
          <div>
            <SH color="var(--warning)" label="Role Type" icon="ti-user-check" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROLE_TYPES.map(role => {
                const active = form.roleType === role;
                return (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--r-full)', border: `1.5px solid ${active ? 'var(--warning)' : 'var(--border)'}`, background: active ? 'var(--warning-light)' : 'var(--bg-page)', color: active ? 'var(--warning-text)' : 'var(--text-muted)', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                    <input type="radio" name="roleType" value={role} checked={active} onChange={handle} style={{ accentColor: 'var(--warning)', width: 13, height: 13 }} />
                    {role}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Work Performed */}
          {form.roleType && (
            <div>
              <SH color="var(--success)" label="Work Performed" icon="ti-checklist" />
              <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
                <div className="gen-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {items.map(item => {
                    const checked = form.workPerformed.includes(item);
                    return (
                      <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: checked ? 'var(--text-main)' : 'var(--text-sub)', fontWeight: checked ? 600 : 400 }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleWork(item)} style={{ width: 14, height: 14, accentColor: 'var(--success)', cursor: 'pointer', flexShrink: 0 }} />
                        {item}
                      </label>
                    );
                  })}
                </div>
                {form.roleType === 'Other' && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <label style={lS}>Custom Work Description</label>
                    <input name="otherWork" value={form.otherWork} onChange={handle} placeholder="Describe work..." style={iB} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <SH color="var(--text-muted)" label="Remarks (Optional)" icon="ti-message" />
            <textarea name="remarks" value={form.remarks} onChange={handle} placeholder="What did you work on today?" rows={3} style={{ ...iB, resize: 'vertical', minHeight: 70, lineHeight: 1.6 }} />
          </div>
        </div>

        {/* Footer */}
        <div className="gen-footer-row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: 'var(--bg-card)' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-sub)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => save('Draft')} disabled={loading} style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-sub)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-device-floppy" style={{ fontSize: 13 }} />Save Draft
          </button>
          <button onClick={() => save('Completed')} disabled={loading} style={{ padding: '8px 20px', borderRadius: 'var(--r-md)', border: 'none', background: loading ? '#9ca3af' : 'var(--pro)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: loading ? 'none' : '0 2px 8px rgba(124,58,237,.35)' }}>
            {loading ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />Saving...</> : <><i className="ti ti-check" style={{ fontSize: 13 }} />{isEdit ? 'Update' : 'Submit'}</>}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:640px){
          .gen-modal-card { max-width: 95% !important; max-height: 90vh !important; }
          .gen-grid-3 { grid-template-columns: 1fr !important; gap: 10px !important; }
          .gen-grid-2 { grid-template-columns: 1fr !important; gap: 10px !important; }
          .gen-footer-row { flex-direction: column-reverse !important; }
          .gen-footer-row button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}