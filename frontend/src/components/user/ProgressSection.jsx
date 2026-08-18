// src/components/user/ProgressSection.jsx — Desktop Normal Layout & 2x2 Grid ONLY on Mobile View

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

/* ── Animated counter ── */
const useCountUp = (target, duration = 1000) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    if (ref.current) cancelAnimationFrame(ref.current);
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(parseFloat((target * e).toFixed(1)));
      if (p < 1) ref.current = requestAnimationFrame(animate);
      else setValue(target);
    };
    ref.current = requestAnimationFrame(animate);
    return () => ref.current && cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return value;
};

/* ── Parse HH:MM to minutes ── */
const toMins = (t) => {
  if (!t || typeof t !== 'string') return null;
  const parts = t.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

/* ── Parse duration string (e.g. "2h", "1h 30m") to minutes ── */
const parseDurationToMins = (str) => {
  if (!str || typeof str !== 'string') return 0;
  let totalMins = 0;
  const hMatch = str.match(/([\d.]+)\s*(?:h|hour|hours)/i);
  if (hMatch) totalMins += Math.round(parseFloat(hMatch[1]) * 60);
  const mMatch = str.match(/([\d.]+)\s*(?:m|min|mins)/i);
  if (mMatch) totalMins += Math.round(parseFloat(mMatch[1]));
  return totalMins;
};

/* ── Format total minutes to "Xh Ym" format ── */
const formatHours = (totalMins) => {
  if (!totalMins || totalMins <= 0) return '0h';
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/* ── Calculate minutes and start/end time for ANY single record ── */
const calcRecordDetails = (record) => {
  if (!record || record.status !== 'Completed') return { mins: 0, startStr: '—', endStr: '—' };

  if (record.recordType === 'lab' && record.labDuty) {
    const s = toMins(record.labDuty.startTime);
    const e = toMins(record.labDuty.endTime);
    const mins = (s !== null && e !== null && e > s) ? (e - s) : parseDurationToMins(record.labDuty.totalHours);
    return { mins, startStr: minsToTime(s), endStr: minsToTime(e) };
  }

  if (record.recordType === 'general' && record.generalDuty) {
    const s = toMins(record.generalDuty.startTime);
    const e = toMins(record.generalDuty.endTime);
    const mins = (s !== null && e !== null && e > s) ? (e - s) : parseDurationToMins(record.generalDuty.totalDutyHours);
    return { mins, startStr: minsToTime(s), endStr: minsToTime(e) };
  }

  const details = record.examDetails || [];
  if (!details.length) return { mins: 0, startStr: '—', endStr: '—' };
  let minStart = null;
  let maxEnd = null;
  let totalExamMins = 0;
  for (const d of details) {
    const s = toMins(d.fromTime);
    const e = toMins(d.toTime);
    if (s !== null && (minStart === null || s < minStart)) minStart = s;
    if (e !== null && (maxEnd === null || e > maxEnd)) maxEnd = e;
    totalExamMins += parseDurationToMins(d.duration);
  }
  const mins = (minStart !== null && maxEnd !== null && maxEnd > minStart) ? (maxEnd - minStart) : totalExamMins;
  return { mins, startStr: minsToTime(minStart), endStr: minsToTime(maxEnd) };
};

const minsToTime = (m) => {
  if (m === null || m === undefined) return '—';
  const h    = Math.floor(m / 60);
  const min  = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(min).padStart(2,'0')} ${ampm}`;
};

const HoursModal = ({ records, totalHoursStr, onClose }) => {
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const completedRecords = (records || []).filter(r => r.status === 'Completed');
  const safeDate = (d) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return '—'; } };
  const sortedRecords = [...completedRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  const maxM = Math.max(...sortedRecords.map(r => calcRecordDetails(r).mins), 1);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:7000, background:'rgba(0,0,0,.5)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="ps-modal-card" style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 25px 80px rgba(0,0,0,.2)', border:'1px solid #e5e7eb', animation:'scaleIn .35s ease', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:'#111827', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:32, height:32, borderRadius:9, background:'#ede9fe', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#7c3aed' }}>
                <i className="ti ti-clock"/>
              </span>
              Hours Breakdown
            </div>
            <div style={{ fontSize:12, color:'#6b7280', marginTop:3 }}>
              Total: <strong style={{ color:'#7c3aed' }}>{totalHoursStr}</strong> across {sortedRecords.length} duty record{sortedRecords.length!==1?'s':''}
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb', color:'#6b7280', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15, flexShrink:0 }}>
            <i className="ti ti-x"/>
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'14px 22px' }}>
          {sortedRecords.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af' }}>No completed records yet</div>
          ) : sortedRecords.map((rec) => {
            const { mins, startStr, endStr } = calcRecordDetails(rec);
            const hoursStr = formatHours(mins);
            const dutyType = rec.recordType === 'lab' ? 'Lab Duty' : rec.recordType === 'general' ? 'General Duty' : 'Exam Duty';
            const title = rec.recordType === 'lab' ? (rec.labDuty?.labName || rec.university) : rec.recordType === 'general' ? (rec.generalDuty?.location || rec.university) : rec.university;

            return (
              <div key={rec._id} style={{ marginBottom:16, padding:'12px 14px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4, flexWrap:'wrap', gap:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background: rec.recordType==='lab'?'#d1fae5':rec.recordType==='general'?'#ede9fe':'#dbeafe', color: rec.recordType==='lab'?'#065f46':rec.recordType==='general'?'#6d28d9':'#1e40af' }}>
                      {dutyType}
                    </span>
                    <span style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{safeDate(rec.date)}</span>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#7c3aed' }}>{hoursStr}</div>
                </div>
                <div style={{ fontSize:12, color:'#4b5563', fontWeight:600, marginBottom:4 }}>{title} — {rec.examCategory}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:'#6b7280', marginBottom:6, flexWrap:'wrap' }}>
                  <span>Role: {rec.role}</span>
                  <span>{startStr} – {endStr}</span>
                </div>
                <div style={{ height:6, background:'#e5e7eb', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(mins/maxM)*100}%`, background:'linear-gradient(90deg,#7c3aed,#a855f7)', borderRadius:3 }}/>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding:'14px 22px', borderTop:'1px solid #f3f4f6', background:'#f9fafb', flexShrink:0 }}>
          <button onClick={onClose} style={{ width:'100%', padding:'10px 0', border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer' }}>
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
};

const ExamsModal = ({ records, totalExams, onClose }) => {
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const completed = (records||[]).filter(r => r.status === 'Completed');
  const safeDate = (d) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return '—'; } };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:7000, background:'rgba(0,0,0,.5)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="ps-modal-card" style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:620, maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 25px 80px rgba(0,0,0,.2)', border:'1px solid #e5e7eb', animation:'scaleIn .35s ease', overflow:'hidden' }}>
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:'#111827', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:32, height:32, borderRadius:9, background:'#dbeafe', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#2563eb' }}>
                <i className="ti ti-clipboard-list"/>
              </span>
              Completed Duty Records
            </div>
            <div style={{ fontSize:12, color:'#6b7280', marginTop:3 }}>
              Total: <strong style={{ color:'#2563eb' }}>{totalExams}</strong> submitted record{totalExams!==1?'s':''}
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb', color:'#6b7280', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15, flexShrink:0 }}>
            <i className="ti ti-x"/>
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'14px 22px' }}>
          {completed.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af' }}>No completed records yet</div>
          ) : completed.map((rec, i) => {
            const { mins } = calcRecordDetails(rec);
            const hStr = formatHours(mins);
            const title = rec.recordType === 'lab' ? (rec.labDuty?.labName || rec.university) : rec.recordType === 'general' ? (rec.generalDuty?.location || rec.university) : rec.university;
            return (
              <div key={rec._id} style={{ display:'flex', gap:14, padding:'12px 14px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, marginBottom:10 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:'#dbeafe', color:'#1e40af', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0, marginTop:2 }}>{i+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:6, marginBottom:6 }}>
                    <div style={{ fontWeight:700, color:'#111827', fontSize:13 }}>{title} — {rec.examCategory}</div>
                    <span style={{ background:'#d1fae5', color:'#065f46', fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:20 }}>Completed</span>
                  </div>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:11 }}>
                    {[
                      { icon:'ti-calendar',  val: safeDate(rec.date) },
                      { icon:'ti-briefcase', val: rec.role },
                      { icon:'ti-building',  val: rec.block ? `Block ${rec.block}` : null },
                      { icon:'ti-door',      val: rec.room  ? `Room ${rec.room}`  : null },
                      { icon:'ti-clock',     val: hStr, color:'#7c3aed' },
                    ].filter(r=>r.val).map(r=>(
                      <span key={r.icon} style={{ display:'inline-flex', alignItems:'center', gap:4, color:r.color||'#6b7280' }}>
                        <i className={`ti ${r.icon}`} style={{ fontSize:12 }}/>{r.val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding:'14px 22px', borderTop:'1px solid #f3f4f6', background:'#f9fafb', flexShrink:0 }}>
          <button onClick={onClose} style={{ width:'100%', padding:'10px 0', border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DonutChart = ({ segments, size = 80, thickness = 12 }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (!total) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={(size/2)-thickness/2} fill="none" stroke="#f3f4f6" strokeWidth={thickness}/>
    </svg>
  );
  const r = (size/2) - thickness/2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap  = circ - dash;
        const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={seg.color} strokeWidth={thickness} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} strokeLinecap="round"/>;
        offset += dash;
        return el;
      })}
    </svg>
  );
};

const BarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:60, padding:'0 2px', width:'100%' }}>
      {data.map((d, i) => {
        const pct = Math.max((d.value / max) * 100, d.value > 0 ? 8 : 0);
        return (
          <div key={i} title={`${d.label}: ${d.value} record${d.value!==1?'s':''}`}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', minWidth:0 }}>
            <div style={{
              width: '100%', height: `${pct}%`, borderRadius: '4px 4px 0 0',
              background: d.value > 0 ? `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)` : 'var(--border)',
              transition: 'height 1s cubic-bezier(.34,1.56,.64,1)', minHeight: d.value > 0 ? 4 : 1,
              boxShadow: d.value > 0 ? `0 2px 8px ${color}55` : 'none', position: 'relative',
            }}>
              {d.value > 0 && (
                <div style={{ position:'absolute', top:-18, left:'50%', transform:'translateX(-50%)', fontSize:9, fontWeight:700, color:color, whiteSpace:'nowrap' }}>{d.value}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function ProgressSection({ stats, records = [], onPdfClick }) {
  const [showHours, setShowHours] = useState(false);
  const [showExams, setShowExams] = useState(false);

  if (!stats) return null;

  let totalMinsSum = 0;
  let monthMinsSum = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  (records || []).forEach(r => {
    if (r.status === 'Completed') {
      const { mins } = calcRecordDetails(r);
      totalMinsSum += mins;
      if (r.date) {
        const rDate = new Date(r.date);
        if (rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear) {
          monthMinsSum += mins;
        }
      }
    }
  });

  const totalExams = records.filter(r => r.status === 'Completed').length;
  const totalHoursStr = formatHours(totalMinsSum);
  const monthHoursStr = formatHours(monthMinsSum);

  const thisMonthExams = records.filter(r => r.status === 'Completed' && r.date && new Date(r.date).getMonth() === currentMonth && new Date(r.date).getFullYear() === currentYear).length;

  const animExams  = useCountUp(totalExams, 1000);
  const animMonth  = useCountUp(thisMonthExams, 800);

  const completed = records.filter(r => r.status === 'Completed').length;
  const draft     = records.filter(r => r.status === 'Draft').length;
  const cancelled = records.filter(r => r.status === 'Cancelled').length;

  const donutSegs = [
    { value: completed, color: '#10b981', label: 'Completed' },
    { value: draft,     color: '#3b82f6', label: 'Draft'     },
    { value: cancelled, color: '#ef4444', label: 'Cancelled' },
  ].filter(s => s.value > 0);

  const monthlyData = (() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d  = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m  = d.getMonth();
      const y  = d.getFullYear();
      const cnt = records.filter(r => r.status === 'Completed' && r.date && new Date(r.date).getMonth()===m && new Date(r.date).getFullYear()===y).length;
      out.push({ label: d.toLocaleString('default',{month:'short'}), value: cnt });
    }
    return out;
  })();

  const cardStyle = (clickable) => ({
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'all .2s ease', flex: 1, minWidth: 0,
  });

  return (
    <>
      <section style={{ padding:'20px 24px', background:'var(--bg-page)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text-main)' }}>Progress Overview</div>
          {typeof onPdfClick === 'function' && (
            <button onClick={onPdfClick} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#dc2626', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(220,38,38,.35)' }}>
              <i className="ti ti-file-type-pdf" style={{ fontSize:14 }}/>Download PDF
            </button>
          )}
        </div>

        {/* 🌟 Top 4 Cards Grid: Normal on Desktop (4 columns), 2x2 Grid ONLY on Mobile */}
        <div className="ps-grid-top" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
          
          {/* Total Exams */}
          <div style={cardStyle(true)} onClick={() => setShowExams(true)}
            onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 4px 16px rgba(37,99,235,.15)'; e.currentTarget.style.borderColor='#bfdbfe'; }}
            onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor='var(--border)'; }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#2563eb' }}>
                <i className="ti ti-clipboard-list"/>
              </div>
              <span style={{ fontSize:9, fontWeight:600, color:'#2563eb', background:'#eff6ff', padding:'2px 7px', borderRadius:20, display:'flex', alignItems:'center', gap:3 }}>
                <i className="ti ti-click" style={{ fontSize:9 }}/> Details
              </span>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:'var(--text-main)', lineHeight:1, marginBottom:3 }}>{Math.round(animExams)}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>Total Exams</div>
          </div>

          {/* Total Hours */}
          <div style={cardStyle(true)} onClick={() => setShowHours(true)}
            onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 4px 16px rgba(124,58,237,.15)'; e.currentTarget.style.borderColor='#ddd6fe'; }}
            onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor='var(--border)'; }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#7c3aed' }}>
                <i className="ti ti-clock"/>
              </div>
              <span style={{ fontSize:9, fontWeight:600, color:'#7c3aed', background:'#f5f3ff', padding:'2px 7px', borderRadius:20, display:'flex', alignItems:'center', gap:3 }}>
                <i className="ti ti-click" style={{ fontSize:9 }}/> Details
              </span>
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text-main)', lineHeight:1, marginBottom:3, whiteSpace:'nowrap' }}>{totalHoursStr}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>Total Hours</div>
          </div>

          {/* This Month Exams */}
          <div style={cardStyle(false)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#d97706' }}>
                <i className="ti ti-calendar-stats"/>
              </div>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:'var(--text-main)', lineHeight:1, marginBottom:3 }}>{Math.round(animMonth)}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>This Month</div>
          </div>

          {/* This Month Hours */}
          <div style={cardStyle(false)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#16a34a' }}>
                <i className="ti ti-trending-up"/>
              </div>
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text-main)', lineHeight:1, marginBottom:3, whiteSpace:'nowrap' }}>{monthHoursStr}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>Month Hours</div>
          </div>
        </div>

        {/* 🌟 Bottom 2 Charts Grid */}
        <div className="ps-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          
          {/* Status Donut */}
          <div style={{ ...cardStyle(false), display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text-main)' }}>Status Breakdown</div>
            <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <DonutChart segments={donutSegs.length?donutSegs:[{value:1,color:'#f3f4f6'}]} size={90} thickness={14}/>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                  <div style={{ fontSize:18, fontWeight:800, color:'var(--text-main)', lineHeight:1 }}>{records.length}</div>
                  <div style={{ fontSize:8, color:'var(--text-muted)', fontWeight:500, textTransform:'uppercase', letterSpacing:'.05em' }}>Total</div>
                </div>
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, minWidth:120 }}>
                {[
                  { label:'Completed', value:completed, color:'#10b981', bg:'#d1fae5' },
                  { label:'Draft',     value:draft,     color:'#3b82f6', bg:'#dbeafe' },
                  { label:'Cancelled', value:cancelled, color:'#ef4444', bg:'#fee2e2' },
                ].map(s=>(
                  <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:s.color, flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:'var(--text-sub)', fontWeight:500 }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:s.color, background:s.bg, padding:'1px 8px', borderRadius:20 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Bar */}
          <div style={{ ...cardStyle(false), display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text-main)' }}>Monthly Activity</div>
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>Last 6 months</span>
            </div>
            <div style={{ paddingTop:20, width:'100%', overflowX:'hidden' }}>
              <BarChart data={monthlyData} color="#2563eb"/>
            </div>
            <div style={{ display:'flex', gap:3 }}>
              {monthlyData.map((d,i)=>(
                <div key={i} style={{ flex:1, textAlign:'center', fontSize:9, color:'var(--text-muted)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.label}</div>
              ))}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', borderTop:'1px solid var(--border)', paddingTop:8 }}>Completed records per month</div>
          </div>
        </div>
      </section>

      {showHours && <HoursModal records={records} totalHoursStr={totalHoursStr} onClose={() => setShowHours(false)}/>}
      {showExams && <ExamsModal records={records} totalExams={totalExams} onClose={() => setShowExams(false)}/>}

      <style>{`
        @media (max-width: 768px) {
          .ps-grid-top { grid-template-columns: repeat(2, 1fr) !important; }
          .ps-grid-2 { grid-template-columns: 1fr !important; }
          .ps-modal-card { max-width: calc(100vw - 24px) !important; }
        }
      `}</style>
    </>
  );
}