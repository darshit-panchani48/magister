// src/components/admin/AddMemberModal.jsx — Mobile Responsive with Scrollable Body

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

export default function AddMemberModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    appId: '',
    password: '',
    confirmPassword: '',
  });
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setError('');
    setForm((p) => ({ ...p, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) {
      setError('Password is required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await adminService.createMember({
        appId: form.appId.trim() || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setCreated({ appId: data.user.appId, password: form.password });
      toast.success(`Member created: ${data.user.appId} ✅`);
      onCreated?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create member';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%',
    padding: '10px 12px',
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
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 5000, padding: 12 }}>
      <div
        className="modal-card add-member-modal-card"
        style={{
          width: '100%',
          maxWidth: 400,
          maxHeight: '88vh', // 👈 Internal scroll on small screens
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          position: 'relative',
          boxSizing: 'border-box',
          margin: '0 auto',
          overflowY: 'auto', // 👈 Scroll enabled
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-outline"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="ti ti-x" />
        </button>

        {/* Header Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--pro-light)',
            border: '1px solid var(--pro-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: 22,
            color: 'var(--pro)',
            flexShrink: 0,
          }}
        >
          <i className="ti ti-user-plus" />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 18, flexShrink: 0 }}>
          <div
            className="academic-title"
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 4,
            }}
          >
            Add New Member
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Create login credentials for a new teacher
          </div>
        </div>

        {/* Success state */}
        {created ? (
          <>
            <div
              style={{
                background: 'var(--success-light)',
                border: '1px solid var(--success-border)',
                color: 'var(--success-text)',
                fontSize: 12.5,
                padding: 14,
                borderRadius: 'var(--r-md)',
                textAlign: 'center',
                marginBottom: 16,
                lineHeight: 1.7,
                wordBreak: 'break-word',
              }}
            >
              <i
                className="ti ti-circle-check"
                style={{ fontSize: 22, display: 'block', marginBottom: 6 }}
              />
              <strong>Member Created Successfully!</strong>
              <br />
              Share these credentials:
              <br />
              <br />
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                APP ID: <strong>{created.appId}</strong>
              </span>
              <br />
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                Password: <strong>{created.password}</strong>
              </span>
            </div>
            <button
              onClick={onClose}
              className="btn btn-pro"
              style={{ width: '100%', padding: '11px 0', fontSize: 13 }}
            >
              <i className="ti ti-check" style={{ fontSize: 15 }} /> Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ flex: 1 }}>
            {/* Error Banner */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  fontSize: 11.5,
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  marginBottom: 14,
                  wordBreak: 'break-word',
                }}
              >
                <i className="ti ti-alert-circle" style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            {/* APP ID */}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>
                APP ID{' '}
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                    textTransform: 'none',
                  }}
                >
                  (leave blank for auto)
                </span>
              </label>
              <input
                style={inp}
                name="appId"
                value={form.appId}
                autoComplete="new-id"
                onChange={handleChange}
                placeholder="e.g. ASSC/2024/010"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inp, paddingRight: 38 }}
                  name="password"
                  autoComplete="new-password"
                  type={showP1 ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowP1((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-placeholder)',
                    fontSize: 15,
                    padding: 0,
                  }}
                >
                  <i className={`ti ${showP1 ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inp, paddingRight: 38 }}
                  name="confirmPassword"
                  type={showP2 ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowP2((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-placeholder)',
                    fontSize: 15,
                    padding: 0,
                  }}
                >
                  <i className={`ti ${showP2 ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>

            <div className="modal-actions-row" style={{ display: 'flex', gap: 8 }}>
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
                className="btn btn-pro"
                style={{ flex: 1.8, padding: '10px 0', fontSize: 12.5 }}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <i className="ti ti-user-plus" style={{ fontSize: 14 }} />{' '}
                    Create Member
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) {
          .add-member-modal-card {
            padding: 20px 16px !important;
            max-width: 95% !important;
            max-height: 90vh !important;
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