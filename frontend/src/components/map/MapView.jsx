// src/components/map/MapView.jsx

import React, { useEffect, useRef, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";

const MAPTILER_KEY = "F7plf6dqd6kpPsTlxyb6";

// --- Componentes y funciones de ayuda (sin cambios) ---
const CATEGORY_COLORS = {
  turismo: "#6E44FF",
  gastronomia: "#E67E22",
  cultural: "#9B59B6",
  transporte: "#16A085",
  compras: "#E84393",
  otros: "#95A5A6",
  default: "#6E44FF",
};
const iconCache = {};
function getColoredIcon(category = "default") {
  const lower = category.toLowerCase();
  if (iconCache[lower]) return iconCache[lower];
  const color = CATEGORY_COLORS[lower] || CATEGORY_COLORS.default;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.26 18 30 18 30s18-17.74 18-30C36 8.06 27.94 0 18 0z" fill="${color}" fill-opacity="0.9"/><circle cx="18" cy="18" r="7" fill="white"/></svg>`;
  const icon = L.icon({
    iconUrl: "data:image/svg+xml;base64," + btoa(svg),
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -42],
  });
  iconCache[lower] = icon;
  return icon;
}
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
}
const formatDate = (d) =>
  d
    ? new Date(`${d}T00:00:00`).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";
const RouteDecorator = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || positions.length < 2) return;
    const polyline = L.polyline(positions);
    const decorator = L.polylineDecorator(polyline, {
      patterns: [
        {
          offset: "15%",
          repeat: "100px",
          symbol: L.Symbol.arrowHead({
            pixelSize: 12,
            pathOptions: {
              fillOpacity: 1,
              weight: 0,
              fillColor: "var(--color-primary)",
            },
          }),
        },
      ],
    }).addTo(map);
    return () => {
      map.removeLayer(decorator);
    };
  }, [map, positions]);
  return null;
};

// ✅ ESTE ES EL NUEVO COMPONENTE "INTELIGENTE" QUE ARREGLA EL MAPA
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    // --- Solución para la animación de Framer Motion ---
    // Buscamos el contenedor principal de la página, que es el que Framer Motion anima.
    const pageContainer = document.querySelector(
      '.main-content > div[style*="transform"]'
    );

    const handleAnimationEnd = () => {
      console.log("Animation ended, resizing map.");
      map.invalidateSize();
    };

    if (pageContainer) {
      // Escuchamos el evento que el navegador emite cuando una animación CSS termina.
      pageContainer.addEventListener("animationend", handleAnimationEnd);
    }

    // --- Solución para el cambio de tamaño del sidebar ---
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const mapLayout = document.querySelector(".map-layout");
    if (mapLayout) {
      observer.observe(mapLayout);
    }

    // Forzamos un redibujado inicial como seguro
    setTimeout(() => map.invalidateSize(), 100);

    // Limpieza al desmontar el componente
    return () => {
      if (pageContainer) {
        pageContainer.removeEventListener("animationend", handleAnimationEnd);
      }
      if (mapLayout) {
        observer.unobserve(mapLayout);
      }
    };
  }, [map]); // Se vuelve a ejecutar si la instancia del mapa cambia

  return null;
}

// --- COMPONENTE PRINCIPAL DEL MAPA ---
function MapView({ destinations, selectedCoords }) {
  const positions = destinations
    .filter((d) => d.lat && d.lng)
    .map((d) => [d.lat, d.lng]);
  const initialCenter = positions.length ? positions[0] : [20, 0];

  return (
    <div className="leaflet-wrapper">
      <MapContainer
        center={initialCenter}
        zoom={positions.length > 0 ? 5 : 2}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", backgroundColor: "#f0f0f0" }}
      >
        <ChangeView center={selectedCoords} zoom={13} />
        <TileLayer
          url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {destinations.map(
          (dest) =>
            dest.lat &&
            dest.lng && (
              <Marker
                key={dest.id}
                position={[dest.lat, dest.lng]}
                icon={getColoredIcon(dest.category || "default")}
              >
                <Popup>
                  <div className="map-popup">
                    <h3>{`${dest.city}, ${dest.country}`}</h3>
                    <p>
                      <strong>Desde:</strong> {formatDate(dest.startDate)}
                    </p>
                    <p>
                      <strong>Hasta:</strong> {formatDate(dest.endDate)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
        )}
        {positions.length > 1 && (
          <Polyline
            pathOptions={{
              color: "var(--color-primary)",
              weight: 4,
              opacity: 0.9,
            }}
            positions={positions}
          />
        )}
        {positions.length > 1 && <RouteDecorator positions={positions} />}

        {/* Añadimos nuestro componente inteligente al mapa */}
        <MapResizer />
      </MapContainer>
    </div>
  );
}

export default memo(MapView);
