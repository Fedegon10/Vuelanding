import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDestinations } from "../context/DestinationsContext";
import ImagePickerModal from "../components/common/ImagePickerModal.jsx";
import "./ReservationsPage.css";

// --- Iconos para el nuevo diseño ---
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

// =========================================================
//  COMPONENTE DE TARJETA
// =========================================================
function DestinationCard({ dest, onImageChangeClick }) {
  const formatDateRange = (start, end) => {
    if (!start || !end) return "Fechas no definidas";
    const options = { month: "short", day: "numeric" };
    const startDate = new Date(start + "T00:00:00").toLocaleDateString(
      "es-ES",
      options
    );
    const endDate = new Date(end + "T00:00:00").toLocaleDateString(
      "es-ES",
      options
    );
    return `${startDate} - ${endDate}`;
  };

  const formatCountry = (country) => {
    if (!country) return "País";
    if (typeof country === "string") return country;
    return (
      country?.translations?.spa?.common || country?.name?.common || "País"
    );
  };

  return (
    <Link to={`/reservas/${dest.id}`} className="reservation-card">
      <div className="reservation-card__image-container">
        <div
          className="reservation-card__image"
          style={{
            backgroundImage: `url(${
              dest.destinationImageUrl ||
              "https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1887&auto=format&fit=crop"
            })`,
          }}
        ></div>
        <button
          className="reservation-card__change-image-btn"
          title="Cambiar imagen"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageChangeClick(dest);
          }}
        >
          <CameraIcon />
        </button>
      </div>
      <div className="reservation-card__content">
        <div className="reservation-card__header">
          {dest.countryCode && (
            <img
              className="reservation-card__flag"
              src={`https://flagcdn.com/w40/${dest.countryCode.toLowerCase()}.png`}
              alt={`Bandera de ${formatCountry(dest.country)}`}
            />
          )}
          <div className="reservation-card__location">
            <h4>{dest.city}</h4>
            <span>{formatCountry(dest.country)}</span>
          </div>
        </div>
        <div className="reservation-card__footer">
          <div className="reservation-card__dates">
            <CalendarIcon />
            <span>{formatDateRange(dest.startDate, dest.endDate)}</span>
          </div>
          <div className="reservation-card__arrow">
            <ArrowRightIcon />
          </div>
        </div>
      </div>
    </Link>
  );
}

// =========================================================
//  PÁGINA DE RESERVAS
// =========================================================
function ReservationsPage() {
  const { destinations, loading, updateDestination } = useDestinations();
  const [viewMode, setViewMode] = useState("grid");

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);

  const sortedDestinations = useMemo(() => {
    if (!destinations) return [];
    return [...destinations].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }, [destinations]);

  const handleImageChangeClick = (dest) => {
    setSelectedDest(dest);
    setIsPickerOpen(true);
  };

  const handleImageSelect = async (newUrl) => {
    if (!selectedDest) return;
    await updateDestination(selectedDest.id, { destinationImageUrl: newUrl });
    setIsPickerOpen(false);
    setSelectedDest(null);
  };

  const formatCountry = (country) => {
    if (!country) return "País";
    if (typeof country === "string") return country;
    return (
      country?.translations?.spa?.common || country?.name?.common || "País"
    );
  };

  // --- Vista de Carga (Skeleton) ---
  if (loading) {
    return (
      <div className="page-container reservations-page">
        <header className="page-header reservations-header">
          <div>
            <h1>Gestión de Reservas</h1>
            <p>
              Selecciona un viaje para ver sus detalles o revisa el calendario
              global.
            </p>
          </div>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${
                viewMode === "grid" ? "active" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              Tarjetas
            </button>
            <button
              className={`view-toggle-btn ${
                viewMode === "list" ? "active" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              Lista
            </button>
          </div>
        </header>
        <div className="destination-cards-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-reservation-card"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container reservations-page">
      <header className="page-header reservations-header">
        <div>
          <h1>Gestión de Reservas</h1>
          <p>
            Selecciona un viaje para ver sus detalles o revisa el calendario
            global.
          </p>
        </div>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            Tarjetas
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            Lista
          </button>
        </div>
      </header>

      {/* --- Vista de tarjetas o lista --- */}
      {sortedDestinations && sortedDestinations.length > 0 ? (
        viewMode === "grid" ? (
          <div className="destination-cards-grid">
            {sortedDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                dest={dest}
                onImageChangeClick={handleImageChangeClick}
              />
            ))}
          </div>
        ) : (
          <ul className="destination-list-compact">
            {sortedDestinations.map((dest) => (
              <li key={dest.id}>
                <Link to={`/reservas/${dest.id}`} className="compact-item-link">
                  <div className="compact-item__flag">
                    {dest.countryCode && (
                      <img
                        src={`https://flagcdn.com/w40/${dest.countryCode.toLowerCase()}.png`}
                        alt={`Bandera de ${formatCountry(dest.country)}`}
                      />
                    )}
                  </div>
                  <div className="compact-item__details">
                    <span className="compact-item__city">{dest.city}</span>
                    <span className="compact-item__country">
                      {formatCountry(dest.country)}
                    </span>
                  </div>
                  <div className="compact-item__arrow">›</div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="card no-destinations-message">
          <p>Aún no tienes destinos con reservas registradas.</p>
        </div>
      )}

      <hr className="section-divider" />

      {/* =========================================================
          NUEVO CALENDARIO VISUAL DE VIAJES
          ========================================================= */}
      <div className="schedule-section redesigned-calendar">
        <h2>Calendario de Viajes</h2>
        {sortedDestinations && sortedDestinations.length > 0 ? (
          <div className="calendar-grid">
            {sortedDestinations.map((dest, i) => (
              <div key={dest.id} className="calendar-event">
                <div className="calendar-event-header">
                  <div className="calendar-flag">
                    {dest.countryCode && (
                      <img
                        src={`https://flagcdn.com/w40/${dest.countryCode.toLowerCase()}.png`}
                        alt={formatCountry(dest.country)}
                      />
                    )}
                    <span className="calendar-city">{dest.city}</span>
                  </div>
                  <span className="calendar-date-range">
                    {new Date(dest.startDate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    →{" "}
                    {new Date(dest.endDate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="calendar-event-bar">
                  <div
                    className="calendar-bar"
                    style={{
                      width: "100%",
                      backgroundImage:
                        "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                    }}
                  />
                </div>

                <div className="calendar-event-footer">
                  <div className="calendar-duration">
                    {Math.max(
                      1,
                      (new Date(dest.endDate) - new Date(dest.startDate)) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    días
                  </div>
                  <Link
                    to={`/reservas/${dest.id}`}
                    className="calendar-detail-link"
                  >
                    Ver detalles →
                  </Link>
                </div>

                {i !== sortedDestinations.length - 1 && (
                  <div className="calendar-connector"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card no-destinations-message">
            <p>Añadí destinos para visualizar tu calendario de viajes.</p>
          </div>
        )}
      </div>

      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleImageSelect}
        city={selectedDest?.city}
        country={selectedDest?.country}
      />
    </div>
  );
}

export default ReservationsPage;
