// src/pages/AdminDashboard.jsx — Mobile Responsive Wired Admin Dashboard

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth }           from '../context/AuthContext';
import adminProfileService   from '../services/adminProfileService';
import Navbar                from '../components/common/Navbar';
import Footer                from '../components/common/Footer';
import AdminHeroSection      from '../components/admin/AdminHeroSection';
import MembersTable          from '../components/admin/MembersTable';
import AddMemberModal        from '../components/admin/AddMemberModal';
import AdminViewUserRecords  from '../components/admin/AdminViewUserRecords';
import AdminProfileModal     from '../components/admin/AdminProfileModal';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [adminProfile,   setAdminProfile]   = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showProfile,    setShowProfile]    = useState(false);
  const [showAddMember,  setShowAddMember]  = useState(false);
  const [viewingUserId,  setViewingUserId]  = useState(null);
  const [viewingFilters, setViewingFilters] = useState({});
  const [membersRefresh, setMembersRefresh] = useState(0);

  /* Fetch admin profile */
  const fetchAdminProfile = useCallback(async () => {
    try {
      const data = await adminProfileService.getProfile();
      setAdminProfile(data.profile || null);
    } catch (err) {
      console.error('Admin profile fetch:', err.message);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdminProfile(); }, [fetchAdminProfile]);

  /* Scroll lock when modal open */
  useEffect(() => {
    const anyOpen = showProfile || showAddMember;
    if (document.body) {
      document.body.classList.toggle('no-scroll', anyOpen);
    }
    return () => {
      if (document.body) document.body.classList.remove('no-scroll');
    };
  }, [showProfile, showAddMember]);

  const handleProfileSaved = (updated) => {
    setAdminProfile(updated);
    setShowProfile(false);
    toast.success('Profile updated! ✨');
  };

  const profilePhoto    = adminProfile?.photo?.url || '';
  const profileInitials = adminProfile?.name
    ? adminProfile.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const anyModal = showProfile || showAddMember;

  if (profileLoading) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'var(--bg-page, #f8fafc)',
          padding: 16,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{ 
              width: 36, 
              height: 36, 
              border: '3px solid #ede9fe', 
              borderTopColor: '#7c3aed', 
              borderRadius: '50%', 
              animation: 'spin .7s linear infinite', 
              margin: '0 auto 14px' 
            }} 
          />
          <div style={{ fontSize: 13, color: 'var(--text-muted, #6b7280)' }}>
            Loading admin panel...
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Main page — blurred when modal open */}
      <div
        className="page-wrap admin-dashboard-page"
        style={{
          filter:        anyModal ? 'blur(4px)' : 'none',
          transition:    'filter .3s ease',
          pointerEvents: anyModal ? 'none' : 'all',
          minHeight:     '100vh',
          display:       'flex',
          flexDirection: 'column',
          width:         '100%',
          overflowX:     'hidden',
          boxSizing:     'border-box'
        }}
      >
        <Navbar
          onProfileClick={() => setShowProfile(true)}
          onAddMemberClick={() => setShowAddMember(true)}
          profilePhoto={profilePhoto}
          profileInitials={profileInitials}
        />

        <AdminHeroSection
          adminAppId={user?.appId}
          profile={adminProfile}
          onEditProfile={() => setShowProfile(true)}
        />

        {/* Main content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
          {viewingUserId ? (
            <AdminViewUserRecords
              userId={viewingUserId}
              activeFilters={viewingFilters}
              onBack={() => { setViewingUserId(null); setViewingFilters({}); }}
            />
          ) : (
            <MembersTable
              onViewRecords={(id, filters) => { setViewingUserId(id); setViewingFilters(filters||{}); }}
              refreshTrigger={membersRefresh}
            />
          )}
        </main>

        <Footer />
      </div>

      {/* Modals — outside blur wrapper */}
      {showProfile && (
        <AdminProfileModal
          profile={adminProfile}
          onClose={() => setShowProfile(false)}
          onSaved={handleProfileSaved}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onCreated={() => {
            setShowAddMember(false);
            setMembersRefresh(n => n + 1);
          }}
        />
      )}

      {/* Global Dashboard Layout Rules */}
      <style>{`
        @media (max-width: 600px) {
          .admin-dashboard-page {
            width: 100% !important;
            overflow-x: hidden !important;
          }
        }
      `}</style>
    </>
  );
}