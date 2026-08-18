// src/pages/NotFound.jsx — 404 page

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     '#f8fafc',
      padding:        '20px 16px',
      flexDirection:  'column',
      textAlign:      'center',
    }}>
      <div style={{
        width:          80,
        height:         80,
        borderRadius:   '50%',
        background:     '#dbeafe',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       36,
        color:          '#2563eb',
        marginBottom:   20,
      }}>
        <i className="ti ti-error-404" />
      </div>

      <div style={{
        fontFamily:  "'Playfair Display', serif",
        fontStyle:   'italic',
        fontSize:    48,
        fontWeight:  700,
        color:       '#111827',
        lineHeight:  1,
        marginBottom: 8,
      }}>
        404
      </div>

      <div style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        Page Not Found
      </div>

      <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 28 }}>
        The page you are looking for does not exist.
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          padding:      '10px 24px',
          background:   '#2563eb',
          color:        '#fff',
          border:       'none',
          borderRadius: 10,
          fontSize:     13,
          fontWeight:   600,
          cursor:       'pointer',
          display:      'flex',
          alignItems:   'center',
          gap:          7,
          boxShadow:    '0 4px 12px rgba(37,99,235,.3)',
        }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 15 }} />
        Go Back
      </button>
    </div>
  );
}
