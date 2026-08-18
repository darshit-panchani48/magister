import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [msgUnreadCount, setMsgUnreadCount] = useState(0);
  const pollRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, [isAuthenticated]);

  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated || role === 'admin') return;
    try {
      const { data } = await api.get('/messages');
      if (data.success) {
        setMessages(data.messages || []);
        setMsgUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    fetchMessages();
    pollRef.current = setInterval(() => {
      fetchNotifications();
      fetchMessages();
    }, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, fetchNotifications, fetchMessages]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put('/notifications/' + id + '/read');
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const markMessageRead = useCallback(async (id) => {
    try {
      await api.put('/messages/' + id + '/read');
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
      setMsgUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const refreshMessages = useCallback(() => {
    fetchMessages();
    fetchNotifications();
  }, [fetchMessages, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        messages,
        msgUnreadCount,
        fetchNotifications,
        fetchMessages,
        markAsRead,
        markAllAsRead,
        markMessageRead,
        refreshMessages,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      'useNotifications must be inside NotificationProvider'
    );
  return ctx;
};

export default NotificationContext;