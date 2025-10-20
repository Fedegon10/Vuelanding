import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useDestinations } from "../context/DestinationsContext";
import { Navigation2 } from "lucide-react";
import "../components/map/Map.css";

const MapView = React.lazy(() => import("../components/map/MapView"));

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}

const COUNTRY_CODE_FIX = {
  poland: "pl",
  polska: "pl",
  polonia: "pl",
  hungary: "hu",
  hungria: "hu",
  hungría: "hu",
  austria: "at",
  czechia: "cz",
  chequia: "cz",
  "república checa": "cz",
  "republica checa": "cz",
  turkey: "tr",
  turquia: "tr",
  turquía: "tr",
  germany: "de",
  alemania: "de",
  spain: "es",
  españa: "es",
  italy: "it",
  italia: "it",
  france: "fr",
  francia: "fr",
};

function normalizeCountryCode(codeOrName = "") {
  const normalized = codeOrName.trim().toLowerCase();
  if (/^[a-z]{2}$/.test(normalized)) return normalized;
  if (COUNTRY_CODE_FIX[normalized]) return COUNTRY_CODE_FIX[normalized];
  return null;
}

function MapPage() {
  const { destinations } = useDestinations();
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  const tripData = useMemo(() => {
    const sorted = [...destinations]
      .filter((d) => d.id && d.startDate && d.lat && d.lng)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    return sorted.map((dest, i) => {
      const nextDest = sorted[i + 1];
      const distanceToNext = nextDest
        ? calculateDistance(dest.lat, dest.lng, nextDest.lat, nextDest.lng)
        : null;
      return { ...dest, distanceToNext };
    });
  }, [destinations]);

  const totalDistance = useMemo(() => {
    return tripData.reduce((acc, curr) => acc + (curr.distanceToNext || 0), 0);
  }, [tripData]);

  useEffect(() => {
    if (tripData.length > 0 && !selectedDestinationId) {
      const first = tripData[0];
      setSelectedCoords([first.lat, first.lng]);
      setSelectedDestinationId(first.id);
    }
  }, [tripData, selectedDestinationId]);

  const handleDestinationClick = (dest) => {
    if (dest?.lat && dest?.lng && dest?.id) {
      setSelectedCoords([dest.lat, dest.lng]);
      setSelectedDestinationId(dest.id);
      setIsMobileListOpen(false);
    }
  };

  const { current, next } = useMemo(() => {
    if (!selectedDestinationId) return { current: null, next: null };
    const idx = tripData.findIndex((d) => d.id === selectedDestinationId);
    const curr = tripData[idx];
    const nxt = tripData[idx + 1] || null;
    let distanceInfo = null;
    if (curr && nxt && curr.distanceToNext !== null) {
      distanceInfo = { city: nxt.city, distance: curr.distanceToNext };
    }
    return { current: curr, next: distanceInfo };
  }, [tripData, selectedDestinationId]);

  return (
    <div className="map-page">
      <header className="map-header">
        <h1>Tu Recorrido</h1>
        <p>
          {tripData.length} destinos | {totalDistance.toLocaleString("es-AR")}{" "}
          km totales
        </p>
      </header>

      <div className="map-layout card">
        <aside
          className={`destinations-sidebar ${isMobileListOpen ? "open" : ""}`}
        >
          <h2>📍 Itinerario</h2>
          <button
            className="close-list-button"
            onClick={() => setIsMobileListOpen(false)}
          >
            &times;
          </button>
          <ul className="destinations-list">
            {tripData.map((dest, i) => {
              const flagCode = normalizeCountryCode(
                dest.countryCode || dest.country
              );
              return (
                <li key={dest.id}>
                  <button
                    className={
                      dest.id === selectedDestinationId ? "active" : ""
                    }
                    onClick={() => handleDestinationClick(dest)}
                  >
                    <div className="with-flag">
                      {flagCode && (
                        <img
                          className="country-flag"
                          src={`https://flagcdn.com/w40/${flagCode}.png`}
                          alt={`Bandera de ${dest.country}`}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      <div className="destination-info">
                        <strong>{dest.city}</strong>
                        <span>
                          {new Date(dest.startDate).toLocaleDateString(
                            "es-ES",
                            { day: "numeric", month: "short" }
                          )}{" "}
                          →{" "}
                          {new Date(dest.endDate).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    {dest.distanceToNext !== null && (
                      <div className="distance-info">
                        <Navigation2 size={14} />{" "}
                        {dest.distanceToNext.toLocaleString("es-AR")} km hasta{" "}
                        {tripData[i + 1]?.city}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="map-container-wrapper">
          <Suspense
            fallback={<div className="map-loader">Cargando mapa...</div>}
          >
            {tripData.length > 0 ? (
              <MapView
                destinations={tripData}
                selectedCoords={selectedCoords}
              />
            ) : (
              <div className="no-destinations-message">
                <h2>Aún no hay un recorrido</h2>
                <p>Añade destinos para ver tu viaje en el mapa.</p>
              </div>
            )}
          </Suspense>

          {tripData.length > 0 && (
            <div className="mobile-details-panel">
              {current && (
                <div className="selected-destination-info">
                  {/* SECCIÓN DEL DESTINO ACTUAL */}
                  <div className="current-location">
                    <strong>{current.city}</strong>
                    <span>
                      {new Date(
                        current.startDate + "T00:00:00"
                      ).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(
                        current.endDate + "T00:00:00"
                      ).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* SECCIÓN DEL PRÓXIMO DESTINO (AHORA DEBAJO) */}
                  {next && (
                    <div className="next-destination">
                      <p>
                        <span className="next-label">Próximo → </span>
                        <strong>{next.city}</strong>
                        <span className="distance">
                          {" "}
                          (~{next.distance.toLocaleString("es-AR")} km)
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
              <button
                className="toggle-list-button"
                onClick={() => setIsMobileListOpen(true)}
              >
                Ver Itinerario Completo
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MapPage;
