// src/App.jsx — Main app with all routes and providers

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider }         from './context/AuthContext';
import { ThemeProvider }        from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import PrivateRoute from './routes/PrivateRoute';
import AdminRoute   from './routes/AdminRoute';

import SplashScreen   from './pages/SplashScreen';
import LoginPage      from './pages/LoginPage';
import UserDashboard  from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound       from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>

          {/* Global Toast */}
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: "'Inter', sans-serif",
                fontSize:   13,
                fontWeight: 500,
                borderRadius: 12,
                padding:    '12px 16px',
                boxShadow:  '0 8px 24px rgba(0,0,0,.1)',
              },
              success: {
                style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
                iconTheme: { primary: '#16a34a', secondary: '#fff' },
              },
              error: {
                style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
                iconTheme: { primary: '#dc2626', secondary: '#fff' },
              },
              loading: {
                style: { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' },
              },
            }}
          />

          <Routes>
            {/* Splash */}
            <Route path="/"         element={<SplashScreen />} />

            {/* Auth */}
            <Route path="/login"    element={<LoginPage />} />

            {/* User */}
            <Route path="/dashboard" element={
              <PrivateRoute><UserDashboard /></PrivateRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />

            {/* 404 */}
            <Route path="/404"  element={<NotFound />} />
            <Route path="*"     element={<Navigate to="/404" replace />} />
          </Routes>

        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
