// src/components/user/ProfileModal.jsx — Responsive & Scrollable User Profile Modal

import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DESIGNATIONS = [
  'Administrator', 'Principal', 'Vice Principal', 'HOD',
  'Professor', 'Associate Professor', 'Assistant Professor',
  'Coordinator', 'Office Superintendent', 'Other',
];
const DEPARTMENTS = ['BCA', 'BSC.CS', 'BSC.CHEMISTRY', 'BSC.MICRO', 'MSC.CHEMISTRY', 'OTHER'];

export default function ProfileModal({ profile, onClose, onSaved }) {
  const { updateUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    teacherId: '', name: '', email: '', contact: '',
    designation: '', department: '', joiningDate: '', accountNumber: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Scroll lock */
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  /* Pre-fill */
  useEffect(() => {
    if (profile) {
      setForm({
        teacherId: profile.teacherId || '',
        name: profile.name || '',
        email: profile.email || '',
        contact: profile.contact || '',
        designation: profile.designation || '',
        department: profile.department || '',
        joiningDate: profile.joiningDate
          ? new Date(profile.joiningDate).toISOString().split('T')[0]
          : '',
        accountNumber: profile.accountNumber || '',
      });
      setPhotoPreview(profile.photo?.url || '');
    }
  }, [profile]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setError('');
    setForm((p) => ({ ...p, [name]: value }));
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const getInitials = (name = '') => {
    const p = name.trim().split(' ');
    return p.length >= 2
      ? `${p[0][0]}${p[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase() || 'U';
  };

  const validate = () => {
    const req = ['teacherId', 'name', 'email', 'contact', 'designation', 'department', 'joiningDate'];
    for (const k of req) {
      if (!form[k]?.trim())
        return `${k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} is required`;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email address';
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') fd.append(k, v);
      });
      if (photoFile) fd.append('photo', photoFile);
      const { data } = await api.put('/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile saved! ✨');
      updateUser({ isProfileComplete: true });
      onSaved(data.profile);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* Shared field styles using CSS Variables */
  const inp = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-md)',
    fontSize: 13,
    background: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  };

  const lbl = {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-sub)',
    display: 'block',
    marginBottom: 5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 6000, padding: 12 }}>
      <div
        className="modal-card user-profile-modal-card"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderRadius: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              className="academic-title"
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <i className="ti ti-user-check" style={{ fontSize: 18, color: 'var(--primary)' }} />
              My Profile
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Manage your personal and professional information
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ width: 30, height: 30, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '18px 20px 22px',
          }}
        >
          {/* Error Banner */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                fontSize: 12,
                padding: '9px 12px',
                borderRadius: 'var(--r-md)',
                wordBreak: 'break-word',
              }}
            >
              <i className="ti ti-alert-circle" style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Avatar + Top Fields */}
            <div
              className="profile-avatar-row"
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: 16,
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar Picker */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <div
                  onClick={() => fileRef.current?.click()}
                  title="Click to change photo"
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: photoPreview
                      ? 'transparent'
                      : 'var(--grad-navy)',
                    border: '3px solid var(--primary-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <span>{getInitials(form.name)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-outline"
                  style={{
                    fontSize: 10,
                    padding: '3px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <i className="ti ti-upload" style={{ fontSize: 10 }} /> Photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhoto}
                />
              </div>

              {/* Name + Teacher ID & Contact */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input
                    style={inp}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    disabled={loading}
                  />
                </div>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={lbl}>Teacher ID *</label>
                    <input
                      style={inp}
                      name="teacherId"
                      value={form.teacherId}
                      onChange={handleChange}
                      placeholder="ASSC/2024/001"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Contact *</label>
                    <input
                      style={inp}
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="98765 43210"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Email Address *</label>
              <input
                style={inp}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@assc.ac.in"
                disabled={loading}
              />
            </div>

            {/* Designation + Department */}
            <div
              className="form-grid-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label style={lbl}>Designation *</label>
                <select
                  style={{ ...inp, appearance: 'auto' }}
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Department *</label>
                <select
                  style={{ ...inp, appearance: 'auto' }}
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Joining Date + Account Number */}
            <div
              className="form-grid-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={lbl}>Joining Date *</label>
                <input
                  style={inp}
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label style={lbl}>Account Number</label>
                <input
                  style={inp}
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  placeholder="Bank account no."
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions-row" style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px 0', fontSize: 12.5 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 2, padding: '10px 0', fontSize: 12.5 }}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <i className="ti ti-device-floppy" style={{ fontSize: 15 }} />
                    {profile ? 'Update Profile' : 'Save Profile'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 520px) {
          .user-profile-modal-card {
            max-width: 95% !important;
            max-height: 90vh !important;
          }
          .profile-avatar-row {
            flex-direction: column !important;
            align-items: center !important;
          }
          .profile-avatar-row > div:nth-child(2) {
            width: 100% !important;
          }
          .form-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .modal-actions-row {
            flex-direction: column-reverse !important;
          }
          .modal-actions-row button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}