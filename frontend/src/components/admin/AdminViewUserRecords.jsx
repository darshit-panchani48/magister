// src/components/admin/AdminViewUserRecords.jsx — Updated with Auto-Calculated Hours Column

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import adminService    from '../../services/adminService';
import useDebounce      from '../../hooks/useDebounce';
import ViewRecordModal  from '../user/ViewRecordModal';
import MessageModal     from './MessageModal';
import AdminDeleteModal from './AdminDeleteModal';

const AVATAR_COLORS = [
  ['#dbeafe','#1e40af'],['#dcfce7','#166534'],
  ['#fce7f3','#9d174d'],['#fef3c7','#92400e'],
  ['#ede9fe','#5b21b6'],['#fee2e2','#991b1b'],
];

const SEARCH_FIELDS = [
  { value:'all',          label:'All Fields'    },
  { value:'university',   label:'University'    },
  { value:'department',   label:'Department'    },
  { value:'examCategory', label:'Exam Category' },
  { value:'examName',     label:'Exam Name'     },
  { value:'subject',      label:'Subject'       },
  { value:'role',         label:'Role'          },
  { value:'block',        label:'Block No.'     },
  { value:'room',         label:'Room No.'      },
];

const ROLE_OPTIONS   = ['Superintendent','Supervisor','Factotum','Stationary Supervisor','Waterman','Lab Assistant','Lab Technician','Lab Superintendent','Electrician','Storekeeper','Peon','Other'];
const STATUS_OPTIONS = ['Completed','Cancelled'];

const getInitials = (name='') => {
  const p = name.trim().split(' ');
  return p.length>=2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : name.slice(0,2).toUpperCase()||'?';
};

/* ── Accurate Hours & Minutes Calculation Helpers ── */
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

