// src/components/user/HeroSection.jsx — Original Desktop Layout + Mobile-Only Box Theme (Matching Admin)

import React from 'react';
import { format } from 'date-fns';
import collegePhoto from '../../assets/college-photo.avif';

export default function HeroSection({ profile, onEditProfile }) {
  const isComplete = !!profile?.name;

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <section className="user-hero-outer-section">
      <div className="user-hero-card-box">
        {/* Avatar Area */}
        <div className="user-avatar-box">
          <div
            onClick={onEditProfile}
            title="Edit Profile"
            className="user-avatar-circle"
            style={{
              background: profile?.photo?.url
                ? 'transparent'
                : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            }}
          >
            {profile?.photo?.url ? (
              <img
                src={profile.photo.url}
                alt={profile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : isComplete ? (
              getInitials(profile.name)
            ) : (
              <i className="ti ti-user" style={{ fontSize: 28 }} />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="user-content-box">
          {isComplete ? (
            <>
              {/* Name & Title Badge */}
              <div className="user-header-row">
                <h1 className="user-profile-name">
                  {profile.name}
                </h1>
                <span className="user-designation-badge">
                  <i className="ti ti-user-check" style={{ fontSize: 11 }} />
                  {profile.designation || 'Teacher'}
                </span>
              </div>

              {/* Grid Details */}
              <div className="user-details-grid">
                {[
                  { icon: 'ti-id-badge', label: 'Teacher ID', value: profile.teacherId },
                  { icon: 'ti-building', label: 'Department', value: profile.department },
                  { icon: 'ti-mail', label: 'Email', value: profile.email },
                  { icon: 'ti-phone', label: 'Contact', value: profile.contact },
                  {
                    icon: 'ti-calendar',
                    label: 'Joined',
                    value: profile.joiningDate
                      ? format(new Date(profile.joiningDate), 'dd MMM yyyy')
                      : null,
                  },
                  { icon: 'ti-credit-card', label: 'Account', value: profile.accountNumber ? `****${profile.accountNumber.slice(-4)}` : null },
                ]
                  .filter((r) => r.value)
                  .map((row) => (
                    <div key={row.label} className="user-detail-item">
                      <i className={`ti ${row.icon} user-detail-icon`} />
                      <div className="user-detail-text">
                        <div className="user-detail-label">{row.label}</div>
                        <div className="user-detail-value">{row.value}</div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Edit Profile Button */}
              <div className="user-btn-row">
                <button onClick={onEditProfile} className="user-edit-btn">
                  <i className="ti ti-edit" style={{ fontSize: 13 }} />
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            /* Empty State */
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                Welcome to Magister!
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                Complete your profile to get started with exam supervision records.
              </div>
              <button onClick={onEditProfile} className="user-complete-btn">
                <i className="ti ti-user-edit" style={{ fontSize: 15 }} />
                Complete Profile
              </button>
            </div>
          )}
        </div>

        {/* Campus Photo */}
        <div className="user-campus-img">
          <img
            src={collegePhoto}
            alt="ASSC Campus"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      </div>

      {/* ── CSS Styles ── */}
      <style>{`
        /* ── DESKTOP ORIGINAL STYLES ── */
        .user-hero-outer-section {
          background: var(--hero-bg, linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #dbeafe 100%));
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 28px;
          width: 100%;
          box-sizing: border-box;
        }

        .user-hero-card-box {
          display: flex;
          align-items: center;
          gap: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .user-avatar-box {
          flex-shrink: 0;
        }

        .user-avatar-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 4px 16px rgba(37,99,235,.25);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }

        .user-content-box {
          flex: 1;
          min-width: 0;
        }

        .user-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .user-profile-name {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main, #0f172a);
          line-height: 1.2;
          margin: 0;
        }

        .user-designation-badge {
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .user-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 6px 24px;
          margin-bottom: 12px;
          width: 100%;
        }

        .user-detail-item {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }

        .user-detail-icon {
          font-size: 14px;
          color: #2563eb;
          flex-shrink: 0;
        }

        .user-detail-text {
          min-width: 0;
          flex: 1;
        }

        .user-detail-label {
          font-size: 9px;
          color: var(--text-main, #0f172a);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .user-detail-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main, #0f172a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          background: #fff;
          border: 1.5px solid #dbeafe;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #2563eb;
          cursor: pointer;
        }

        .user-complete-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          background: #2563eb;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37,99,235,.3);
        }

        .user-campus-img {
          width: 130px;
          height: 90px;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid #e5e7eb;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,.08);
        }

        @media (max-width: 768px) {
          .user-campus-img {
            display: none !important;
          }
        }

        /* ── MOBILE ONLY BOX THEME (max-width: 600px) ── */
        @media (max-width: 600px) {
          .user-hero-outer-section {
            padding: 12px 10px !important;
            display: flex !important;
            justify-content: center !important;
          }

          .user-hero-card-box {
            background: var(--bg-card, #ffffff) !important;
            border: 1px solid var(--border, #e2e8f0) !important;
            border-radius: 16px !important;
            padding: 16px 14px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 14px !important;
          }

          .user-avatar-circle {
            width: 76px !important;
            height: 76px !important;
            margin: 0 auto !important;
            font-size: 22px !important;
          }

          .user-header-row {
            justify-content: center !important;
          }

          .user-details-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            text-align: left !important;
          }

          .user-detail-item {
            background: var(--bg-page, #f8fafc) !important;
            padding: 6px 8px !important;
            border-radius: 8px !important;
            border: 1px solid var(--border, #f1f5f9) !important;
          }

          .user-btn-row {
            text-align: center !important;
            margin-top: 6px !important;
          }
        }

        @media (max-width: 380px) {
          .user-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}