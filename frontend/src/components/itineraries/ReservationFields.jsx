import React from 'react';
import CustomDatePicker from '../common/CustomDatePicker';

// --- Transporte ---
const TransportFields = ({ formData, handleChange, destination }) => (
  <>
    <div className="form-group">
      <label>Fecha de Salida</label>
      <CustomDatePicker
        type="date"
        name="departureDate"
        value={formData.departureDate || ''}
        onChange={handleChange}
        min={destination.startDate}
        max={destination.endDate}
      />
    </div>
    <div className="form-row">
      <div className="form-group">
        <label>Origen</label>
        <input
          type="text"
          name="origin"
          value={formData.origin || ''}
          onChange={handleChange}
          placeholder="Ciudad o aeropuerto"
        />
      </div>
      <div className="form-group">
        <label>Destino</label>
        <input
          type="text"
          name="destination"
          value={formData.destination || ''}
          onChange={handleChange}
        />
      </div>
    </div>
    <div className="form-group">
      <label>Precio (Opcional)</label>
      <input
        type="number"
        name="price"
        value={formData.price || ''}
        onChange={handleChange}
        placeholder="Ej: 230"
      />
    </div>
  </>
);

// --- Alojamiento ---
const AccommodationFields = ({ formData, handleChange, destination }) => {
  const minCheckoutDate = formData.checkInDate
    ? new Date(new Date(formData.checkInDate).getTime() + 86400000)
        .toISOString()
        .split('T')[0]
    : '';

  return (
    <>
      <div className="form-group">
        <label>Dirección (Opcional)</label>
        <input
          type="text"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Fecha de Check-in</label>
        <CustomDatePicker
          type="date"
          name="checkInDate"
          value={formData.checkInDate || ''}
          onChange={handleChange}
          min={destination.startDate}
          max={destination.endDate}
        />
      </div>
      <div className="form-group">
        <label>Fecha de Check-out</label>
        <CustomDatePicker
          type="date"
          name="checkOutDate"
          value={formData.checkOutDate || ''}
          onChange={handleChange}
          min={minCheckoutDate}
          max={destination.endDate}
          disabled={!formData.checkInDate}
        />
      </div>
    </>
  );
};

// --- Entradas (NUEVO) ---
const TicketFields = ({ formData, handleChange }) => (
  <div className="form-group">
    <label>Ubicación / Dirección (Opcional)</label>
    <input
      type="text"
      name="location"
      value={formData.location || ''}
      onChange={handleChange}
      placeholder="Ej: Museo del Louvre"
    />
  </div>
);


// --- Componente Principal ---
function ReservationFields({ category, formData, handleChange, destination }) {
  if (!category) return null;

  switch (category) {
    case 'Transporte':
      return <TransportFields formData={formData} handleChange={handleChange} destination={destination} />;
    case 'Alojamiento':
      return <AccommodationFields formData={formData} handleChange={handleChange} destination={destination} />;
    // CAMBIO: Se añade el caso para 'Entradas'
    case 'Entradas':
      return <TicketFields formData={formData} handleChange={handleChange} />;
    default:
      return null;
  }
}

export default ReservationFields;