export default function AdminViewUserRecords({ userId, onBack, activeFilters = {} }) {
  const [data,         setData]         = useState(null);
  const [allRecords,   setAllRecords]   = useState([]);
  const [records,      setRecords]      = useState([]);
  const [totalHoursStr,setTotalHoursStr]= useState('0h');
  const [loading,      setLoading]      = useState(true);
  const [viewRecord,   setViewRecord]   = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [msgTarget,    setMsgTarget]    = useState(null);
  const [msgRecord,    setMsgRecord]    = useState(null);
  
  const [sendEmailFlag, setSendEmailFlag] = useState(true);
  const [refresh,      setRefresh]      = useState(0);

  const [search,       setSearch]       = useState('');
  const [searchField,  setSearchField]  = useState('all');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter,   setDateFilter]   = useState('');
  const [showFilters,  setShowFilters]  = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await adminService.getMemberRecords(userId);
        setData(res);
        const fetchedRecords = res.records || [];
        setAllRecords(fetchedRecords);
        setRecords(fetchedRecords);

        setTotalHoursStr(res.totalHours || '0h');
      } catch {
        toast.error('Failed to load user records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, refresh]);

  useEffect(() => {
    let filtered = [...allRecords];
    const s = debouncedSearch.trim().toLowerCase();

    const carryDept = activeFilters?.deptFilter || '';
    if (carryDept) {
      filtered = filtered.filter(r => r.department?.toLowerCase() === carryDept.toLowerCase());
    }

    if (s) {
      filtered = filtered.filter(r => {
        if (searchField === 'university')   return r.university?.toLowerCase().includes(s);
        if (searchField === 'department')   return r.department?.toLowerCase().includes(s);
        if (searchField === 'examCategory') return r.examCategory?.toLowerCase().includes(s);
        if (searchField === 'role')         return r.role?.toLowerCase().includes(s);
        if (searchField === 'block')        return r.block?.toLowerCase().includes(s);
        if (searchField === 'room')         return r.room?.toLowerCase().includes(s);
        if (searchField === 'examName')     return r.examDetails?.some(d => d.examName?.toLowerCase().includes(s));
        if (searchField === 'subject')      return r.examDetails?.some(d => d.subject?.toLowerCase().includes(s));
        return (
          r.university?.toLowerCase().includes(s)   ||
          r.department?.toLowerCase().includes(s)   ||
          r.examCategory?.toLowerCase().includes(s) ||
          r.role?.toLowerCase().includes(s)         ||
          r.block?.toLowerCase().includes(s)        ||
          r.room?.toLowerCase().includes(s)         ||
          r.examDetails?.some(d => d.examName?.toLowerCase().includes(s) || d.subject?.toLowerCase().includes(s))
        );
      });
    }
    if (roleFilter)   filtered = filtered.filter(r => r.role === roleFilter);
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);
    if (dateFilter)   filtered = filtered.filter(r => r.date && new Date(r.date).toISOString().split('T')[0] === dateFilter);

    setRecords(filtered);
  }, [debouncedSearch, searchField, roleFilter, statusFilter, dateFilter, allRecords, activeFilters]);

  const clearFilters = () => { setSearch(''); setSearchField('all'); setRoleFilter(''); setStatusFilter(''); setDateFilter(''); };
  const hasLocalFilters = search || roleFilter || statusFilter || dateFilter;
  const hasCarryFilter  = !!activeFilters?.deptFilter;
  const hasFilters      = hasLocalFilters || hasCarryFilter;

  const thS = { padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', background:'var(--bg-hover)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' };
  const tdS = { padding:'11px 14px', borderBottom:'1px solid var(--border)', fontSize:13, color:'var(--text-sub)', verticalAlign:'middle' };

  const StatusBadge = ({ status }) => {
    const map = { Completed:{bg:'var(--success-light)',color:'var(--success-text)',dot:'var(--success)'}, Draft:{bg:'var(--primary-light)',color:'var(--primary-text)',dot:'var(--primary)'}, Cancelled:{bg:'var(--danger-light)',color:'var(--danger-text)',dot:'var(--danger)'} };
    const s = map[status] || map.Draft;
    return <span style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,background:s.bg,color:s.color }}><span style={{ width:6,height:6,borderRadius:'50%',background:s.dot }}/>{status}</span>;
  };

  if (loading) return (
    <div style={{ minHeight:300,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ width:32,height:32,border:'3px solid var(--primary-border)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!data) return null;

  const { user, profile } = data;
  const colorIdx  = (user.appId||'').charCodeAt((user.appId||'').length-1) % AVATAR_COLORS.length;
  const [abg, atxt] = AVATAR_COLORS[colorIdx];

  return (
    <div className="admin-view-records-container" style={{ padding:'20px 24px', flex:1, background:'var(--bg-page)', boxSizing:'border-box', width:'100%' }}>

      {/* Back Button */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', border:'1.5px solid var(--border)', background:'var(--bg-card)', color:'var(--text-sub)', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer' }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--bg-card)'}>
          <i className="ti ti-arrow-left" style={{ fontSize:15 }}/> Back to Members
        </button>
        {hasCarryFilter && activeFilters.deptFilter && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--warning-light)', color:'var(--warning-text)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>
            <i className="ti ti-filter" style={{ fontSize:10 }}/> Dept: {activeFilters.deptFilter}
          </span>
        )}
      </div>

      {/* User Info Header Card */}
      <div className="user-profile-header-card card" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 22px', marginBottom:20, display:'flex', alignItems:'center', gap:18, flexWrap:'wrap', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ width:68, height:68, borderRadius:'24px', background:profile?.photo?.url?'transparent':abg, border:`2.5px solid var(--border)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:atxt, overflow:'hidden', flexShrink:0 }}>
          {profile?.photo?.url
            ? <img src={profile.photo.url} alt={profile.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : getInitials(profile?.name||user.appId)
          }
        </div>
        <div style={{ flex:1, minWidth:0 }} className="user-header-text-block">
          <div style={{ fontSize:18, fontWeight:700, color:'var(--text-main)', marginBottom:4 }}>{profile?.name||user.appId}</div>
          {profile && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 16px', fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>
              {[{icon:'ti-id-badge',val:user.appId},{icon:'ti-briefcase',val:profile.designation},{icon:'ti-building',val:profile.department},{icon:'ti-mail',val:profile.email}]
                .filter(r=>r.val).map(r=>(
                  <span key={r.icon} style={{ display:'flex', alignItems:'center', gap:5, wordBreak:'break-all' }}>
                    <i className={`ti ${r.icon}`} style={{ color:'var(--primary)', fontSize:13, flexShrink:0 }}/>{r.val}
                  </span>
                ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { label:`${records.length} Shown`,                 bg:'var(--primary-light)', color:'var(--primary-text)' },
              { label:`${allRecords.length} Total`,              bg:'var(--pro-light)', color:'var(--pro-text)' },
              { label:`${totalHoursStr} Completed`,              bg:'var(--success-light)', color:'var(--success-text)' },
              { label:user.isActive?'Active':'Inactive',           bg:user.isActive?'var(--success-light)':'var(--bg-hover)', color:user.isActive?'var(--success-text)':'var(--text-muted)' },
            ].map(p=>(
              <span key={p.label} style={{ background:p.bg, color:p.color, fontSize:11, fontWeight:600, padding:'3px 12px', borderRadius:20 }}>{p.label}</span>
            ))}
          </div>
        </div>
        
        <button onClick={()=>{ setMsgTarget({ id:user._id, appId:user.appId, name:profile?.name }); setMsgRecord(null); setSendEmailFlag(true); }}
          className="user-header-msg-btn btn btn-primary"
          style={{ padding:'9px 18px', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
          <i className="ti ti-message-circle" style={{ fontSize:14 }}/> Send Message
        </button>
      </div>

      {/* Filter Panel */}
      <div className="card" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
        <div className="filter-controls-row" style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <select value={searchField} onChange={e=>setSearchField(e.target.value)}
            className="filter-select-field input"
            style={{ padding:'8px 10px', fontSize:12, cursor:'pointer', minWidth:140 }}>
            {SEARCH_FIELDS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <div className="filter-search-input-wrap" style={{ display:'flex', alignItems:'center', gap:8, border:'1.5px solid var(--border)', borderRadius:9, padding:'8px 12px', background:'var(--bg-input)', flex:1, minWidth:180 }}>
            <i className="ti ti-search" style={{ fontSize:15, color:'var(--text-muted)', flexShrink:0 }}/>
            <input placeholder={`Search by ${SEARCH_FIELDS.find(f=>f.value===searchField)?.label||'All Fields'}...`}
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ border:'none', background:'transparent', outline:'none', fontSize:13, color:'var(--text-main)', width:'100%', fontFamily:"'Inter',sans-serif" }}/>
            {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:14, padding:0, display:'flex' }}><i className="ti ti-x"/></button>}
          </div>
          <button onClick={()=>setShowFilters(p=>!p)} className="btn btn-outline" style={{ padding:'8px 13px', borderColor:showFilters?'var(--pro)':'var(--border)', background:showFilters?'var(--pro-light)':'transparent', color:showFilters?'var(--pro)':'var(--text-muted)', fontSize:13 }}>
            <i className="ti ti-adjustments-horizontal" style={{ fontSize:15 }}/> Filters
            {hasLocalFilters && <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--danger)',position:'absolute',top:6,right:6 }}/>}
          </button>
          {hasLocalFilters && <button onClick={clearFilters} className="btn btn-danger" style={{ padding:'8px 12px', fontSize:12 }}><i className="ti ti-x" style={{ fontSize:12 }}/> Clear</button>}
        </div>

        {showFilters && (
          <div className="filter-dropdown-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
            <div>
              <label style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Role</label>
              <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="input" style={{ padding:'8px 10px', fontSize:12 }}>
                <option value="">All Roles</option>
                {ROLE_OPTIONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Status</label>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input" style={{ padding:'8px 10px', fontSize:12 }}>
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Exam Date</label>
              <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className="input" style={{ padding:'8px 10px', fontSize:12, boxSizing:'border-box' }}/>
            </div>
          </div>
        )}

        {hasFilters && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>
            {hasCarryFilter && <span className="badge badge-yellow"><i className="ti ti-filter" style={{ fontSize:10 }}/> Dept: {activeFilters.deptFilter}</span>}
            {search       && <span className="badge badge-blue"><i className="ti ti-search" style={{ fontSize:10 }}/>{search}</span>}
            {roleFilter   && <span className="badge badge-purple">Role: {roleFilter}</span>}
            {statusFilter && <span className="badge badge-green">Status: {statusFilter}</span>}
            {dateFilter   && <span className="badge badge-yellow">Date: {dateFilter}</span>}
          </div>
        )}
      </div>

      {/* Records Table Card */}
      <div className="table-wrap">
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text-main)' }}>Exam Records</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{records.length} of {allRecords.length}{hasFilters && <span style={{ color:'var(--pro)', marginLeft:6, fontWeight:600 }}>filtered</span>}</div>
        </div>

        {records.length===0 ? (
          <div style={{ padding:'48px 20px', textAlign:'center', color:'var(--text-muted)' }}>
            <i className="ti ti-clipboard-x" style={{ fontSize:44, opacity:.3, display:'block', marginBottom:10 }}/>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>{hasFilters?'No records match filters':'No exam records found'}</div>
            {hasLocalFilters && <button onClick={clearFilters} className="btn btn-pro" style={{ padding:'7px 16px', fontSize:12 }}>Clear Filters</button>}
          </div>
        ) : (
          <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr>
                  {['No','University / Dept','Date','Block','Room','Role','Years','Hours','Status','Actions'].map(h=>(
                    <th key={h} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec,idx)=>{
                  const displayRoom = rec.recordType === 'general'
                    ? (rec.generalDuty?.location || (Array.isArray(rec.generalDuty?.locations) ? rec.generalDuty.locations.join(', ') : '—'))
                    : rec.recordType === 'lab'
                    ? (rec.room || rec.labDuty?.labName || '—')
                    : (rec.room || '—');

                  const recordMins = calcRecordMins(rec);
                  const recordHoursStr = formatHours(recordMins);

                  return (
                    <tr key={rec._id} style={{ transition:'background .15s' }}>
                      <td style={{ ...tdS, color:'var(--text-muted)', fontWeight:600 }}>{idx+1}</td>
                      <td style={tdS}>
                        <div style={{ fontWeight:600, color:'var(--text-main)' }}>{rec.university}</div>
                        <div style={{ fontSize:11, color:'var(--primary)', fontWeight:600 }}>{rec.department||'—'}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rec.examCategory}</div>
                      </td>
                      <td style={{ ...tdS, whiteSpace:'nowrap' }}>{rec.date?format(new Date(rec.date),'dd MMM yyyy'):'—'}</td>
                      <td style={tdS}>{rec.block||'—'}</td>
                      <td style={tdS}>{displayRoom}</td>
                      <td style={tdS}>{rec.role}</td>
                      <td style={tdS}>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          {rec.recordType === 'lab' && rec.labDuty?.year ? (
                            <span className="badge badge-pink">{rec.labDuty.year}</span>
                          ) : rec.recordType === 'general' ? (
                            <span className="badge badge-purple">General</span>
                          ) : (
                            rec.examDetails?.map(d=>(
                              <span key={d.year} className="badge badge-pink">{d.year}</span>
                            ))
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdS, fontWeight:700, color:'var(--pro)', whiteSpace:'nowrap' }}>
                        {recordHoursStr}
                      </td>
                      <td style={tdS}><StatusBadge status={rec.status}/></td>
                      <td style={tdS}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button onClick={()=>setViewRecord(rec)} title="View"
                            style={{ width:30,height:30,borderRadius:7,border:'1px solid var(--border)',background:'var(--bg-input)',color:'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13 }}
                            onMouseEnter={e=>{e.currentTarget.style.background='var(--primary-light)';e.currentTarget.style.color='var(--primary)';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-input)';e.currentTarget.style.color='var(--text-muted)';}}>
                            <i className="ti ti-eye"/>
                          </button>
                          
                          <button onClick={()=>{ setMsgTarget({id:user._id,appId:user.appId,name:profile?.name}); setMsgRecord(rec); setSendEmailFlag(false); }} title="Message"
                            style={{ width:30,height:30,borderRadius:7,border:'1px solid var(--primary-border)',background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13 }}>
                            <i className="ti ti-message"/>
                          </button>

                          {rec.status!=='Cancelled' && (
                            <button onClick={()=>setDeleteRecord(rec)} title="Delete"
                              style={{ width:30,height:30,borderRadius:7,border:'1px solid var(--danger-border)',background:'var(--danger-light)',color:'var(--danger)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13 }}>
                              <i className="ti ti-trash"/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewRecord   && <ViewRecordModal  record={viewRecord}   onClose={()=>setViewRecord(null)}/>}
      {deleteRecord && <AdminDeleteModal record={deleteRecord} onClose={()=>setDeleteRecord(null)} onDeleted={()=>{ setDeleteRecord(null); setRefresh(k=>k+1); }}/>}
      {msgTarget    && <MessageModal     user={msgTarget}      relatedRecord={msgRecord} sendEmail={sendEmailFlag} onClose={()=>{ setMsgTarget(null); setMsgRecord(null); }}/>}

      <style>{`
        @media (max-width: 600px) {
          .admin-view-records-container {
            padding: 12px 10px !important;
          }
          .user-profile-header-card {
            padding: 14px 12px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .user-header-text-block {
            width: 100% !important;
          }
          .user-header-msg-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .filter-controls-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .filter-select-field, .filter-search-input-wrap {
            width: 100% !important;
            min-width: 100% !important;
            box-sizing: border-box !important;
          }
          .filter-dropdown-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}