import React from "react";
import "./TransportCard.css";
import {
  Plane,
  Train,
  Car,
  Paperclip,
  Pencil,
  Trash2,
  Clock,
  Calendar,
} from "lucide-react";

const ICONS = {
  flight: <Plane size={20} />,
  train: <Train size={20} />,
  road: <Car size={20} />,
  other: <Plane size={20} />,
};

function TransportCard({ transport, file, onEdit, onDelete }) {
  if (!transport || !transport.id) return null;

  const {
    title,
    date,
    startTime,
    departureDate,
    departureTime,
    origin,
    destination,
    type,
    price,
  } = transport;

  const displayDate = departureDate || date;
  const displayTime = departureTime || startTime;
  const displayOrigin = origin || "Origen";
  const displayDestination = destination || "Destino";
  const displayType = type?.toLowerCase() || "flight";

  const formattedDate =
    displayDate &&
    new Date(displayDate + "T00:00:00").toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const formattedPrice =
    price !== undefined
      ? new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(price)
      : "—";

  return (
    <div className={`transport-card type-${displayType}`}>
      {/* --- SECCIÓN IZQUIERDA: DATOS DEL VUELO --- */}
      <div className="ticket-left">
        <div className="ticket-header">
          <span className="transport-icon">
            {ICONS[displayType] || ICONS.other}
          </span>
          <span className="transport-type">
            {displayType.charAt(0).toUpperCase() + displayType.slice(1)}
          </span>
        </div>

        <div className="journey">
          <div className="journey-loc">
            <span className="journey-code">
              {displayOrigin.substring(0, 3).toUpperCase()}
            </span>
            <span className="journey-city">{displayOrigin}</span>
          </div>

          <div className="journey-sep">
            <div className="line"></div>
            <Plane size={16} className="sep-icon" />
            <div className="line"></div>
          </div>

          <div className="journey-loc">
            <span className="journey-code">
              {displayDestination.substring(0, 3).toUpperCase()}
            </span>
            <span className="journey-city">{displayDestination}</span>
          </div>
        </div>

        <div className="ticket-info">
          <div className="info-item">
            <Calendar size={14} /> {formattedDate || "Sin fecha"}
          </div>
          <div className="info-item">
            <Clock size={14} /> {displayTime || "--:--"}
          </div>
          <div className="info-item price">{formattedPrice}</div>
        </div>
      </div>

      {/* --- SEPARADOR CENTRAL (línea de corte) --- */}
      <div className="ticket-divider">
        <div className="circle top"></div>
        <div className="circle bottom"></div>
      </div>

      {/* --- SECCIÓN DERECHA: ACCIONES --- */}
      <div className="ticket-right">
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
        <button onClick={onEdit} className="btn-icon" title="Editar">
          <Pencil size={16} />
        </button>
        <button
          onClick={onDelete}
          className="btn-icon btn-delete"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default TransportCard;
