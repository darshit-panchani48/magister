// src/components/user/DeleteConfirmModal.jsx — Responsive & Scrollable 2-Step User Delete Modal

import React, { useState, useEffect } from 'react';

export default function DeleteConfirmModal({
  recordName,
  onConfirm,
  onClose,
  loading,
}) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 6000, padding: 12, overflowY: 'auto' }}>
      <div
        className="modal-card user-delete-modal-card"
        style={{
          width: '100%',
          maxWidth: 380,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative',
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
          {[1, 2].map((s) => (
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
          {/* Header Alert Icon */}
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
            <i className="ti ti-trash" />
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
            {step === 1 ? 'Delete Record?' : 'Provide Reason'}
          </div>

          {/* Message */}
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: 16,
              wordBreak: 'break-word',
            }}
          >
            {step === 1 ? (
              <>
                You are about to delete:
                <br />
                <strong style={{ color: 'var(--text-sub)' }}>{recordName}</strong>
                <br />
                <br />
                This action cannot be undone. Admin will be notified.
              </>
            ) : (
              'Please provide a reason for deletion.'
            )}
          </div>

          {/* Reason textarea */}
          {step === 2 && (
            <div style={{ textAlign: 'left', marginBottom: 16 }}>
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
                placeholder="Enter reason here..."
                style={{
                  width: '100%',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '9px 11px',
                  fontSize: 12.5,
                  color: 'var(--text-main)',
                  background: 'var(--bg-input)',
                  fontFamily: "'Inter', sans-serif",
                  resize: 'none',
                  height: 75,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--danger)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="modal-actions-row" style={{ display: 'flex', gap: 8, marginTop: 12, flexShrink: 0 }}>
          <button
            onClick={step === 2 ? () => setStep(1) : onClose}
            disabled={loading}
            className="btn btn-outline"
            style={{ flex: 1, padding: '9px 0', fontSize: 12 }}
          >
            {step === 2 ? '← Back' : 'Cancel'}
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
                <i className="ti ti-trash" style={{ fontSize: 13 }} />
                {step === 1 ? 'Yes, Delete' : 'Confirm Delete'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 520px) {
          .user-delete-modal-card {
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