// src/pages/SplashScreen.jsx — Prominent Logo, Perfect Typography & Zero-Wasted Space for Mobile

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  // 0 = hidden, 1 = italic cursive appears, 2 = fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => navigate('/login'), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between', // Top-to-bottom balanced alignment
        padding: 'clamp(40px, 8vh, 60px) 20px clamp(24px, 5vh, 40px)',
        boxSizing: 'border-box',
        opacity: phase === 2 ? 0 : 1,
        transition: 'opacity 0.8s ease',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 450px)',
          height: 'min(50vh, 250px)',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(37,99,235,.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── TOP / CENTER CONTENT ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          margin: 'auto 0',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ASSC Logo — Slightly Bigger for Mobile */}
        <div
          style={{
            width: 'clamp(100px, 28vw, 130px)',
            height: 'clamp(100px, 28vw, 130px)',
            marginBottom: 24,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1
              ? 'translateY(0) scale(1)'
              : 'translateY(-20px) scale(.9)',
            transition: 'all 1s cubic-bezier(.16,1,.3,1)',
            flexShrink: 0,
          }}
        >
          <img
            src={logoImg}
            alt="ASSC Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>

        {/* MAGISTER — Title */}
        <div
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 'clamp(46px, 14vw, 86px)',
            color: '#ffffff',
            letterSpacing: '0.02em',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.96)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            textShadow: '0 0 60px rgba(255,255,255,.15)',
            userSelect: 'none',
            textAlign: 'center',
            lineHeight: 1.05,
          }}
        >
          Magister
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(10.5px, 2.8vw, 13px)',
            color: 'rgba(255,255,255,.5)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginTop: 18,
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            userSelect: 'none',
            textAlign: 'center',
            maxWidth: '92%',
            lineHeight: 1.5,
          }}
        >
          Exam Remuneration Management System
        </div>
      </div>

      {/* ── BOTTOM FOOTER / CREDIT ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          width: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Animated Progress Line */}
        <div
          style={{
            width: 'clamp(130px, 35vw, 170px)',
            height: 2,
            background: 'rgba(255,255,255,.08)',
            borderRadius: 2,
            overflow: 'hidden',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity .5s ease 0.6s',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #ffffff)',
              borderRadius: 2,
              animation: phase >= 1 ? 'splashBar 2.5s ease forwards' : 'none',
            }}
          />
        </div>

        {/* ASSC Credit */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(10px, 2.4vw, 11px)',
            fontWeight: 600,
            color: 'rgba(255,255,255,.5)',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity .5s ease 0.1s',
          }}
        >
          ASSC • DP Production
        </div>
      </div>

      <style>{`
        @keyframes splashBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;