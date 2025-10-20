import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDestinations } from "../context/DestinationsContext.jsx";
import { fetchItineraryCoverImage } from "../services/apiService.js";
import ImagePickerModal from "../components/common/ImagePickerModal.jsx";
import "./ItinerariesPage.css";

// --- Iconos para el nuevo diseño ---
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

// =========================================================
//  NUEVO COMPONENTE DE TARJETA REDISEÑADO
// =========================================================
function ItineraryCard({ destination, onUpdateImage }) {
  const [imageUrl, setImageUrl] = useState(destination.itineraryImageUrl || "");
  const [isLoadingImage, setIsLoadingImage] = useState(
    !destination.itineraryImageUrl
  );
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!destination.itineraryImageUrl) {
      const loadImage = async () => {
        setIsLoadingImage(true);
        const fetchedImageUrl = await fetchItineraryCoverImage(
          destination.city,
          destination.country
        );
        setImageUrl(fetchedImageUrl);
        setIsLoadingImage(false);
      };
      loadImage();
    }
  }, [destination.itineraryImageUrl, destination.city, destination.country]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { month: "long", day: "numeric" };
    return new Date(dateString + "T00:00:00").toLocaleDateString(
      "es-ES",
      options
    );
  };

  const handleImageSelect = async (url) => {
    setImageUrl(url);
    setShowPicker(false);
    if (onUpdateImage) onUpdateImage(destination.id, url);
  };

  const formatCountry = (country) => {
    if (!country) return "País";
    if (typeof country === "string") return country;
    return (
      country?.translations?.spa?.common || country?.name?.common || "País"
    );
  };

  return (
    <>
      <Link
        to={`/itinerarios/${destination.id}`}
        className={`itinerary-card ${isLoadingImage ? "loading" : ""}`}
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="itinerary-card__overlay"></div>

        <button
          className="itinerary-card__change-image-btn"
          title="Cambiar imagen"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPicker(true);
          }}
        >
          <CameraIcon />
        </button>

        <div className="itinerary-card__content">
          <h3 className="itinerary-card__city">{destination.city}</h3>
          <div className="itinerary-card__details">
            <div className="with-flag">
              {destination.countryCode && (
                <img
                  className="country-flag"
                  src={`https://flagcdn.com/w20/${destination.countryCode.toLowerCase()}.png`}
                  alt={`Bandera de ${formatCountry(destination.country)}`}
                />
              )}
              <span>{formatCountry(destination.country)}</span>
            </div>
            <div className="dates">
              <span>
                {formatDate(destination.startDate)} -{" "}
                {formatDate(destination.endDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="itinerary-card__arrow">
          <ArrowRightIcon />
        </div>
      </Link>

      {showPicker && (
        <ImagePickerModal
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handleImageSelect}
          city={destination.city}
          country={destination.country}
        />
      )}
    </>
  );
}

// =========================================================
//  COMPONENTE PRINCIPAL (SIN CAMBIOS GRANDES)
// =========================================================
function ItinerariesPage() {
  const { destinations, updateDestination } = useDestinations();
  const [viewMode, setViewMode] = useState("grid");

  const handleUpdateImage = async (id, newUrl) => {
    await updateDestination(id, { itineraryImageUrl: newUrl });
  };

  // Función para formatear el país, necesaria en la vista de lista
  const formatCountry = (country) => {
    if (!country) return "País";
    if (typeof country === "string") return country;
    return (
      country?.translations?.spa?.common || country?.name?.common || "País"
    );
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Mis Itinerarios</h1>
          <p>
            Selecciona un viaje para planificar tus actividades día por día.
          </p>
        </div>
      </header>
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
      {destinations && destinations.length > 0 ? (
        viewMode === "grid" ? (
          <div className="destination-cards-grid">
            {destinations.map((dest) => (
              <ItineraryCard
                key={dest.id}
                destination={dest}
                onUpdateImage={handleUpdateImage}
              />
            ))}
          </div>
        ) : (
          <ul className="destination-list-compact">
            {destinations.map((dest) => (
              <li key={dest.id}>
                <Link
                  to={`/itinerarios/${dest.id}`}
                  className="compact-item-link"
                >
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
          <p>
            Aún no tienes destinos. ¡Crea uno para empezar a planificar tu
            itinerario!
          </p>
        </div>
      )}
    </div>
  );
}

export default ItinerariesPage;
