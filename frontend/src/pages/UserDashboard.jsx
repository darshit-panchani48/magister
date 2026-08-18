// src/pages/UserDashboard.jsx — Complete & Fixed with Live View Record Refreshing

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth }        from '../context/AuthContext';
import userService        from '../services/userService';
import examService        from '../services/examService';
import Navbar             from '../components/common/Navbar';
import Footer             from '../components/common/Footer';
import HeroSection        from '../components/user/HeroSection';
import ProgressSection    from '../components/user/ProgressSection';
import ExamTable          from '../components/user/ExamTable';
import ProfileModal       from '../components/user/ProfileModal';
import AddExamModal       from '../components/user/AddExamModal';
import LabDutyModal       from '../components/user/LabDutyModal';
import GeneralDutyModal   from '../components/user/GeneralDutyModal';
import PdfDownloadModal   from '../components/user/PdfDownloadModal';
import ViewRecordModal    from '../components/user/ViewRecordModal';

const LAB_ROOMS = ['COMPUTER LAB-1', 'COMPUTER LAB-2', 'BOTANY LAB', 'MICRO LAB', 'CHEMISTRY LAB-1', 'CHEMISTRY LAB-2', 'CHEMISTRY LAB-3', 'PHYSICS LAB'];

export default function UserDashboard() {
  const { user } = useAuth();
  const [profile,        setProfile]        = useState(null);
  const [stats,          setStats]          = useState(null);
  const [records,        setRecords]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showProfile,    setShowProfile]    = useState(false);
  const [showAddExam,    setShowAddExam]    = useState(false);
  const [editExamRecord, setEditExamRecord] = useState(null);
  const [tableRefresh,   setTableRefresh]   = useState(0);
  const [showLabDuty,    setShowLabDuty]    = useState(false);
  const [showGeneral,    setShowGeneral]    = useState(false);
  const [showPdf,        setShowPdf]        = useState(false);
  const [dutyBasic,      setDutyBasic]      = useState(null);
  const [labEditRecord,  setLabEditRecord]  = useState(null);
  const [genEditRecord,  setGenEditRecord]  = useState(null);
  const [viewRecord,     setViewRecord]     = useState(null); // 🌟 Added viewRecord state here

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await userService.getDashboard();
      const updatedRecords = data.data?.records || [];
      setProfile(data.data?.profile || null);
      setStats(data.data?.stats     || null);
      setRecords(updatedRecords);

      // 🌟 If View Modal is open, keep its data updated live when dashboard refreshes
      if (viewRecord) {
        const freshRec = updatedRecords.find(r => r._id === viewRecord._id);
        if (freshRec) setViewRecord(freshRec);
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [viewRecord]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const anyOpen = showProfile || showAddExam || showLabDuty || showGeneral || showPdf || viewRecord;
    document.body.classList.toggle('no-scroll', anyOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [showProfile, showAddExam, showLabDuty, showGeneral, showPdf, viewRecord]);

  const handleProfileSaved = (updated) => {
    setProfile(updated);
    setShowProfile(false);
    fetchDashboard();
  };

  const handleEditExam = (record) => {
    const rType = record.recordType || 'exam';
    const basic = {
      university:   record.university,
      department:   record.department,
      examCategory: record.examCategory,
      date:         record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      role:         record.role,
      block:        record.block,
      room:         record.room,
    };
    setDutyBasic(basic);

    if (rType === 'lab') {
      setLabEditRecord(record);
      setGenEditRecord(null);
      setEditExamRecord(null);
    } else if (rType === 'general') {
      setGenEditRecord(record);
      setLabEditRecord(null);
      setEditExamRecord(null);
    } else {
      setEditExamRecord(record);
      setLabEditRecord(null);
      setGenEditRecord(null);
    }
    setShowAddExam(true);
  };

  const handleNextTrigger = (basic) => {
    setShowAddExam(false);
    const roleLower = (basic.role || '').toLowerCase();
    const isLab   = roleLower.includes('lab') && LAB_ROOMS.includes(basic.room);
    const isOther = basic.role === 'Other';
    setDutyBasic(basic);
    if (isLab)   { setShowLabDuty(true); return; }
    if (isOther) { setShowGeneral(true); return; }
  };

  const handleDutyBack = () => {
    setShowLabDuty(false);
    setShowGeneral(false);
    setShowAddExam(true);
  };

  const handleExamSaved = () => {
    setTableRefresh(n => n + 1);
    fetchDashboard();
  };

  const handleDutyClosed = () => {
    setShowLabDuty(false);
    setShowGeneral(false);
    setDutyBasic(null);
    setLabEditRecord(null);
    setGenEditRecord(null);
    setEditExamRecord(null);
    setTableRefresh(n => n + 1);
    fetchDashboard();
  };

  const profilePhoto    = profile?.photo?.url || '';
  const profileInitials = profile?.name
    ? profile.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : user?.appId?.charAt(0)?.toUpperCase() || 'U';

  const anyModal = showProfile || showAddExam || showLabDuty || showGeneral || showPdf || viewRecord;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 14px' }}/>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading dashboard...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <div className="page-wrap" style={{ filter: anyModal ? 'blur(4px)' : 'none', transition: 'filter .3s ease', pointerEvents: anyModal ? 'none' : 'all' }}>
        <Navbar onProfileClick={() => setShowProfile(true)} profilePhoto={profilePhoto} profileInitials={profileInitials}/>
        <HeroSection profile={profile} onEditProfile={() => setShowProfile(true)}/>
        <ProgressSection stats={stats} records={records} onPdfClick={() => setShowPdf(true)}/>
        <ExamTable
          onAddExam={() => { setEditExamRecord(null); setDutyBasic(null); setLabEditRecord(null); setGenEditRecord(null); setShowAddExam(true); }}
          onEditExam={handleEditExam}
          refreshTrigger={tableRefresh}
          profileName={profile?.name}
          onViewRecord={(rec) => setViewRecord(rec)} // 🌟 Pass view handler to table if needed
        />
        <Footer/>
      </div>

      {showProfile && (
        <ProfileModal profile={profile} onClose={() => setShowProfile(false)} onSaved={handleProfileSaved}/>
      )}

      {showAddExam && (
        <AddExamModal
          onClose={() => { setShowAddExam(false); setEditExamRecord(null); setDutyBasic(null); setLabEditRecord(null); setGenEditRecord(null); }}
          onSaved={handleExamSaved}
          onNextTrigger={handleNextTrigger}
          editRecord={editExamRecord}
          prefillBasic={dutyBasic}
        />
      )}

      {showLabDuty && (
        <LabDutyModal
          examBasic={dutyBasic}
          onBack={handleDutyBack}
          onClose={handleDutyClosed}
          onSaved={handleDutyClosed}
          editRecord={labEditRecord}
        />
      )}

      {showGeneral && (
        <GeneralDutyModal
          examBasic={dutyBasic}
          onBack={handleDutyBack}
          onClose={handleDutyClosed}
          onSaved={handleDutyClosed}
          editRecord={genEditRecord}
        />
      )}

      {viewRecord && (
        <ViewRecordModal record={viewRecord} onClose={() => setViewRecord(null)} />
      )}

      {showPdf && (
        <PdfDownloadModal profileName={profile?.name} onClose={() => setShowPdf(false)}/>
      )}
    </>
  );
}