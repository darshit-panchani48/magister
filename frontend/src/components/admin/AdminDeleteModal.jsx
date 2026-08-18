// src/components/admin/AdminDeleteModal.jsx — Responsive & Scrollable Admin 3-Step Delete Modal

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

export default function AdminDeleteModal({ record, onClose, onDeleted }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await adminService.adminDeleteRecord(record._id, reason.trim());
      toast.success('Record deleted and user notified ✅');
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!reason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
      setStep(3);
      return;
    }
    handleDelete();
  };

  const STEPS = [
    {
      title: 'Delete Record?',
      sub: `You are about to delete the exam record for ${record.university} — ${record.examCategory}. This cannot be undone.`,
    },
    {
      title: 'Provide Reason',
      sub: 'Please provide a reason for deletion. The user will be notified.',
    },
    {
      title: 'Final Confirmation',
      sub: 'Are you absolutely sure? This action is permanent and the user will receive a notification.',
    },
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 7000, padding: 12 }}>
      <div
        className="modal-card admin-delete-modal-card"
        style={{
          width: '100%',
          maxWidth: 380,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          textAlign: 'center',
          borderColor: 'var(--danger-border)',
          boxSizing: 'border-box',
          margin: 'auto',
          overflow: 'hidden',
          borderRadius: 16,
        }}
      >
        {/* Step dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: s <= step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: s <= step ? 'var(--danger)' : 'var(--border)',
                transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingRight: 2,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: 22,
              color: 'var(--danger)',
              flexShrink: 0,
            }}
          >
            <i
              className={`ti ${
                step < 3 ? 'ti-trash' : 'ti-alert-triangle'
              }`}
            />
          </div>

          {/* Title */}
          <div
            className="academic-title"
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 6,
            }}
          >
            {STEPS[step - 1].title}
          </div>

          {/* Sub */}
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: 16,
              wordBreak: 'break-word',
            }}
          >
            {STEPS[step - 1].sub}
          </div>

          {/* Record info — step 1 */}
          {step === 1 && (
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: '10px 12px',
                marginBottom: 18,
                textAlign: 'left',
                wordBreak: 'break-word',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  fontSize: 12.5,
                  marginBottom: 3,
                }}
              >
                {record.university} — {record.examCategory}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                {record.date
                  ? new Date(record.date).toLocaleDateString('en-IN')
                  : ''}
                {record.block ? ` · ${record.block}` : ''}
                {record.room ? ` · Room ${record.room}` : ''}
              </div>
              {record.examDetails?.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    marginTop: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  {record.examDetails.map((d) => (
                    <span key={d.year} className="badge badge-purple" style={{ fontSize: 9.5 }}>
                      {d.year}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reason textarea — step 2 */}
          {step === 2 && (
            <div style={{ textAlign: 'left', marginBottom: 18 }}>
              <label
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--text-sub)',
                  display: 'block',
                  marginBottom: 5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
                placeholder="Enter reason for deletion..."
                style={{
                  width: '100%',
                  border: '1.5px solid var(--danger-border)',
                  borderRadius: 'var(--r-md)',
                  padding: '9px 11px',
                  fontSize: 12.5,
                  color: 'var(--text-main)',
                  background: 'var(--danger-light)',
                  fontFamily: "'Inter', sans-serif",
                  resize: 'none',
                  height: 75,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--danger)')}
                onBlur={(e) =>
                  (e.target.style.borderColor = 'var(--danger-border)')
                }
              />
            </div>
          )}

          {/* Reason review — step 3 */}
          {step === 3 && reason && (
            <div
              style={{
                background: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--r-md)',
                padding: '10px 12px',
                marginBottom: 18,
                textAlign: 'left',
                wordBreak: 'break-word',
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: 'var(--danger-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 3,
                }}
              >
                Reason:
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-main)' }}>
                {reason}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="modal-actions-row" style={{ display: 'flex', gap: 8, marginTop: 12, flexShrink: 0 }}>
          <button
            onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}
            disabled={loading}
            className="btn btn-outline"
            style={{ flex: 1, padding: '9px 0', fontSize: 12 }}
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={handleNext}
            disabled={loading || (step === 2 && !reason.trim())}
            className="btn btn-danger"
            style={{
              flex: 1.2,
              padding: '9px 0',
              fontSize: 12,
              opacity: loading || (step === 2 && !reason.trim()) ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <i
                  className={`ti ${
                    step === 3 ? 'ti-trash' : 'ti-arrow-right'
                  }`}
                  style={{ fontSize: 13 }}
                />
                {step === 1 ? 'Continue' : step === 2 ? 'Next' : 'Delete Now'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 520px) {
          .admin-delete-modal-card {
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