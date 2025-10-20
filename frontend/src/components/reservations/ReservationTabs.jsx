import React from 'react';
import './Reservations.css';

function ReservationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="reservation-tabs">
      <button 
        className={`tab-btn ${activeTab === 'transport' ? 'active' : ''}`}
        onClick={() => setActiveTab('transport')}
      >
        ✈️ Transporte
      </button>
      <button 
        className={`tab-btn ${activeTab === 'accommodation' ? 'active' : ''}`}
        onClick={() => setActiveTab('accommodation')}
      >
        🏨 Alojamiento
      </button>
    </div>
  );
}

export default ReservationTabs;