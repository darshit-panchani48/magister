// src/components/common/Navbar.jsx — Fully Mobile Responsive & Overlap-Free Header

import React, { useState, useEffect } from 'react';
import { useAuth }         from '../../context/AuthContext';
import { useTheme }        from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsPanel  from './NotificationsPanel';
import logoImg             from '../../assets/logo.png';

// ── Logout Confirmation Modal ──
const LogoutConfirmModal = ({ onConfirm, onClose }) => {
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 320, textAlign: 'center', boxShadow: '0 25px 80px rgba(0,0,0,.2)', border: '1px solid #e5e7eb', animation: 'scaleIn .3s ease' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22, color: '#ef4444' }}>
          <i className="ti ti-logout" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Logout?</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 22 }}>
          Are you sure you want to logout from Magister?
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#374151', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px 0', border: 'none', background: '#ef4444', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <i className="ti ti-logout" style={{ fontSize: 14 }} /> Yes, Logout
          </button>
        </div>
      </div>
      <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
};

// ── Main Navbar Component ──
const Navbar = ({ onProfileClick, onAddMemberClick, profilePhoto = '', profileInitials = '' }) => {
  const { user, role, logout }          = useAuth();
  const { isDark, toggleTheme }         = useTheme();
  const { unreadCount, msgUnreadCount } = useNotifications();
  const [showNotif,   setShowNotif]     = useState(false);
  const [showLogout,  setShowLogout]    = useState(false);

  const totalBadge = (unreadCount || 0) + (msgUnreadCount || 0);

  return (
    <>
      <header className="nav-header-container" style={{
        position: 'sticky', top: 0, zIndex: 900,
        minHeight: 65, background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 10px rgba(0,0,0,.04)',
        display: 'flex', alignItems: 'center', padding: '0 16px',
        justifyContent: 'space-between', width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ── LEFT: Clean Logo & College Info ── */}
        <div className="nav-left-section" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={logoImg}
              alt="ASSC"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                border: 'none',
                background: 'transparent',
                boxShadow: 'none',
              }}
              onError={e => (e.target.style.display = 'none')}
            />
          </div>
          <div className="nav-college-text" style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.5px' }}>ASSC</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
              Atmanand Saraswati Science College
            </div>
          </div>
        </div>

        {/* ── CENTER: Perfectly Centered Title & Fonts ── */}
        <div className="nav-center-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="nav-main-title" style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8', letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: 1 }}>
            Magister
          </div>
          <div className="nav-subtitle" style={{ fontSize: 8.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: 3 }}>
            Exam Remuneration Management System
          </div>
        </div>

        {/* ── RIGHT: Actions & Avatar ── */}
        <div className="nav-right-section" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>

          {/* Add Member — admin only */}
          {role === 'admin' && (
            <button onClick={() => typeof onAddMemberClick === 'function' && onAddMemberClick()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(37,99,235,.25)', transition: 'all 0.2s' }}>
              <i className="ti ti-user-plus" style={{ fontSize: 13 }} />
              <span className="btn-label">Add Member</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'} style={{ width: 34, height: 20, borderRadius: 10, background: isDark ? '#334155' : '#dbeafe', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: isDark ? '#60a5fa' : '#2563eb', top: 3, left: isDark ? 16 : 3, transition: 'left .3s cubic-bezier(.34,1.56,.64,1)', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDark ? '🌙' : '☀️'}
            </span>
          </button>

          {/* Bell Notifications */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotif(true)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <i className="ti ti-bell" />
            </button>
            {totalBadge > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 15, height: 15, background: '#ef4444', color: '#fff', fontSize: 8.5, fontWeight: 700, borderRadius: 8, border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                {totalBadge > 9 ? '9+' : totalBadge}
              </span>
            )}
          </div>

          {/* Profile Avatar */}
          <button onClick={() => typeof onProfileClick === 'function' && onProfileClick()} title="My Profile" style={{ width: 34, height: 34, borderRadius: '50%', background: profilePhoto ? 'transparent' : 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: '2px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            {profilePhoto
              ? <img src={profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{profileInitials || user?.appId?.charAt(0) || 'U'}</span>
            }
          </button>

          {/* Logout Button */}
          <button onClick={() => setShowLogout(true)} title="Logout" style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-page)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <i className="ti ti-logout" />
          </button>

        </div>
      </header>

      {/* Modals & Panels */}
      {showNotif   && <NotificationsPanel onClose={() => setShowNotif(false)} />}
      {showLogout && <LogoutConfirmModal onConfirm={logout} onClose={() => setShowLogout(false)} />}

      <style>{`
        /* ── Desktop Default Layout ── */
        .nav-left-section { flex: 1; }
        .nav-center-section { flex: 1.5; }
        .nav-right-section { flex: 1; }

        /* ── Mobile Responsive Adjustments (No Overlapping) ── */
        @media (max-width: 768px) {
          .nav-header-container {
            padding: 0 12px !important;
            height: auto !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
          .nav-college-text { display: none !important; }
          .nav-subtitle { display: none !important; }
          .btn-label { display: none !important; }
          .nav-main-title { fontSize: 15px !important; letter-spacing: 1px !important; }
          
          /* Compact gap on mobile screens */
          .nav-right-section { gap: 5px !important; }
        }

        @media (max-width: 480px) {
          .nav-center-section {
            align-items: flex-start !important;
            margin-left: 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;