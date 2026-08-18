// src/components/common/Footer.jsx — Solid Black Footer with Brand Logo Added Above Developer Credit

import React from 'react';
import logoImg      from '../../assets/logo.png';
import brandLogoImg from '../../assets/brand.png';
import collegePhoto from '../../assets/college-photo.avif';

const SOCIAL = [
  { icon: 'ti-brand-instagram', href: 'https://www.instagram.com/assc_surat', label: 'Instagram' },
  { icon: 'ti-brand-facebook',  href: 'https://www.facebook.com/assc.surat/', label: 'Facebook' },
  { icon: 'ti-brand-telegram',  href: 'https://www.telegram.me/assc_surat', label: 'Telegram' },
  { icon: 'ti-brand-twitter',   href: 'https://www.twitter.com/assc_surat', label: 'Twitter' },
  { icon: 'ti-brand-linkedin',  href: 'https://www.linkedin.com/company/atmanand-saraswati-science-college/', label: 'LinkedIn' },
];

const Footer = () => (
  <footer style={{
    background:   '#000000',
    color:        '#cbd5e1',
    borderTop:    '1px solid rgba(255,255,255,.1)',
    marginTop:    'auto',
    width:        '100%',
    boxSizing:    'border-box'
  }}>
    {/* Main footer content */}
    <div className="footer-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 24px', boxSizing: 'border-box' }}>
      <div className="footer-grid" style={{
        display:             'grid',
        gridTemplateColumns: '1.5fr 1.2fr 1fr 1.1fr',
        gap:                 32,
        marginBottom:        28,
      }}>

        {/* Col 1 — Brand */}
        <div className="footer-col footer-brand-col">
          <div className="footer-brand-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="footer-logo-wrap" style={{
              width: 56, height: 56,
              overflow: 'hidden', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent'
            }}>
              <img
                src={logoImg}
                alt="ASSC"
                className="footer-logo-img"
                style={{ width: 52, height: 52, objectFit: 'contain' }}
                onError={e => (e.target.style.display = 'none')}
              />
            </div>
            <div className="footer-brand-text">
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>ASSC</div>
              <div style={{ fontSize: 9.5, color: '#94a3b8', letterSpacing: '0.05em' }}>
                ATMANAND SARASWATI SCIENCE COLLEGE
              </div>
            </div>
          </div>
          <p className="footer-brand-desc" style={{ fontSize: 11.5, color: '#e2e8f0', lineHeight: 1.7, marginBottom: 14 }}>
            A premier institute committed to excellence in science education,
            research and holistic development of students.
          </p>
          {/* Social Icons */}
          <div className="footer-social-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SOCIAL.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(255,255,255,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#94a3b8', textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <i className={`ti ${s.icon}`} />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Contact */}
        <div className="footer-col footer-contact-col">
          <h4 style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Contact Us
          </h4>
          {[
            { icon: 'ti-map-pin', text: 'Kapodra, Varachha Road, Surat – 395006, Gujarat' },
            { icon: 'ti-phone',   text: '+91 6356127567 · (0261) 2574645' },
            { icon: 'ti-mail',    text: 'asscsurat@gmail.com' },
            { icon: 'ti-globe',   text: 'www.sassc.in' },
          ].map(c => (
            <div key={c.icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
              <i className={`ti ${c.icon}`} style={{ color: '#38bdf8', fontSize: 13, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5, wordBreak: 'break-word' }}>{c.text}</span>
            </div>
          ))}
        </div>

        {/* Col 3 — Quick Links */}
        <div className="footer-col footer-links-col">
          <h4 style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Quick Links
          </h4>
          {['About College', 'Academics', 'Departments', 'Student Corner', 'Contact Us'].map(l => (
            <a
              key={l}
              href="https://sassc.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#94a3b8', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >
              <i className="ti ti-chevron-right" style={{ fontSize: 10, color: '#38bdf8' }} />
              {l}
            </a>
          ))}
        </div>

        {/* Col 4 — Campus Photo */}
        <div className="footer-col footer-campus-col">
          <h4 style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Our Campus
          </h4>
          <div style={{
            borderRadius: 10, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,.15)',
            height: 140,
            width: '100%',
            background: '#000'
          }}>
            <img
              src={collegePhoto}
              alt="ASSC Campus"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }}
              onError={e => (e.target.style.display = 'none')}
            />
          </div>
          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
            Shree Swami Atmanand Saraswati Vidhya Sankul, Surat
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom" style={{
        borderTop:      '1px solid rgba(255,255,255,.1)',
        paddingTop:     18,
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        flexWrap:       'wrap',
        gap:            14,
      }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          © {new Date().getFullYear()} Atmanand Saraswati Science College. All Rights Reserved.
        </span>

        {/* 🌟 brand.png Logo Added Above JD & DP Production */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '0 auto' }} className="footer-brand-logo-area">
          <img
            src={brandLogoImg}
            alt="Brand Logo"
            style={{ width: 'clamp(70px, 10vw, 100px)', height: 'auto', objectFit: 'contain', display: 'block' }}
            onError={e => (e.target.style.display = 'none')}
          />
        </div>

        <span style={{ fontSize: 11, color: '#cbd5e1' }}>
          Designed &amp; Developed by{' '}
          <span style={{ color: '#ff7d00', fontWeight: 700, textShadow: '0 0 10px rgba(255,125,0,0.3)' }}>JD &amp; DP Production</span>
        </span>
      </div>
    </div>

    {/* Responsive & Center Aligned Styles */}
    <style>{`
      @media (max-width: 900px) {
        .footer-grid { 
          grid-template-columns: 1fr 1fr !important; 
          gap: 24px !important;
        }
      }
      @media (max-width: 560px) {
        .footer-container {
          padding: 24px 16px 18px !important;
        }
        .footer-grid { 
          grid-template-columns: 1fr !important; 
          gap: 28px !important;
          margin-bottom: 20px !important;
        }
        .footer-col {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
        .footer-brand-header {
          flex-direction: column !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .footer-logo-wrap {
          width: 72px !important;
          height: 72px !important;
        }
        .footer-logo-img {
          width: 64px !important;
          height: 64px !important;
        }
        .footer-social-row {
          justify-content: center !important;
        }
        .footer-contact-col div, 
        .footer-links-col a {
          justify-content: center !important;
          align-items: center !important;
        }
        .footer-bottom {
          flex-direction: column !important;
          align-items: center !important;
          gap: 14px !important;
          text-align: center !important;
        }
        .footer-brand-logo-area {
          margin: 0 !important;
        }
      }
    `}</style>
  </footer>
);

export default Footer;