// src/pages/LoginPage.jsx — Mobile Responsive Login Page with Ambient Glow (Force Light Theme)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import logoImg from '../assets/logo.png';
import bgImage from '../assets/back1.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  const [appId, setAppId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  // Force Remove Dark Mode on Login Page
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);

  // If already authenticated in this tab, redirect correctly
  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', showForgot);
    return () => document.body.classList.remove('no-scroll');
  }, [showForgot]);

  const handleLogin = async (selectedRole) => {
    setError('');
    if (!appId.trim()) {
      setError('Please enter your APP ID');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(appId.trim(), password, selectedRole);
      toast.success('Login successful!');
      navigate(selectedRole === 'admin' ? '/admin' : '/dashboard', {
        replace: true,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="login-container"
        style={{
          minHeight: '100dvh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflowY: 'auto',
          filter: showForgot ? 'blur(4px)' : 'none',
          transition: 'filter .3s ease',
          pointerEvents: showForgot ? 'none' : 'all',
          padding: '20px 16px',
          boxSizing: 'border-box',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* ── Login Card (Fixed Light Mode White Background & Dark Text) ── */}
        <div
          className="login-card"
          style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '32px',
            padding: '36px 28px',
            width: '100%',
            maxWidth: '390px',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 5,
            margin: 'auto',
            boxShadow: `
              0 20px 50px -10px rgba(0, 0, 0, 0.25),
              0 0 40px 12px rgba(250, 204, 21, 0.35),
              0 0 60px 18px rgba(0, 82, 204, 0.3)
            `,
          }}
        >
          {/* Header / Logo */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                boxShadow: 'none',
              }}
            >
              <img
                src={logoImg}
                alt="ASSC"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
            <div
              className="academic-title"
              style={{
                fontSize: 25,
                fontWeight: 800,
                color: '#06b6d4',
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontStyle: 'italic',
                marginBottom: 2,
              }}
            >
              Magister
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: '#64748b',
                letterSpacing: '.04em',
                fontWeight: 500,
              }}
            >
              Sign in to your account
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                fontSize: 12,
                padding: '9px 12px',
                borderRadius: '12px',
                marginBottom: 14,
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              <i
                className="ti ti-alert-circle"
                style={{ fontSize: 16, flexShrink: 0 }}
              />
              {error}
            </div>
          )}

          {/* APP ID */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ position: 'relative' }}>
              <i
                className="ti ti-id-badge"
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 17,
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
              <input
                value={appId}
                onChange={(e) => {
                  setAppId(e.target.value);
                  setError('');
                }}
                placeholder="Enter your APP ID"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin('user')}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: 13,
                  background: '#ffffff',
                  color: '#0f172a',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ position: 'relative' }}>
              <i
                className="ti ti-lock"
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 17,
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin('user')}
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 42px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: 13,
                  background: '#ffffff',
                  color: '#0f172a',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: 17,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={{ textAlign: 'right', marginBottom: 18 }}>
            <button
              onClick={() => setShowForgot(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11.5,
                color: '#06b6d4',
                fontWeight: 500,
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span
              style={{
                fontSize: 10.5,
                color: '#94a3b8',
                fontWeight: 500,
              }}
            >
              Sign In With
            </span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Login Action Buttons */}
          <div
            className="action-btn-group"
            style={{
              display: 'flex',
              gap: 8,
              flexDirection: 'row',
            }}
          >
            <button
              onClick={() => handleLogin('user')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px 0',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3)',
              }}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <i className="ti ti-users" style={{ fontSize: 15 }} /> User
                </>
              )}
            </button>
            <button
              onClick={() => handleLogin('admin')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px 0',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
              }}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <i className="ti ti-shield" style={{ fontSize: 15 }} /> Admin
                </>
              )}
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 18,
              fontSize: 10.5,
              color: '#94a3b8',
            }}
          >
            ASSC · Exam Remuneration Management System
          </div>
        </div>
      </div>

      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}

      {/* Animation & Mobile Media Queries */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        input:focus {
          background: #ffffff !important;
          color: #0f172a !important;
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 18px !important;
            border-radius: 24px !important;
            max-width: 95% !important;
          }
          .academic-title {
            font-size: 22px !important;
          }
        }
      `}</style>
    </>
  );
}