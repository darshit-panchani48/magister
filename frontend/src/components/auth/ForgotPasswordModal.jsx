// src/components/auth/ForgotPasswordModal.jsx — Fixed Buttons, Solid Styling & Mobile Responsive

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1=appId, 2=new password
  const [role, setRole] = useState('user');
  const [appId, setAppId] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const handleNext = () => {
    if (!appId.trim()) {
      toast.error('Enter your APP ID');
      return;
    }
    setStep(2);
  };

  const handleReset = async () => {
    if (!newPass) {
      toast.error('Enter new password');
      return;
    }
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPass !== confPass) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', {
        appId: appId.trim().toUpperCase(),
        newPassword: newPass,
        confirmPassword: confPass,
        role,
      });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Reset failed. Check your APP ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* Clean Input Styling */
  const inpStyle = {
    width: '100%',
    height: 42,
    padding: '0 12px',
    border: '1.5px solid var(--border, #e5e7eb)',
    borderRadius: 'var(--r-md, 8px)',
    fontSize: 13,
    background: 'var(--bg-input, #f9fafb)',
    color: 'var(--text-main, #111827)',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  };

  const lblStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-sub, #4b5563)',
    display: 'block',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textAlign: 'left',
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 6000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div
        className="modal-card forgot-modal-card"
        style={{
          width: '100%',
          maxWidth: 380,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          position: 'relative',
          boxSizing: 'border-box',
          margin: 'auto',
          overflow: 'hidden',
          borderRadius: 16,
          background: 'var(--bg-card, #ffffff)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: 8,
            border: '1px solid var(--border, #e5e7eb)',
            background: 'var(--bg-input, #f3f4f6)',
            color: 'var(--text-muted, #6b7280)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 15,
            zIndex: 10,
          }}
        >
          <i className="ti ti-x" />
        </button>

        {/* Header Academic Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 22,
            color: '#2563eb',
            flexShrink: 0,
          }}
        >
          <i className="ti ti-lock-open" />
        </div>

        {/* Scrollable Form Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingRight: 2,
          }}
        >
          {/* Title Section */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div
              className="academic-title"
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: 'var(--text-main, #111827)',
                marginBottom: 4,
              }}
            >
              {done
                ? 'Password Reset!'
                : step === 1
                ? 'Forgot Password'
                : 'Set New Password'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted, #6b7280)', lineHeight: 1.4 }}>
              {done
                ? 'You can now login with your new password'
                : step === 1
                ? 'Enter your APP ID to reset your password'
                : `Resetting password for ${appId.toUpperCase()}`}
            </div>
          </div>

          {/* Done State */}
          {done ? (
            <button 
              onClick={onClose} 
              style={{
                width: '100%',
                height: 42,
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <i className="ti ti-check" style={{ fontSize: 15 }} />
              Go to Login
            </button>
          ) : step === 1 ? (
            <>
              {/* Role Selector Tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['user', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 8,
                      border: '1.5px solid',
                      borderColor: role === r ? '#2563eb' : 'var(--border, #e5e7eb)',
                      background: role === r ? '#eff6ff' : 'var(--bg-input, #f9fafb)',
                      color: role === r ? '#1e40af' : 'var(--text-muted, #6b7280)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <i
                      className={`ti ${
                        r === 'admin' ? 'ti-shield' : 'ti-user'
                      }`}
                      style={{ fontSize: 13 }}
                    />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>

              {/* APP ID Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={lblStyle}>APP ID *</label>
                <input
                  style={inpStyle}
                  placeholder="Enter your APP ID"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
              </div>

              {/* Solid Primary Button */}
              <button 
                onClick={handleNext} 
                style={{
                  width: '100%',
                  height: 42,
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  marginBottom: 10,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                }}
              >
                <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
                Continue
              </button>

              {/* Cancel Button */}
              <button 
                onClick={onClose} 
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  border: '1.5px solid var(--border, #e5e7eb)',
                  background: 'transparent',
                  color: 'var(--text-main, #374151)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {/* New Password Input */}
              <div style={{ marginBottom: 14 }}>
                <label style={lblStyle}>New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showP1 ? 'text' : 'password'}
                    style={{ ...inpStyle, paddingRight: 40 }}
                    placeholder="Min 6 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowP1((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      fontSize: 16,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <i className={`ti ${showP1 ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div style={{ marginBottom: 18 }}>
                <label style={lblStyle}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showP2 ? 'text' : 'password'}
                    style={{ ...inpStyle, paddingRight: 40 }}
                    placeholder="Re-enter password"
                    value={confPass}
                    onChange={(e) => setConfPass(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowP2((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      fontSize: 16,
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <i className={`ti ${showP2 ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
              </div>

              {/* Reset Submit Button */}
              <button
                onClick={handleReset}
                disabled={loading}
                style={{
                  width: '100%',
                  height: 42,
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  marginBottom: 10,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <i className="ti ti-lock-check" style={{ fontSize: 14 }} />{' '}
                    Reset Password
                  </>
                )}
              </button>

              {/* Back Button */}
              <button 
                onClick={() => setStep(1)} 
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  border: '1.5px solid var(--border, #e5e7eb)',
                  background: 'transparent',
                  color: 'var(--text-main, #374151)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 480px) {
          .forgot-modal-card {
            max-width: 95% !important;
            padding: 20px 16px !important;
            max-height: 90vh !important;
          }
        }
      `}</style>
    </div>
  );
}