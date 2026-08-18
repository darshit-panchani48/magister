// src/components/admin/MessageModal.jsx — Handles dynamic endpoint based on sendEmail flag

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function MessageModal({ user, relatedRecord = null, sendEmail = true, onClose }) {
  const [subject, setSubject] = useState('Correction Required');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const userId = user?._id || user?.id;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    if (!userId) {
      toast.error('Invalid user');
      return;
    }

    setLoading(true);
    try {
      // 🌟 Choose endpoint dynamically: /messages (with email) or /messages/app-only (no email)
      const endpoint = sendEmail ? '/messages' : '/messages/app-only';

      await api.post(endpoint, {
        to: userId,
        subject: subject.trim() || 'Message from Admin',
        message: message.trim(),
        relatedRecord: relatedRecord?._id || undefined,
      });
      
      toast.success(sendEmail ? 'Message & Email sent successfully ✉️' : 'In-App notification sent successfully 🔔');
      onClose();
    } catch (err) {
      console.error('sendMessage error:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to send message');
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
    <div className="modal-overlay" style={{ zIndex: 6000, padding: 12 }}>
      <div
        className="modal-card message-modal-card"
        style={{
          width: '100%',
          maxWidth: 420,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          margin: 'auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderRadius: 16,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-outline"
          style={{
            position: 'absolute',
            top: 13,
            right: 13,
            width: 28,
            height: 28,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <i className="ti ti-x" />
        </button>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
            paddingRight: 45,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <i className="ti ti-message-circle" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              className="academic-title"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {sendEmail ? 'Send Message & Email' : 'Send In-App Notification'}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              To: {user?.name || user?.appId || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '16px 20px 20px',
          }}
        >
          <form onSubmit={handleSend}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>To</label>
              <div
                style={{
                  ...inp,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                  cursor: 'default',
                  wordBreak: 'break-all',
                }}
              >
                <i className="ti ti-user" style={{ color: 'var(--text-placeholder)', fontSize: 14, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || user?.appId}
                  {user?.appId && user?.name ? ` (${user.appId})` : ''}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Subject</label>
              <input
                style={inp}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                disabled={loading}
              />
            </div>

            {relatedRecord && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 11.5,
                  color: 'var(--primary-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  wordBreak: 'break-word',
                }}
              >
                <i className="ti ti-link" style={{ fontSize: 13, flexShrink: 0 }} />
                <span>
                  Related: <strong>{relatedRecord.university} — {relatedRecord.examCategory}</strong>
                </span>
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message or correction here..."
                disabled={loading}
                rows={4}
                style={{ ...inp, resize: 'none', minHeight: 90 }}
              />
            </div>

            <div className="modal-actions-row" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
                disabled={loading || !message.trim()}
                className="btn btn-primary"
                style={{ flex: 1.5, padding: '10px 0', fontSize: 12.5 }}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <i className="ti ti-send" style={{ fontSize: 14 }} /> Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 520px) {
          .message-modal-card {
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