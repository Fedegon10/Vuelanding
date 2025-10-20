import React from 'react';
import './AccommodationCard.css';
// CAMBIO: Se importa el ícono 'Navigation' de lucide-react
import { BedDouble, Calendar, Moon, Paperclip, Pencil, Trash2, MapPin, Navigation } from 'lucide-react';

const calculateNights = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate) || endDate <= startDate) return 0;
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

function AccommodationCard({ accommodation, file, onEdit, onDelete }) {
  if (!accommodation || !accommodation.id) return null;

  const { title, name, address, checkInDate, checkOutDate } = accommodation;
  const displayName = name || title || 'Alojamiento';
  const nights = calculateNights(checkInDate, checkOutDate);

  const formattedCheckIn =
    checkInDate &&
    new Date(checkInDate + 'T00:00:00').toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });

  const formattedCheckOut =
    checkOutDate &&
    new Date(checkOutDate + 'T00:00:00').toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });

  // CAMBIO: Se crea la URL para Google Maps, codificando la dirección para que funcione correctamente.
  const googleMapsUrl = address 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : '';

  return (
    <div className="accommodation-card">
      {/* --- IZQUIERDA: INFORMACIÓN PRINCIPAL --- */}
      <div className="hotel-info">
        <div className="hotel-icon">
          <BedDouble size={42} />
        </div>
        <div className="hotel-details">
          <h4 className="hotel-name">{displayName}</h4>
          {address && (
            <p className="hotel-address">
              <MapPin size={14} /> {address}
            </p>
          )}
        </div>
      </div>

      {/* --- CENTRO: FECHAS Y NOCHES --- */}
      <div className="stay-info">
        <div className="stay-dates">
          <span>
            <Calendar size={14} /> <strong>Check-in:</strong> {formattedCheckIn || '--'}
          </span>
          <span>
            <Moon size={14} /> <strong>Check-out:</strong> {formattedCheckOut || '--'}
          </span>
        </div>
        <div className="stay-nights">
          <span className="nights-count">{nights}</span>
          <span className="nights-label">{nights === 1 ? 'Noche' : 'Noches'}</span>
        </div>
      </div>

      {/* --- DERECHA: ACCIONES --- */}
      <div className="hotel-actions">
        {file && (
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn-icon" title={file.name}>
            <Paperclip size={16} />
          </a>
        )}
        
        {/* CAMBIO: Se añade el nuevo botón. Solo aparece si existe una dirección. */}
        {address && (
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Ver en Google Maps">
            <Navigation size={16} />
          </a>
        )}

        <button onClick={onEdit} className="btn-icon" title="Editar">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} className="btn-icon btn-delete" title="Eliminar">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default AccommodationCard;