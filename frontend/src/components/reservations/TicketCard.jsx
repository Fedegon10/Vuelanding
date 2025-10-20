import React from 'react';
import './TicketCard.css';
// CAMBIO: Se importa el ícono 'Navigation' de lucide-react
import { Ticket, Calendar, MapPin, Clock, Paperclip, Pencil, Trash2, Navigation } from 'lucide-react';

function TicketCard({ ticket, file, onEdit, onDelete }) {
  if (!ticket) return null;

  const { title, date, startTime, location } = ticket;

  const formattedDate =
    date &&
    new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  // CAMBIO: Se crea la URL para Google Maps a partir de la ubicación.
  const googleMapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : '';

  return (
    <div className="ticket-card">
      {/* --- IZQUIERDA: INFORMACIÓN PRINCIPAL --- */}
      <div className="ticket-info">
        <div className="ticket-icon">
          <Ticket size={40} />
        </div>
        <div className="ticket-details">
          <h4 className="ticket-title">{title || 'Entrada'}</h4>
          <div className="ticket-meta">
            {formattedDate && (
              <span className="meta-item">
                <Calendar size={14} /> {formattedDate}
              </span>
            )}
            {startTime && (
              <span className="meta-item">
                <Clock size={14} /> {startTime}
              </span>
            )}
            {location && (
              <span className="meta-item">
                <MapPin size={14} /> {location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- DERECHA: ACCIONES --- */}
      <div className="ticket-actions">
        {file && (
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon"
            title={file.name}
          >
            <Paperclip size={16} />
          </a>
        )}
        
        {/* CAMBIO: Se añade el nuevo botón de Google Maps, que solo aparece si hay una ubicación. */}
        {location && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon"
            title="Ver en Google Maps"
          >
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

export default TicketCard;