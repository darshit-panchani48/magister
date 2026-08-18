// src/routes/PrivateRoute.jsx — FIXED: strict login redirect

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Not logged in → always go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin trying to access user route → redirect to admin
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PrivateRoute;
