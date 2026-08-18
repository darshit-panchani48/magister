// src/components/user/ExamTable.jsx — Fully Responsive, Clean & Updated with Accurate Hours Column

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import examService from '../../services/examService';
import useDebounce from '../../hooks/useDebounce';
import ViewRecordModal from './ViewRecordModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const PAGE_LIMIT = 10;

const SEARCH_FIELDS = [
  { value: 'all',          label: 'All Fields' },
  { value: 'university',   label: 'University' },
  { value: 'department',   label: 'Department' },
  { value: 'examCategory', label: 'Exam Category' },
  { value: 'examName',     label: 'Exam Name' },
  { value: 'subject',      label: 'Subject' },
  { value: 'role',         label: 'Role' },
  { value: 'block',        label: 'Block No.' },
  { value: 'room',         label: 'Room No.' },
];

const ROLE_OPTIONS = ['Superintendent', 'Supervisor', 'Lab Assistant', 'Lab Superintendent', 'Other'];
const STATUS_OPTIONS = ['Completed', 'Draft', 'Cancelled'];

/* ── Accurate Hours & Minutes Helpers (Synced with backend/admin) ── */
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

const formatHours = (totalMins) => {
  if (!totalMins || totalMins <= 0) return '—';
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

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

export default function ExamTable({ onAddExam, onEditExam, refreshTrigger }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await examService.getMyExams({
        search: debouncedSearch,
        field: searchField,
        role: roleFilter,
        status: statusFilter,
        date: dateFilter,
        page,
        limit: PAGE_LIMIT,
      });
      setRecords(data.records || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast.error('Failed to load exam records');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, searchField, roleFilter, statusFilter, dateFilter, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords, refreshTrigger]);
  useEffect(() => { setPage(1); }, [debouncedSearch, searchField, roleFilter, statusFilter, dateFilter]);

  const handleDelete = async (reason) => {
    setDeleting(true);
    try {
      await examService.deleteExam(deleteTarget._id, reason);
      toast.success('Record deleted');
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSearchField('all');
    setRoleFilter('');
    setStatusFilter('');
    setDateFilter('');
    setPage(1);
  };

  const hasFilters = search || roleFilter || statusFilter || dateFilter;

  const buildPages = () => {
    const nums = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (page > 3) nums.push('…');
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) nums.push(i);
      if (page < pages - 2) nums.push('…');
      nums.push(pages);
    }
    return nums;
  };

  const thS = { padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' };
  const tdS = { padding: '11px 14px', borderBottom: '1px solid #f3f4f6', fontSize: 13, color: '#374151', verticalAlign: 'middle' };

  const StatusBadge = ({ status }) => {
    const map = { Completed: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' }, Draft: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' }, Cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' } };
    const s = map[status] || map.Draft;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
        {status}
      </span>
    );
  };

  const SkeletonRow = () => (
    <tr>
      {[40, 160, 90, 60, 60, 60, 80, 80].map((w, i) => (
        <td key={i} style={tdS}>
          <div style={{ height: 13, width: w, background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );

  return (
    <>
      <section style={{ padding: '20px 24px', flex: 1, background: 'var(--bg-page)' }}>
        {/* Controls */}
        <div className="et-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>My Exam Supervisions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{total} record{total !== 1 ? 's' : ''} total</div>
          </div>
          <div className="et-actions-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setShowFilters(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', border: `1.5px solid ${showFilters ? '#2563eb' : '#e5e7eb'}`, borderRadius: 10, background: showFilters ? '#eff6ff' : 'var(--bg-card)', color: showFilters ? '#2563eb' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontWeight: 500, position: 'relative' }}>
              <i className="ti ti-adjustments-horizontal" style={{ fontSize: 15 }} />
              Filters
              {hasFilters && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', position: 'absolute', top: 6, right: 6 }} />}
            </button>
            <button onClick={onAddExam} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.2)', whiteSpace: 'nowrap' }}>
              <i className="ti ti-plus" style={{ fontSize: 15 }} /> Add New Exam
            </button>
          </div>
        </div>

        {/* Search + Filter Panel */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div className="et-search-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={searchField} onChange={e => setSearchField(e.target.value)}
              style={{ padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-page)', outline: 'none', cursor: 'pointer', minWidth: 140 }}>
              {SEARCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--border)', borderRadius: 9, padding: '8px 12px', background: 'var(--bg-page)', flex: 1, minWidth: 180 }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <i className="ti ti-search" style={{ fontSize: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
              <input placeholder={`Search by ${SEARCH_FIELDS.find(f => f.value === searchField)?.label || 'All Fields'}...`}
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-main)', width: '100%', fontFamily: "'Inter',sans-serif" }}
              />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 0, display: 'flex', flexShrink: 0 }}><i className="ti ti-x" /></button>}
            </div>

            {hasFilters && (
              <button onClick={clearFilters} style={{ padding: '8px 12px', border: '1px solid #fecaca', borderRadius: 9, background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                <i className="ti ti-x" style={{ fontSize: 12 }} /> Clear All
              </button>
            )}
          </div>

          {showFilters && (
            <div className="et-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>Role</label>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-page)', outline: 'none' }}>
                  <option value="">All Roles</option>
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-page)', outline: 'none' }}>
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>Exam Date</label>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-page)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {hasFilters && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {search && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}><i className="ti ti-search" style={{ fontSize: 10 }} />{searchField === 'all' ? '' : SEARCH_FIELDS.find(f => f.value === searchField)?.label + ': '}{search}</span>}
              {roleFilter && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ede9fe', color: '#5b21b6', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>Role: {roleFilter}</span>}
              {statusFilter && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>Status: {statusFilter}</span>}
              {dateFilter && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>Date: {dateFilter}</span>}
            </div>
          )}
        </div>

        {/* Table Container */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={thS}>No</th>
                  <th style={thS}>University / Department</th>
                  <th style={thS}>Date</th>
                  <th style={thS}>Block</th>
                  <th style={thS}>Room</th>
                  <th style={thS}>Years</th>
                  <th style={thS}>Hours</th>
                  <th style={thS}>Status</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
                 records.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '56px 20px', textAlign: 'center' }}>
                      <i className="ti ti-clipboard-x" style={{ fontSize: 48, color: '#d1d5db', display: 'block', marginBottom: 12 }} />
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                        {hasFilters ? 'No records match your filters' : 'No exam records yet'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                        {hasFilters ? 'Try adjusting your search or filters' : 'Add your first exam supervision record'}
                      </div>
                      {hasFilters
                        ? <button onClick={clearFilters} style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Clear Filters</button>
                        : <button onClick={onAddExam} style={{ padding: '9px 20px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><i className="ti ti-plus" style={{ fontSize: 14 }} /> Add New Exam</button>
                      }
                    </td>
                  </tr>
                ) : records.map((rec, idx) => {
                  const displayRoom = rec.recordType === 'general'
                    ? (rec.generalDuty?.location || (Array.isArray(rec.generalDuty?.locations) ? rec.generalDuty.locations.join(', ') : '—'))
                    : rec.recordType === 'lab'
                    ? (rec.room || rec.labDuty?.labName || '—')
                    : (rec.room || '—');

                  const recordMins = calcRecordMins(rec);
                  const recordHoursStr = formatHours(recordMins);

                  return (
                    <tr key={rec._id} style={{ transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ ...tdS, color: 'var(--text-muted)', fontWeight: 600 }}>{(page - 1) * PAGE_LIMIT + idx + 1}</td>
                      <td style={tdS}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rec.university}</div>
                        <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>{rec.department || 'N/A'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{rec.examCategory}</div>
                      </td>
                      <td style={{ ...tdS, whiteSpace: 'nowrap' }}>{rec.date ? format(new Date(rec.date), 'dd MMM yyyy') : '—'}</td>
                      <td style={tdS}>{rec.block || '—'}</td>
                      <td style={tdS}>{displayRoom}</td>
                      <td style={tdS}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {rec.recordType === 'lab' && rec.labDuty?.year ? (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fdf2f8', color: '#a21caf', border: '1px solid #f0abfc' }}>{rec.labDuty.year}</span>
                          ) : rec.recordType === 'general' ? (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd' }}>General</span>
                          ) : (
                            rec.examDetails?.map(d => (
                              <span key={d.year} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fdf2f8', color: '#a21caf', border: '1px solid #f0abfc' }}>{d.year}</span>
                            ))
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdS, fontWeight: 700, color: 'var(--pro, #2563eb)', whiteSpace: 'nowrap' }}>
                        {recordHoursStr}
                      </td>
                      <td style={tdS}><StatusBadge status={rec.status} /></td>
                      <td style={{ ...tdS, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                          <button onClick={() => setViewRecord(rec)} title="View"
                            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = '#dbeafe'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-page)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                            <i className="ti ti-eye" />
                          </button>
                          <button onClick={() => onEditExam(rec)} title="Edit"
                            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-page)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                            <i className="ti ti-edit" />
                          </button>
                          <button onClick={() => setDeleteTarget(rec)} title="Delete"
                            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && records.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1, fontSize: 13 }}><i className="ti ti-chevron-left" /></button>
                {buildPages().map((num, i) => num === '…'
                  ? <span key={`d${i}`} style={{ width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)' }}>…</span>
                  : <button key={num} onClick={() => setPage(num)} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid', borderColor: page === num ? '#2563eb' : 'var(--border)', background: page === num ? '#2563eb' : 'var(--bg-page)', color: page === num ? '#fff' : 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, fontWeight: page === num ? 700 : 400 }}>{num}</button>
                )}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? .4 : 1, fontSize: 13 }}><i className="ti ti-chevron-right" /></button>
              </div>
            </div>
          )}
        </div>
      </section>

      {viewRecord && <ViewRecordModal record={viewRecord} onClose={() => setViewRecord(null)} />}
      {deleteTarget && <DeleteConfirmModal recordName={`${deleteTarget.university} • ${deleteTarget.department} • ${deleteTarget.examCategory}`} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} loading={deleting} />}

      <style>{`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @media (max-width: 640px) {
          .et-header-row { flex-direction: column !important; align-items: flex-start !important; }
          .et-actions-row { width: 100% !important; justify-content: space-between !important; }
          .et-search-row { flex-direction: column !important; align-items: stretch !important; }
          .et-search-row select, .et-search-row div { width: 100% !important; min-width: 100% !important; box-sizing: border-box !important; }
          .et-filter-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}