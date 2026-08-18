// src/components/user/PdfDownloadModal.jsx — Fully Responsive, Centered Back Button & No Text Cutting

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import examService from '../../services/examService';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${ampm}`;
};
const safeDate = (d) => {
  try { return format(new Date(d), 'dd MMM yyyy'); } catch { return '—'; }
};
const toMins = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (isNaN(h) || isNaN(m)) ? 0 : h * 60 + m;
};
const minsToStr = (mins) => {
  if (!mins || mins <= 0) return '0h';
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};
const calcRecordMins = (r) => {
  const rType = r.recordType || 'exam';
  if (rType === 'lab' && r.labDuty) {
    const s = toMins(r.labDuty.startTime), e = toMins(r.labDuty.endTime);
    return e > s ? e - s : 0;
  }
  if (rType === 'general' && r.generalDuty) {
    const s = toMins(r.generalDuty.startTime), e = toMins(r.generalDuty.endTime);
    return e > s ? e - s : 0;
  }
  let minStart = null, maxEnd = null;
  for (const d of (r.examDetails || [])) {
    const s = toMins(d.fromTime), e = toMins(d.toTime);
    if (s !== null && (minStart === null || s < minStart)) minStart = s;
    if (e !== null && (maxEnd === null || e > maxEnd)) maxEnd = e;
  }
  if (minStart !== null && maxEnd !== null && maxEnd > minStart) return maxEnd - minStart;
  return 0;
};

// ── Full Detailed HTML string builder for Print / PDF ────────────────────────
const buildFullHTML = (records, from, to, name, totalMins) => {
  const rows = records.map((r, i) => {
    const rType   = r.recordType || 'exam';
    const recMins = calcRecordMins(r);
    let details   = '';

    if (rType === 'lab' && r.labDuty) {
      details = `
        <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 8px 10px; margin-top: 6px; border-radius: 4px;">
          <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">🔬 Lab Duty — ${minsToStr(recMins)}</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; font-size: 9.5px; color: #374151;">
            <span><b>Lab Name:</b> ${r.labDuty.labName||'—'}</span>
            <span><b>Floor:</b> ${r.labDuty.floor||'—'}</span>
            <span><b>Lab No:</b> ${r.labDuty.labNumber||'—'}</span>
            <span><b>Year:</b> ${r.labDuty.year||'—'}</span>
            <span><b>Semester:</b> ${r.labDuty.semester||'—'}</span>
            <span><b>Exam Type:</b> ${r.labDuty.examType||'—'}</span>
            <span><b>Exam Name:</b> ${r.labDuty.examName||'—'}</span>
            <span><b>Subject:</b> ${r.labDuty.subject||'—'}</span>
            <span><b>Time:</b> ${fmtTime(r.labDuty.startTime)} – ${fmtTime(r.labDuty.endTime)}</span>
            <span><b>Roll Range:</b> ${r.labDuty.startRollNo||'—'} – ${r.labDuty.endRollNo||'—'}</span>
            <span><b>Total Students:</b> ${r.labDuty.totalStudents||0}</span>
            <span><b>Absent:</b> ${r.labDuty.absentStudents||0} | <b>Expelled:</b> ${r.labDuty.expelledStudents||0}</span>
          </div>
        </div>`;
    } else if (rType === 'general' && r.generalDuty) {
      const locs = r.generalDuty.locations?.length ? r.generalDuty.locations.join(', ') : (r.generalDuty.location || '—');
      details = `
        <div style="background: #faf5ff; border-left: 3px solid #7c3aed; padding: 8px 10px; margin-top: 6px; border-radius: 4px;">
          <div style="font-weight: 700; color: #5b21b6; margin-bottom: 4px;">📋 General Duty — ${minsToStr(recMins)}</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; font-size: 9.5px; color: #374151;">
            <span><b>Time:</b> ${fmtTime(r.generalDuty.startTime)} – ${fmtTime(r.generalDuty.endTime)}</span>
            <span><b>Location(s):</b> ${locs}</span>
            <span><b>Role Type:</b> ${r.generalDuty.roleType||'—'}</span>
            <span style="grid-column: span 3;"><b>Work Performed:</b> ${(r.generalDuty.workPerformed||[]).join(' • ')||'—'}</span>
            ${r.generalDuty.remarks ? `<span style="grid-column: span 3;"><b>Remarks:</b> ${r.generalDuty.remarks}</span>` : ''}
          </div>
        </div>`;
    } else {
      details = (r.examDetails || []).map(d => {
        const dStart = toMins(d.fromTime), dEnd = toMins(d.toTime);
        const dMins = (dStart !== null && dEnd !== null && dEnd > dStart) ? dEnd - dStart : 0;
        return `
          <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 8px 10px; margin-top: 6px; border-radius: 4px;">
            <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📝 ${d.year} — ${minsToStr(dMins)}</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; font-size: 9.5px; color: #374151;">
              <span><b>Exam Name:</b> ${d.examName||'—'}</span>
              <span><b>Subject:</b> ${d.subject||'—'}</span>
              <span><b>Semester:</b> ${d.semester||'—'}</span>
              <span><b>Exam Type:</b> ${d.examType||'—'}</span>
              <span><b>Nature:</b> ${d.examNature||'—'}</span>
              <span><b>Medium:</b> ${d.medium||'—'}</span>
              <span><b>Time:</b> ${fmtTime(d.fromTime)} – ${fmtTime(d.toTime)}</span>
              <span><b>Duration:</b> ${d.duration||'—'}</span>
              <span><b>Roll:</b> ${d.startRollNo||'—'} – ${d.endRollNo||'—'}</span>
              <span><b>Total:</b> ${d.totalStudents||0}</span>
              <span><b>Present:</b> ${d.presentStudents||0}</span>
              <span><b>Absent:</b> ${d.absentStudents||0} | <b>Expelled:</b> ${d.expelledStudents||0}</span>
            </div>
          </div>`;
      }).join('');
    }

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${i % 2 === 0 ? '#fff' : '#f8fafc'};">
        <td style="padding: 10px; color: #64748b; font-weight: 700; text-align: center; vertical-align: top;">${i + 1}</td>
        <td style="padding: 10px; vertical-align: top;"><b>${r.university}</b><div style="font-size: 9px; color: #64748b;">${r.department}</div></td>
        <td style="padding: 10px; vertical-align: top;">${r.examCategory}</td>
        <td style="padding: 10px; vertical-align: top; white-space: nowrap;">${safeDate(r.date)}</td>
        <td style="padding: 10px; vertical-align: top;">${r.role}</td>
        <td style="padding: 10px; vertical-align: top;">${r.room || '—'}</td>
        <td style="padding: 10px; vertical-align: top;"><span style="padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 700; background: ${rType==='lab'?'#dcfce7':rType==='general'?'#ede9fe':'#dbeafe'}; color: ${rType==='lab'?'#166534':rType==='general'?'#5b21b6':'#1e40af'};">${rType.toUpperCase()}</span></td>
        <td style="padding: 10px; vertical-align: top; color: #1e3a8a; font-weight: 800; white-space: nowrap;">${minsToStr(recMins)}</td>
        <td style="padding: 10px; vertical-align: top;">${details}</td>
      </tr>`;
  }).join('');

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; background: #fff; padding: 25px; width: 850px;">
      <div style="text-align: center; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 3px solid #1e3a8a;">
        <h1 style="font-size: 26px; font-weight: 900; color: #1e3a8a; letter-spacing: 3px; margin: 0 0 4px 0;">MAGISTER</h1>
        <h2 style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 3px 0;">Exam Remuneration Management System</h2>
        <h3 style="font-size: 11px; font-weight: 500; color: #64748b; margin: 0;">Atmanand Saraswati Science College, Surat</h3>
        <p style="font-size: 9.5px; color: #94a3b8; margin: 7px 0 0 0;">Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; border-top: 3px solid #1e3a8a;">
          <div style="font-size: 13px; font-weight: 800; color: #1e3a8a;">${name || '—'}</div>
          <div style="font-size: 8.5px; color: #64748b; text-transform: uppercase; margin-top: 3px;">Supervisor</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; border-top: 3px solid #1e3a8a;">
          <div style="font-size: 12px; font-weight: 800; color: #1e3a8a;">${safeDate(from)} – ${safeDate(to)}</div>
          <div style="font-size: 8.5px; color: #64748b; text-transform: uppercase; margin-top: 3px;">Period</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; border-top: 3px solid #1e3a8a;">
          <div style="font-size: 14px; font-weight: 800; color: #1e3a8a;">${records.length}</div>
          <div style="font-size: 8.5px; color: #64748b; text-transform: uppercase; margin-top: 3px;">Total Records</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; border-top: 3px solid #f59e0b;">
          <div style="font-size: 14px; font-weight: 800; color: #92400e;">${minsToStr(totalMins)}</div>
          <div style="font-size: 8.5px; color: #64748b; text-transform: uppercase; margin-top: 3px;">Total Hours</div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead>
          <tr style="background: #1e3a8a; color: #fff;">
            <th style="padding: 9px; text-align: left; font-size: 9px;">No</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">University / Dept</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">Category</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">Date</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">Role</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">Room</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">Type</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">Hours</th>
            <th style="padding: 9px; text-align: left; font-size: 9px;">Full Details</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="margin-top: 24px; text-align: center; font-size: 9.5px; color: #94a3b8; border-top: 2px solid #e2e8f0; padding-top: 14px;">
        <b style="color: #1e3a8a;">MAGISTER</b> — Exam Remuneration Management System &nbsp;|&nbsp; Atmanand Saraswati Science College, Surat
      </div>
    </div>
  `;
};

// ── Modal Component ───────────────────────────────────────────────────────────
export default function PdfDownloadModal({ profileName, onClose }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [preview,  setPreview]  = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const fetchRecords = async () => {
    if (!fromDate || !toDate) { setError('Please select both From and To dates'); return; }
    if (new Date(fromDate) > new Date(toDate)) { setError('From date must be before To date'); return; }
    setError(''); setLoading(true);
    try {
      let all = [], page = 1;
      while (true) {
        const res = await examService.getMyExams({ status: 'Completed', page, limit: 100 });
        all = [...all, ...(res.records || [])];
        if (page >= (res.pages || 1)) break;
        page++;
      }
      const from = new Date(fromDate);
      const to   = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      const filtered = all.filter(r => { const d = new Date(r.date); return d >= from && d <= to; });
      if (!filtered.length) { setError('No completed records found in this date range'); setLoading(false); return; }
      const totalMins = filtered.reduce((s, r) => s + calcRecordMins(r), 0);
      
      const fullHtmlString = buildFullHTML(filtered, fromDate, toDate, profileName, totalMins);
      setPreview({ records: filtered, totalMins, fullHtmlString });
    } catch { setError('Failed to fetch records. Please try again.'); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    if (!preview) return;
    const w = window.open('', '_blank');
    if (!w) { setError('Popup blocked! Please allow popups.'); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>Print Report</title></head><body>${preview.fullHtmlString}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const toastId = toast.loading('Generating HD PDF report... 📄');
    try {
      const element = reportRef.current;
      element.style.display = 'block';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      let pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Exam_Report_${safeDate(fromDate)}_to_${safeDate(toDate)}.pdf`;
      pdf.save(fileName);

      toast.success('HD PDF Downloaded successfully! ✅', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF file', { id: toastId });
      if (reportRef.current) reportRef.current.style.display = 'none';
    }
  };

  const iB = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid var(--border)', borderRadius: 9,
    fontSize: 13, background: 'var(--bg-input)', color: 'var(--text-main)',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', zIndex: 7000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div className="pdf-modal-card" style={{ background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: 'calc(100vh - 32px)', boxShadow: '0 25px 80px rgba(0,0,0,.3)', border: '1px solid var(--border)', animation: 'scaleIn .3s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--danger)', flexShrink: 0 }}>
              <i className="ti ti-file-type-pdf" />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Export Detailed Report</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Choose Print or Full HD PDF Download</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15, flexShrink: 0 }}>
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>

          {/* Date inputs */}
          <div className="pdf-dates-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                From Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setError(''); setPreview(null); }} style={iB} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                To Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setError(''); setPreview(null); }} style={iB} />
            </div>
          </div>

          {error && (
            <div style={{ padding: '9px 12px', background: 'var(--danger-light)', border: '1px solid var(--danger-border)', borderRadius: 8, fontSize: 12, color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, wordBreak: 'break-word' }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 14, flexShrink: 0 }} /><span>{error}</span>
            </div>
          )}

          {/* Preview summary */}
          {preview && (
            <div style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-circle-check" style={{ fontSize: 14, flexShrink: 0 }} />Records found — ready to export with full details
              </div>
              <div className="pdf-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '8px 4px', border: '1px solid var(--success-border)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)' }}>{preview.records.length}</div>
                  <div style={{ fontSize: 8.5, color: 'var(--success-text)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Records</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 8, padding: '8px 4px', border: '1px solid var(--success-border)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)' }}>{minsToStr(preview.totalMins)}</div>
                  <div style={{ fontSize: 8.5, color: 'var(--success-text)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total Hours</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 8, padding: '8px 4px', border: '1px solid var(--success-border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', lineHeight: 1.3 }}>{safeDate(fromDate)}<br/>{safeDate(toDate)}</div>
                  <div style={{ fontSize: 8.5, color: 'var(--success-text)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Period</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
          {!preview ? (
            <div className="pdf-btn-row" style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-sub)', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={fetchRecords} disabled={loading} style={{ flex: 2, padding: '10px 0', border: 'none', background: loading ? '#9ca3af' : 'var(--danger)', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading
                  ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />Fetching...</>
                  : <><i className="ti ti-search" style={{ fontSize: 14 }} />Find Records</>
                }
              </button>
            </div>
          ) : (
            <div className="pdf-btn-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* 🌟 Back Button Centered Text & Icon */}
              <button onClick={() => setPreview(null)} style={{ padding: '10px 16px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-sub)', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <i className="ti ti-arrow-left" />Back
              </button>
              {/* Print Button */}
              <button onClick={handlePrint} style={{ flex: 1, padding: '10px 0', border: 'none', background: '#2563eb', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(37,99,235,.3)' }}>
                <i className="ti ti-printer" style={{ fontSize: 14 }} />Print
              </button>
              {/* Download PDF Button */}
              <button onClick={handleDownloadPDF} style={{ flex: 1, padding: '10px 0', border: 'none', background: 'var(--success)', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(22,163,74,.3)' }}>
                <i className="ti ti-download" style={{ fontSize: 14 }} />Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Full Detailed Container for HD PDF Generation */}
      <div ref={reportRef} style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: preview?.fullHtmlString || '' }} />

      <style>{`
        @keyframes scaleIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @media (max-width: 520px) {
          .pdf-modal-card { max-width: 95% !important; max-height: 90vh !important; }
          .pdf-dates-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .pdf-summary-grid { grid-template-columns: 1fr !important; }
          .pdf-btn-row { flex-direction: column !important; }
          .pdf-btn-row button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}