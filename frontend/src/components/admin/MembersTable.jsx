// src/components/admin/MembersTable.jsx — Trusting Backend for Accurate Total Hours

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import useDebounce from '../../hooks/useDebounce';

const PAGE_LIMIT = 10;

const SEARCH_FIELDS = [
  { value: 'all', label: 'All Fields' },
  { value: 'name', label: 'Name' },
  { value: 'appId', label: 'APP ID' },
  { value: 'email', label: 'Email' },
  { value: 'department', label: 'Department' },
  { value: 'designation', label: 'Designation' },
];

const DEPT_OPTIONS = [
  'BCA',
  'BSC.CS',
  'BSC.CHEMESTRY',
  'BSC.MICRO',
  'MSC.CHEMISTRY',
  'Other',
];

const AVATAR_COLORS = [
  ['var(--primary-light)', 'var(--primary)'],
  ['var(--success-light)', 'var(--success)'],
  ['var(--danger-light)', 'var(--danger)'],
  ['var(--warning-light)', 'var(--warning)'],
  ['var(--pro-light)', 'var(--pro)'],
];

const getInitials = (name = '') => {
  const p = name.trim().split(' ');
  return p.length >= 2
    ? `${p[0][0]}${p[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase() || '?';
};

/* ── Toggle Confirm Modal ── */
const ToggleConfirmModal = ({ member, onConfirm, onClose, loading }) => {
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);
  const isActive = member.isActive;
  return (
    <div className="modal-overlay" style={{ zIndex: 6000, padding: 12 }}>
      <div className="modal-card toggle-modal-card" style={{ width: '100%', maxWidth: 340, padding: '24px 20px', textAlign: 'center', boxSizing: 'border-box', margin: '0 auto', borderRadius: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: isActive ? 'var(--danger-light)' : 'var(--success-light)', border: `1px solid ${isActive ? 'var(--danger-border)' : 'var(--success-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22, color: isActive ? 'var(--danger)' : 'var(--success)' }}>
          <i className={`ti ${isActive ? 'ti-user-off' : 'ti-user-check'}`} />
        </div>
        <div className="academic-title" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
          {isActive ? 'Deactivate User?' : 'Activate User?'}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 18, wordBreak: 'break-word' }}>
          Are you sure you want to <strong style={{ color: isActive ? 'var(--danger)' : 'var(--success)' }}>{isActive ? 'deactivate' : 'activate'}</strong> <strong style={{ color: 'var(--text-sub)' }}>{member.name || member.appId}</strong>?
        </div>
        <div className="modal-actions-row" style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} disabled={loading} className="btn btn-outline" style={{ flex: 1, padding: '9px 0', fontSize: 12.5 }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={isActive ? 'btn btn-danger' : 'btn btn-primary'} style={{ flex: 1.2, padding: '9px 0', fontSize: 12.5 }}>
            {loading ? <span className="spinner" /> : <>{isActive ? 'Deactivate' : 'Activate'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Skeleton Row ── */
const SkeletonRow = () => (
  <tr>
    {[30, 200, 100, 80, 80, 80, 100].map((w, i) => (
      <td key={i} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ height: 13, width: w, background: 'linear-gradient(90deg, var(--bg-hover) 25%, var(--border) 50%, var(--bg-hover) 75%)', backgroundSize: '200%', animation: 'shimmer 1.4s infinite', borderRadius: 4 }} />
      </td>
    ))}
  </tr>
);

/* ── Main Component ── */
export default function MembersTable({ onViewRecords, refreshTrigger }) {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllMembers({
        search: debouncedSearch,
        field: searchField,
        status: statusFilter,
        department: deptFilter,
        page,
        limit: PAGE_LIMIT,
      });
      
      const rawMembers = data.data || [];
      
      // 🌟 Directly map backend's precise totalHours string (no frontend recalculation mismatch)
      const processedMembers = rawMembers.map((m) => ({
        ...m,
        displayHours: m.totalHours || '0h'
      }));

      setMembers(processedMembers);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, searchField, statusFilter, deptFilter, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, refreshTrigger]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, searchField, statusFilter, deptFilter]);

  const handleToggleConfirm = async () => {
    setToggling(true);
    try {
      const res = await adminService.toggleMemberStatus(toggleTarget.id);
      toast.success(`User ${res.isActive ? 'activated' : 'deactivated'} successfully`);
      setToggleTarget(null);
      fetchMembers();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSearchField('all');
    setStatusFilter('');
    setDeptFilter('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || deptFilter;

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

  const thS = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' };
  const tdS = { padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-sub)', verticalAlign: 'middle' };

  return (
    <>
      <section className="members-table-section" style={{ padding: '20px 24px', flex: 1, background: 'var(--bg-page)', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div className="academic-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>All Supervisors</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{total} member{total !== 1 ? 's' : ''} total</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setShowFilters((p) => !p)} className="btn btn-outline" style={{ borderColor: showFilters ? 'var(--pro)' : 'var(--border)', background: showFilters ? 'var(--pro-light)' : 'var(--bg-card)', color: showFilters ? 'var(--pro-text)' : 'var(--text-muted)', position: 'relative' }}>
              <i className="ti ti-adjustments-horizontal" style={{ fontSize: 15 }} /> Filters
              {hasFilters && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', position: 'absolute', top: 6, right: 6 }} />}
            </button>
          </div>
        </div>

        <div className="card" style={{ borderRadius: 'var(--r-lg)', padding: '14px 16px', marginBottom: 16 }}>
          <div className="search-row-container" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="search-field-select" style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-input)', outline: 'none', cursor: 'pointer', minWidth: 130 }}>
              {SEARCH_FIELDS.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
            </select>

            <div className="search-input-box" style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 12px', background: 'var(--bg-input)', flex: 1, minWidth: 180 }}>
              <i className="ti ti-search" style={{ fontSize: 15, color: 'var(--text-placeholder)', flexShrink: 0 }} />
              <input placeholder={`Search by ${SEARCH_FIELDS.find((f) => f.value === searchField)?.label || 'All Fields'}...`} value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-main)', width: '100%', fontFamily: "'Inter', sans-serif" }} />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 0, display: 'flex', flexShrink: 0 }}><i className="ti ti-x" /></button>}
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="btn btn-danger">
                <i className="ti ti-x" style={{ fontSize: 12 }} /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="expanded-filters-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-input)', outline: 'none' }}>
                  <option value="">All Members</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>Department</label>
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-input)', outline: 'none' }}>
                  <option value="">All Departments</option>
                  {DEPT_OPTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>
          )}

          {hasFilters && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {search && <span className="badge badge-blue"><i className="ti ti-search" style={{ fontSize: 10 }} /> {search}</span>}
              {statusFilter && <span className="badge badge-green">Status: {statusFilter}</span>}
              {deptFilter && <span className="badge badge-purple">Dept: {deptFilter}</span>}
            </div>
          )}
        </div>

        <div className="table-wrap" style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr>
                  <th style={thS}>No</th>
                  <th style={thS}>Supervisor</th>
                  <th style={thS}>APP ID</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Records</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Total Hours</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Status</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '56px 20px', textAlign: 'center' }}>
                      <i className="ti ti-users-group" style={{ fontSize: 48, color: 'var(--text-placeholder)', display: 'block', marginBottom: 12 }} />
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                        {hasFilters ? 'No members match your filters' : 'No members yet'}
                      </div>
                      {hasFilters && <button onClick={clearFilters} className="btn btn-pro">Clear Filters</button>}
                    </td>
                  </tr>
                ) : (
                  members.map((member, idx) => {
                    const colorIdx = (member.appId || '').charCodeAt((member.appId || '').length - 1) % AVATAR_COLORS.length;
                    const [abg, atxt] = AVATAR_COLORS[colorIdx];

                    return (
                      <tr key={member.id || member._id}>
                        <td style={{ ...tdS, color: 'var(--text-muted)', fontWeight: 600 }}>{(page - 1) * PAGE_LIMIT + idx + 1}</td>
                        <td style={tdS}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: member.photo ? 'transparent' : abg, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: atxt, overflow: 'hidden', flexShrink: 0 }}>
                              {member.photo ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : getInitials(member.name || member.appId)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name || 'Not Set'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.department || member.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdS}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-sub)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{member.appId}</span>
                        </td>
                        <td style={{ ...tdS, textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>{member.totalRecords ?? 0}</td>
                        <td style={{ ...tdS, textAlign: 'center', fontWeight: 700, color: 'var(--pro)' }}>{member.displayHours}</td>
                        <td style={{ ...tdS, textAlign: 'center' }}>
                          <span className={member.isActive ? 'badge badge-green' : 'badge badge-yellow'}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: member.isActive ? 'var(--success)' : 'var(--text-placeholder)' }} />
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ ...tdS, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button onClick={() => onViewRecords(member.id || member._id, { search, searchField, statusFilter, deptFilter })} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: 11, whiteSpace: 'nowrap' }}>
                              <i className="ti ti-file-text" style={{ fontSize: 12 }} /> Details
                            </button>
                            <button onClick={() => setToggleTarget(member)} className={member.isActive ? 'btn btn-danger' : 'btn btn-primary'} style={{ padding: '5px 10px', fontSize: 11, whiteSpace: 'nowrap' }}>
                              <i className={`ti ${member.isActive ? 'ti-user-off' : 'ti-user-check'}`} style={{ fontSize: 12 }} /> {member.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && members.length > 0 && (
            <div className="pagination-bar" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline" style={{ width: 30, height: 30, padding: 0 }}><i className="ti ti-chevron-left" /></button>
                {buildPages().map((num, i) => num === '…' ? <span key={`d${i}`} style={{ width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)' }}>…</span> : <button key={num} onClick={() => setPage(num)} className={page === num ? 'btn btn-pro' : 'btn btn-outline'} style={{ width: 30, height: 30, padding: 0, fontSize: 12 }}>{num}</button>)}
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-outline" style={{ width: 30, height: 30, padding: 0 }}><i className="ti ti-chevron-right" /></button>
              </div>
            </div>
          )}
        </div>
      </section>

      {toggleTarget && <ToggleConfirmModal member={toggleTarget} onConfirm={handleToggleConfirm} onClose={() => setToggleTarget(null)} loading={toggling} />}

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @media (max-width: 600px) {
          .members-table-section { padding: 12px 10px !important; }
          .search-row-container { flex-direction: column !important; align-items: stretch !important; }
          .search-field-select, .search-input-box { width: 100% !important; min-width: 100% !important; box-sizing: border-box !important; }
          .expanded-filters-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .pagination-bar { flex-direction: column !important; align-items: center !important; gap: 10px !important; }
          .modal-actions-row { flex-direction: column-reverse !important; }
          .modal-actions-row button { width: 100% !important; }
        }
      `}</style>
    </>
  );
}