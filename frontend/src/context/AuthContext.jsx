// src/context/AuthContext.jsx — FIXED: tab isolation, strict login redirect

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

// Each tab gets unique session key to prevent cross-tab contamination
const TAB_KEY = `magister_tab_${Math.random().toString(36).slice(2, 9)}`;
const TOKEN_KEY = 'magister_token';
const ROLE_KEY = 'magister_role';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  // Verify token on app load — use sessionStorage for tab isolation
  useEffect(() => {
    const verify = async () => {
      // sessionStorage is tab-specific — prevents cross-tab contamination
      const token = sessionStorage.getItem(TOKEN_KEY);
      const savedRole = sessionStorage.getItem(ROLE_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          setRole(data.role || savedRole);
          setIsAuthenticated(true);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [clearAuth]);

  const login = useCallback(async (appId, password, selectedRole) => {
    const { data } = await api.post('/auth/login', {
      appId: appId.trim().toUpperCase(),
      password,
      role: selectedRole,
    });

    if (data.success) {
      // Use sessionStorage — tab-specific, not shared across tabs
      sessionStorage.setItem(TOKEN_KEY, data.token);
      sessionStorage.setItem(ROLE_KEY, selectedRole);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      setRole(selectedRole);
      setIsAuthenticated(true);
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  const updateUser = useCallback((fields) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : prev));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-page)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin .7s linear infinite',
              margin: '0 auto 14px',
            }}
          />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Loading...
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export default AuthContext;