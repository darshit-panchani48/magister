// src/components/common/NotificationsPanel.jsx — Universal Mark Read for All Sections

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NOTIF_CFG = {
  RECORD_ADDED:           { icon: 'ti-plus',    bg: 'var(--primary-light)',  color: 'var(--primary-text)', tag: 'Added' },
  RECORD_UPDATED:         { icon: 'ti-edit',    bg: 'var(--warning-light)',  color: 'var(--warning-text)', tag: 'Updated' },
  RECORD_DELETED_BY_USER: { icon: 'ti-trash',   bg: 'var(--danger-light)',   color: 'var(--danger-text)',  tag: 'Deleted' },
  RECORD_DELETED_BY_ADMIN:{ icon: 'ti-trash-x', bg: 'var(--danger-light)',   color: 'var(--danger-text)',  tag: 'Deleted' },
  ADMIN_MESSAGE:          { icon: 'ti-message', bg: 'var(--pro-light)',      color: 'var(--pro-text)',     tag: 'Message' },
  PASSWORD_RESET:         { icon: 'ti-lock',    bg: 'var(--success-light)',  color: 'var(--success-text)', tag: 'Security' },
};

const TABS = ['All', 'Unread', 'Messages'];

/* Delete Confirm Modal */
const DeleteConfirm = ({ count, onConfirm, onClose, deleting }) => (
  <div className="modal-overlay" style={{ zIndex: 7000 }}>
    <div
      className="modal-card"
      style={{
        maxWidth: 320,
        padding: '24px 20px',
        textAlign: 'center',
        width: '90%'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--danger-light)',
          border: '1px solid var(--danger-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: 20,
          color: 'var(--danger)',
        }}
      >
        <i className="ti ti-trash" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
        Delete Notifications?
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 18 }}>
        {count === 'all'
          ? 'Delete all notifications? This cannot be undone.'
          : `Delete ${count} selected notification${count > 1 ? 's' : ''}?`}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, padding: '9px 0', fontSize: 12 }}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="btn btn-danger"
          style={{ flex: 1, padding: '9px 0', fontSize: 12 }}
        >
          {deleting ? (
            <span className="spinner" />
          ) : (
            <>
              <i className="ti ti-trash" style={{ fontSize: 13 }} /> Delete
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default function NotificationsPanel({ onClose }) {
  const {
    notifications,
    messages,
    unreadCount,
    msgUnreadCount,
    markAsRead,
    markAllAsRead,
    markMessageRead,
    fetchNotifications,
    fetchMessages,
  } = useNotifications();

  const [tab, setTab] = useState('All');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [showDel, setShowDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const listMap = {
    All: notifications,
    Unread: notifications.filter((n) => !n.isRead),
    Messages: messages,
  };
  const current = listMap[tab] || [];

  // Total unread items across all sections to control "Mark read" button visibility
  const totalUnreadAll = unreadCount + msgUnreadCount;

  // 🌟 Universal Mark All Read function for Notifications & Messages simultaneously
  const handleMarkAllRead = async () => {
    try {
      // 1. Mark all notifications as read
      if (unreadCount > 0) {
        await markAllAsRead();
      }
      // 2. Mark all unread messages as read
      const unreadMsgs = messages.filter((m) => !m.isRead);
      if (unreadMsgs.length > 0) {
        await Promise.all(unreadMsgs.map((m) => api.put(`/messages/${m._id}/read`)));
        fetchMessages?.();
      }
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === current.length) setSelected(new Set());
    else setSelected(new Set(current.map((n) => n._id)));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const ids = [...selected];
      if (tab === 'Messages') {
        await Promise.all(ids.map((id) => api.put(`/messages/${id}/read`)));
        toast.success('Messages cleared');
        fetchMessages?.();
      } else {
        await Promise.all(ids.map((id) => api.delete(`/notifications/${id}`)));
        toast.success(`${ids.length} notification${ids.length > 1 ? 's' : ''} deleted`);
        fetchNotifications?.();
      }
      setShowDel(false);
      exitSelectMode();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleTab = (t) => {
    setTab(t);
    exitSelectMode();
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 6000,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
        onClick={onClose}
      >
        <div
          className="notif-drawer-container"
          style={{
            width: '100%',
            maxWidth: 400,
            background: 'var(--bg-card)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-modal)',
            animation: 'slideIn .3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxSizing: 'border-box'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px 12px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {selectMode ? `${selected.size} selected` : 'Notifications'}
              </div>
              {!selectMode && totalUnreadAll > 0 && (
                <span className="badge badge-red" style={{ fontSize: 10, padding: '2px 6px' }}>
                  {totalUnreadAll}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              {selectMode ? (
                <>
                  <button onClick={toggleAll} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 10 }}>
                    {selected.size === current.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selected.size > 0 && (
                    <button onClick={() => setShowDel(true)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 10 }}>
                      <i className="ti ti-trash" style={{ fontSize: 11 }} /> Delete
                    </button>
                  )}
                  <button onClick={exitSelectMode} className="btn btn-outline" style={{ width: 28, height: 28, padding: 0 }}>
                    <i className="ti ti-x" />
                  </button>
                </>
              ) : (
                <>
                  {current.length > 0 && (
                    <button onClick={() => setSelectMode(true)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 10 }}>
                      <i className="ti ti-checkbox" style={{ fontSize: 11 }} /> Select
                    </button>
                  )}
                  {totalUnreadAll > 0 && (
                    <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 10, color: 'var(--primary)' }}>
                      Mark read
                    </button>
                  )}
                  <button onClick={onClose} className="btn btn-outline" style={{ width: 28, height: 28, padding: 0 }}>
                    <i className="ti ti-x" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
              overflowX: 'auto'
            }}
          >
            {TABS.map((t) => {
              const cnt =
                t === 'All'
                  ? unreadCount
                  : t === 'Unread'
                  ? notifications.filter((n) => !n.isRead).length
                  : msgUnreadCount;
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => handleTab(t)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--r-md)',
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1.5px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                    background: active ? 'var(--primary-light)' : 'var(--bg-input)',
                    color: active ? 'var(--primary-text)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t}
                  {cnt > 0 && (
                    <span
                      style={{
                        background: active ? 'var(--primary)' : 'var(--text-muted)',
                        color: '#fff',
                        fontSize: 8.5,
                        minWidth: 15,
                        height: 15,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                      }}
                    >
                      {cnt}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {current.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 16px', color: 'var(--text-muted)' }}>
                <i
                  className={`ti ${tab === 'Messages' ? 'ti-mail-off' : 'ti-bell-off'}`}
                  style={{ fontSize: 42, opacity: 0.25, display: 'block', marginBottom: 12 }}
                />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 4 }}>
                  {tab === 'Unread' ? 'All caught up!' : 'Nothing here yet'}
                </div>
                <div style={{ fontSize: 12 }}>Activity will appear here</div>
              </div>
            ) : tab === 'Messages' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.map((msg) => (
                  <div key={msg._id} style={{ position: 'relative' }}>
                    {selectMode && (
                      <div
                        onClick={() => toggleSelect(msg._id)}
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 10,
                          zIndex: 2,
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          border: `2px solid ${selected.has(msg._id) ? 'var(--primary)' : 'var(--border)'}`,
                          background: selected.has(msg._id) ? 'var(--primary)' : 'var(--bg-card)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {selected.has(msg._id) && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
                      </div>
                    )}
                    <div
                      onClick={() => !selectMode && !msg.isRead && markMessageRead(msg._id)}
                      style={{
                        padding: 12,
                        background: 'var(--bg-card)',
                        border: `1px solid ${!msg.isRead ? 'var(--pro-border)' : 'var(--border)'}`,
                        borderLeft: !msg.isRead ? '3px solid var(--pro)' : '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        cursor: selectMode ? 'default' : 'pointer',
                        paddingLeft: selectMode ? 36 : 12,
                        opacity: selected.has(msg._id) ? 0.7 : 1,
                        transition: 'opacity .15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'var(--pro-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              color: 'var(--pro)',
                              flexShrink: 0
                            }}
                          >
                            <i className="ti ti-shield" />
                          </div>
                          Admin
                          {!msg.isRead && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pro)', display: 'inline-block' }} />}
                        </div>
                        <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 4 }}>
                        {msg.subject}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                          background: 'var(--bg-input)',
                          padding: '8px 10px',
                          borderRadius: 'var(--r-sm)',
                          borderLeft: '2px solid var(--pro)',
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.map((n) => {
                  const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.RECORD_ADDED;
                  const isSel = selected.has(n._id);
                  return (
                    <div key={n._id} style={{ position: 'relative' }}>
                      {selectMode && (
                        <div
                          onClick={() => toggleSelect(n._id)}
                          style={{
                            position: 'absolute',
                            top: 12,
                            left: 10,
                            zIndex: 2,
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            border: `2px solid ${isSel ? 'var(--danger)' : 'var(--border)'}`,
                            background: isSel ? 'var(--danger)' : 'var(--bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {isSel && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
                        </div>
                      )}
                      <div
                        onClick={() => !selectMode && !n.isRead && markAsRead(n._id)}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-start',
                          padding: 12,
                          paddingLeft: selectMode ? 36 : 12,
                          background: !n.isRead ? 'var(--bg-input)' : 'var(--bg-card)',
                          border: `1px solid ${!n.isRead ? 'var(--primary-border)' : 'var(--border)'}`,
                          borderLeft: !n.isRead ? '3px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: 'var(--r-md)',
                          cursor: selectMode ? 'default' : 'pointer',
                          opacity: isSel ? 0.7 : 1,
                          transition: 'opacity .15s',
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--r-sm)',
                            background: cfg.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            flexShrink: 0,
                          }}
                        >
                          <i className={`ti ${cfg.icon}`} style={{ color: cfg.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                            {n.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--text-muted)',
                              lineHeight: 1.4,
                              marginBottom: 4,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-word'
                            }}
                          >
                            {n.message}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: 'var(--text-muted)' }}>
                            <span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 8.5, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                              {cfg.tag}
                            </span>
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        {!n.isRead && !selectMode && (
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: 10.5,
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            Magister Notification Center · ASSC
          </div>
        </div>
      </div>

      {showDel && (
        <DeleteConfirm
          count={selected.size}
          onConfirm={handleDelete}
          onClose={() => setShowDel(false)}
          deleting={deleting}
        />
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (max-width: 480px) {
          .notif-drawer-container {
            max-width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}