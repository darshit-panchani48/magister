// src/components/user/ViewRecordModal.jsx — Complete, Responsive & Side-by-Side Year Cards

import React, { useEffect } from 'react';
import { format } from 'date-fns';

const YC = {
  FY:      { bg: '#fdf2f8', border: '#f0abfc', text: '#a21caf' },
  SY:      { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  TY:      { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  HONOURS: { bg: '#fefce8', border: '#fde68a', text: '#92400e' },
};

const fmtTime = (t) => {
  if (!t) return '—';
  if (t.includes('AM') || t.includes('PM')) return t;
  const parts = t.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return t;
  const [h, m] = parts;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const safeDate = (d) => {
  try { return format(new Date(d), 'dd MMM yyyy'); }
  catch { return d || '—'; }
};

const StatusBadge = ({ status }) => {
  const m = {
    Completed: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    Draft:     { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    Cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  };
  const s = m[status] || m.Draft;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  );
};

const Field = ({ label, value, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
      {label}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--text-main)', wordBreak: 'break-word' }}>
      {value || '—'}
    </div>
  </div>
);

const SH = ({ color, label, icon }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 3, height: 14, background: color, borderRadius: 2, display: 'inline-block' }} />
    {icon && <i className={`ti ${icon}`} style={{ color, fontSize: 13 }} />}
    {label}
  </div>
);

export default function ViewRecordModal({ record, onClose }) {
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  if (!record) return null;
  const rType = record.recordType || 'exam';

  // Helper to format general duty locations nicely
  const getLocationsStr = () => {
    const gd = record.generalDuty;
    if (!gd) return '—';
    if (Array.isArray(gd.locations) && gd.locations.length > 0) {
      return gd.locations.map(l => l === 'Other' ? (gd.otherLocation || 'Other') : l).join(', ');
    }
    if (gd.location) {
      return gd.location === 'Other' ? (gd.otherLocation || 'Other') : gd.location;
    }
    return '—';
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 6000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
      <div className="vrm-card" style={{ background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 900, maxHeight: 'calc(100vh - 32px)', boxShadow: '0 25px 80px rgba(0,0,0,.25)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'scaleIn .3s ease' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {rType === 'lab' && (
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontSize: 16, flexShrink: 0 }}>
                <i className="ti ti-flask" />
              </div>
            )}
            {rType === 'general' && (
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--pro-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pro)', fontSize: 16, flexShrink: 0 }}>
                <i className="ti ti-clipboard-text" />
              </div>
            )}
            {rType === 'exam' && (
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 16, flexShrink: 0 }}>
                <i className="ti ti-clipboard-list" />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {rType === 'lab' ? 'Lab Duty Details' : rType === 'general' ? 'General Duty Details' : 'Exam Supervision Details'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {record.university} · {record.department} · {record.examCategory}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Basic Info — ALL types */}
          <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
            <SH color="var(--primary)" label="Basic Information" icon="ti-info-circle" />
            <div className="vrm-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 20px' }}>
              <Field label="University"    value={record.university} />
              <Field label="Department"    value={record.department} />
              <Field label="Exam Category" value={record.examCategory} />
              <Field label="Date"          value={safeDate(record.date)} />
              <Field label="Role"          value={record.role} />
              <Field label="Block"         value={record.block} />
              <Field label="Room"          value={record.room} />
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Status</div>
                <StatusBadge status={record.status} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Record Type</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: rType === 'lab' ? 'var(--success-light)' : rType === 'general' ? 'var(--pro-light)' : 'var(--primary-light)', color: rType === 'lab' ? 'var(--success-text)' : rType === 'general' ? 'var(--pro-text)' : 'var(--primary-text)' }}>
                  <i className={`ti ${rType === 'lab' ? 'ti-flask' : rType === 'general' ? 'ti-clipboard-text' : 'ti-clipboard-list'}`} style={{ fontSize: 10 }} />
                  {rType === 'lab' ? 'Lab Duty' : rType === 'general' ? 'General Duty' : 'Exam'}
                </span>
              </div>
            </div>
          </div>

          {/* LAB DUTY */}
          {rType === 'lab' && record.labDuty && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: 14, padding: '18px 22px' }}>
                <SH color="var(--success)" label="Lab Information" icon="ti-flask" />
                <div className="vrm-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 20px' }}>
                  <Field label="Lab Name"   value={record.labDuty.labName} />
                  <Field label="Floor"      value={record.labDuty.floor} />
                  <Field label="Lab Number" value={record.labDuty.labNumber} />
                </div>
              </div>

              <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 14, padding: '18px 22px' }}>
                <SH color="var(--primary)" label="Exam Information" icon="ti-book" />
                <div className="vrm-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 20px' }}>
                  <Field label="Exam Name" value={record.labDuty.examName} />
                  <Field label="Subject"   value={record.labDuty.subject} />
                  <Field label="Semester"  value={record.labDuty.semester} />
                  <Field label="Exam Type" value={record.labDuty.examType} />
                </div>
              </div>

              <div className="vrm-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--pro-light)', border: '1px solid var(--pro-border)', borderRadius: 14, padding: '18px 22px' }}>
                  <SH color="var(--pro)" label="Timing" icon="ti-clock" />
                  <Field label="Start Time"  value={fmtTime(record.labDuty.startTime)} />
                  <Field label="End Time"    value={fmtTime(record.labDuty.endTime)} />
                  <Field label="Total Hours" value={record.labDuty.totalHours} color="var(--pro)" />
                </div>
                <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning-border)', borderRadius: 14, padding: '18px 22px' }}>
                  <SH color="var(--warning)" label="Student Details" icon="ti-users" />
                  <Field label="Start Roll No"   value={record.labDuty.startRollNo} />
                  <Field label="End Roll No"     value={record.labDuty.endRollNo} />
                  <Field label="Total Students"  value={String(record.labDuty.totalStudents   || 0)} color="var(--success)" />
                  <Field label="Absent"          value={String(record.labDuty.absentStudents  || 0)} color="var(--warning)" />
                  <Field label="Expelled"        value={String(record.labDuty.expelledStudents|| 0)} color="var(--danger)" />
                </div>
              </div>
            </div>
          )}

          {/* GENERAL DUTY */}
          {rType === 'general' && record.generalDuty && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="vrm-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--pro-light)', border: '1px solid var(--pro-border)', borderRadius: 14, padding: '18px 22px' }}>
                  <SH color="var(--pro)" label="Duty Timing" icon="ti-clock" />
                  <Field label="Start Time"       value={fmtTime(record.generalDuty.startTime)} />
                  <Field label="End Time"         value={fmtTime(record.generalDuty.endTime)} />
                  <Field label="Total Duty Hours" value={record.generalDuty.totalDutyHours} color="var(--pro)" />
                </div>
                <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 14, padding: '18px 22px' }}>
                  <SH color="var(--primary)" label="Location & Role" icon="ti-map-pin" />
                  <Field label="Location"  value={getLocationsStr()} />
                  <Field label="Role Type" value={record.generalDuty.roleType} />
                </div>
              </div>

              {record.generalDuty.workPerformed?.length > 0 && (
                <div style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: 14, padding: '18px 22px' }}>
                  <SH color="var(--success)" label="Work Performed" icon="ti-checklist" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {record.generalDuty.workPerformed.map(w => (
                      <span key={w} style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <i className="ti ti-check" style={{ fontSize: 10 }} />{w}
                      </span>
                    ))}
                  </div>
                  {record.generalDuty.otherWork && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-sub)' }}>
                      <strong>Custom:</strong> {record.generalDuty.otherWork}
                    </div>
                  )}
                </div>
              )}

              {record.generalDuty.remarks && (
                <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px' }}>
                  <SH color="var(--text-muted)" label="Remarks" icon="ti-message" />
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>{record.generalDuty.remarks}</p>
                </div>
              )}
            </div>
          )}

          {/* EXAM year-wise (🌟 Side-by-Side Grid with Auto Responsive Stack) */}
          {rType === 'exam' && record.examDetails?.length > 0 && (
            <div>
              <SH color="var(--primary)" label="Year-wise Exam Details" icon="ti-calendar" />
              <div className="vrm-exam-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(record.examDetails.length, 3)}, 1fr)`, gap: 16 }}>
                {record.examDetails.map(d => {
                  const c = YC[d.year] || YC.FY;
                  return (
                    <div key={d.year} style={{ border: `1.5px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
                      <div style={{ background: c.bg, padding: '10px 14px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: c.text, borderBottom: `1px solid ${c.border}` }}>
                        {d.year}
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        {[
                          { l: 'Semester',    v: d.semester },
                          { l: 'Exam Name',   v: d.examName },
                          { l: 'Subject',     v: d.subject },
                          { l: 'Exam Type',   v: d.examType },
                          { l: 'Exam Nature', v: d.examNature },
                          { l: 'Medium',      v: d.medium },
                          { l: 'Duration',    v: d.duration },
                          { l: 'From Time',   v: fmtTime(d.fromTime) },
                          { l: 'To Time',     v: fmtTime(d.toTime) },
                        ].map(f => (
                          <div key={f.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{f.l}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>{f.v || '—'}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6 }}>
                          {[
                            { l: 'Total',    v: d.totalStudents,    c: 'var(--text-main)' },
                            { l: 'Present',  v: d.presentStudents,  c: 'var(--success)' },
                            { l: 'Absent',   v: d.absentStudents,   c: 'var(--warning)' },
                            { l: 'Expelled', v: d.expelledStudents, c: 'var(--danger)' },
                          ].map(s => (
                            <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.l}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: s.c }}>{s.v ?? '—'}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Start Roll</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{d.startRollNo || '—'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>End Roll</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{d.endRollNo || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {record.createdAt && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
              Added: {format(new Date(record.createdAt), 'dd MMM yyyy, hh:mm a')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', textAlign: 'right', flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: '100%', padding: '11px 0', border: '1.5px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-sub)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>

      </div>
      <style>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }
        @media (max-width: 768px) {
          .vrm-card { max-width: 100% !important; max-height: calc(100vh - 16px) !important; }
          .vrm-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .vrm-grid-2 { grid-template-columns: 1fr !important; }
          .vrm-exam-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .vrm-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}