// src/services/api.js — FIXED: sessionStorage for tab isolation

import axios from 'axios';

const api = axios.create({
  baseURL:        import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout:        15000,
  headers:        { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach token from sessionStorage (tab-specific)
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('magister_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('magister_token');
      sessionStorage.removeItem('magister_role');
      delete api.defaults.headers.common['Authorization'];
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
