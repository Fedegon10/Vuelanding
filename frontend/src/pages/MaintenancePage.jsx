// src/pages/MaintenancePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function MaintenancePage({ section = 'esta sección' }) {
  return (
    <div className="page-container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>Estamos trabajando en {section}</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          Estamos realizando mejoras. Volvé más tarde.
        </p>
        <div style={{ marginTop: '1.25rem' }}>
          <Link className="btn-primary" to="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
