import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDestinations } from "../../context/DestinationsContext";
import ImagePickerModal from "../common/ImagePickerModal";
import SwipeableListItem from "../common/SwipeableListItem";
import "../common/Loader.css";

// --- Iconos ---
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
    {" "}
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>{" "}
    <line x1="16" y1="2" x2="16" y2="6"></line>{" "}
    <line x1="8" y1="2" x2="8" y2="6"></line>{" "}
    <line x1="3" y1="10" x2="21" y2="10"></line>{" "}
  </svg>
);
const ActionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    {" "}
    <circle cx="12" cy="12" r="2"></circle>{" "}
    <circle cx="12" cy="5" r="2"></circle>{" "}
    <circle cx="12" cy="19" r="2"></circle>{" "}
  </svg>
);
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {" "}
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>{" "}
    <circle cx="12" cy="13" r="4"></circle>{" "}
  </svg>
);
const EditIcon = () => (
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
    {" "}
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>{" "}
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>{" "}
  </svg>
);
const DeleteIcon = () => (
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
    {" "}
    <polyline points="3 6 5 6 21 6"></polyline>{" "}
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>{" "}
    <line x1="10" y1="11" x2="10" y2="17"></line>{" "}
    <line x1="14" y1="11" x2="14" y2="17"></line>{" "}
  </svg>
);

function DestinationList({
  destinations,
  onEditClick,
  onDeleteClick,
  viewMode,
}) {
  const navigate = useNavigate();
  const { loading, updateDestination } = useDestinations();

  const [selectedDest, setSelectedDest] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !e.target.closest(".dest-card__actions > button")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (dest) => {
    setSelectedDest(dest);
    setIsPickerOpen(true);
  };

  const handleSelectImage = async (imageUrl) => {
    if (!selectedDest) return;
    await updateDestination(selectedDest.id, { destinationImageUrl: imageUrl });
    setIsPickerOpen(false);
    setSelectedDest(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fechas no definidas";
    return new Date(dateString + "T00:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatCountry = (country) => {
    if (!country) return "País";
    if (typeof country === "string") return country;
    return (
      country?.translations?.spa?.common || country?.name?.common || "País"
    );
  };

  if (loading) {
    return (
      <div className={`destination-list ${viewMode}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-dest-card"></div>
        ))}
      </div>
    );
  }

  if (!destinations || destinations.length === 0) {
    return (
      <p className="no-destinations-message">
        Todavía no has añadido ningún destino. ¡Crea tu primer viaje!
      </p>
    );
  }

  if (viewMode === "list") {
    // ... (La vista de lista no cambia)
    return (
      <ul className="destination-list-compact">
        {destinations.map((dest) => (
          <SwipeableListItem
            key={dest.id}
            onEdit={() => onEditClick(dest)}
            onDelete={() => onDeleteClick(dest.id)}
            onClick={() => navigate(`/itinerarios/${dest.id}`)}
          >
            <div className="compact-item">
              <div className="compact-item__flag">
                {dest.countryCode && (
                  <img
                    src={`https://flagcdn.com/w40/${dest.countryCode.toLowerCase()}.png`}
                    alt={formatCountry(dest.country)}
                  />
                )}
              </div>
              <div className="compact-item__details">
                <span className="compact-item__city">{dest.city}</span>
                <span className="compact-item__dates">
                  {formatDate(dest.startDate)} - {formatDate(dest.endDate)}
                </span>
              </div>
              <div className="compact-item__arrow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <polyline points="9 18 15 12 9 6"></polyline>{" "}
                </svg>
              </div>
            </div>
          </SwipeableListItem>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="destination-list">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="dest-card"
            style={{
              "--card-accent-color": dest.color || "var(--color-primary)",
            }}
            onClick={() => navigate(`/itinerarios/${dest.id}`)}
          >
            <div className="dest-card__image-wrapper">
              <div
                className="dest-card__image"
                style={{
                  backgroundImage: `url(${
                    dest.destinationImageUrl ||
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
                  })`,
                }}
              ></div>
            </div>

            {/* ✅ NUEVO CONTENEDOR PARA AMBOS BOTONES */}
            <div className="dest-card__top-actions">
              <div className="dest-card__actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === dest.id ? null : dest.id);
                  }}
                  title="Más opciones"
                  className={openMenuId === dest.id ? "active" : ""}
                >
                  <ActionsIcon />
                </button>
                {openMenuId === dest.id && (
                  <div
                    className="actions-menu"
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        onEditClick(dest);
                        setOpenMenuId(null);
                      }}
                    >
                      <EditIcon /> <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        onDeleteClick(dest.id);
                        setOpenMenuId(null);
                      }}
                      className="danger"
                    >
                      <DeleteIcon /> <span>Eliminar</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                className="dest-card__change-img-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageChange(dest);
                }}
                title="Cambiar imagen"
              >
                <CameraIcon />
              </button>
            </div>

            <div className="dest-card__content">
              <div className="dest-card__header">
                <h3>{dest.city}</h3>
                <span>{formatCountry(dest.country)}</span>
              </div>
              <div className="dest-card__dates">
                <CalendarIcon />
                <span>
                  {formatDate(dest.startDate)} - {formatDate(dest.endDate)}
                </span>
              </div>
              <div className="dest-card__stats">
                <span>📝 {(dest.notes || []).length}</span>
                <span>💰 {(dest.expenses || []).length}</span>
                <span>📎 {(dest.files || []).length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectImage}
        city={selectedDest?.city}
        country={selectedDest?.country}
      />
    </>
  );
}

export default DestinationList;
