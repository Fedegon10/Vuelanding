import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDestinations } from "../context/DestinationsContext";
import { useUser } from "../context/UserContext";
import { allNavLinks } from "../config/navLinks";
import CollaborationInvite from "../components/home/CollaborationInvite";
// ===== RUTA CORREGIDA AQUÍ =====
import CollaborationModal from "../components/common/CollaborationModal";
import { Users } from "lucide-react";
import "./HomePage.css";
import logoBlack from "../assets/images/logo-black.png";

const formatDateRange = (start, end) => {
  if (!start || !end) return "";
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  const startDay = startDate.toLocaleDateString("es-ES", { day: "numeric" });
  const startMonth = startDate.toLocaleDateString("es-ES", { month: "short" });
  const endDay = endDate.toLocaleDateString("es-ES", { day: "numeric" });
  const endMonth = endDate.toLocaleDateString("es-ES", { month: "short" });
  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
};

function HomePage() {
  const { destinations } = useDestinations();
  const {
    userProfile,
    invitations,
    acceptInvitation,
    declineInvitation,
    loadingProfile,
  } = useUser();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  const upcomingTrips = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (destinations || [])
      .filter((dest) => {
        if (!dest.startDate) return false;
        const tripDate = new Date(dest.startDate + "T00:00:00");
        return tripDate >= today;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 3);
  }, [destinations]);

  const quickActions = allNavLinks.filter((link) =>
    [
      "destinations",
      "itineraries",
      "reservations",
      "expenses",
      "docs",
      "notes",
    ].includes(link.id)
  );

  const UpcomingTripsSection = ({ trips }) => (
    <>
      {trips.length > 0 ? (
        <div className="upcoming-trips-list">
          {trips.map((trip) => (
            <Link
              to={`/itinerarios/${trip.id}`}
              key={trip.id}
              className="upcoming-trip-card card"
            >
              <img
                src={
                  trip.itineraryImageUrl ||
                  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                }
                alt={`Vista de ${trip.city}`}
                className="trip-card-bg"
              />
              <div className="trip-card-overlay">
                <h3>{trip.city}</h3>
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card no-upcoming-trips">
          <p>¡Es hora de planear una nueva aventura!</p>
          <Link to="/destinos" className="btn-secondary">
            Añadir Viaje
          </Link>
        </div>
      )}
    </>
  );

  if (loadingProfile) {
    return null;
  }

  return (
    <div className="page-container home-page">
      <CollaborationModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      <img src={logoBlack} alt="Logo Vuelanding" className="fixed-logo" />

      <header className="home-header">
        <div className="header-content">
          <h1>
            ✈️ Hola,{" "}
            {userProfile?.username || userProfile?.displayName || "viajero"}
          </h1>
          <p>
            Tu centro de comando para organizar cada detalle de tus aventuras.
          </p>
        </div>

        {userProfile?.username && (
          <button
            className="btn-primary btn-invite"
            onClick={() => setInviteModalOpen(true)}
            title="Invitar a un colaborador"
          >
            <Users size={20} />
            <span>Invitar</span>
          </button>
        )}
      </header>

      {invitations && invitations.length > 0 && (
        <section className="invitations-section card">
          <h2>Invitaciones Pendientes</h2>
          {invitations.map((invite) => (
            <CollaborationInvite
              key={invite.spaceId}
              invitation={invite}
              onAccept={acceptInvitation}
              onDecline={declineInvitation}
            />
          ))}
        </section>
      )}

      {!userProfile?.username && (
        <section className="collaboration-prompt card">
          <h2>Completa tu perfil</h2>
          <p>
            Crea un nombre de usuario para poder colaborar con otros viajeros.
          </p>
          <Link to="/perfil" className="btn-primary">
            Ir a mi Perfil
          </Link>
        </section>
      )}

      <div className="desktop-view">
        <nav className="home-nav-grid">
          {allNavLinks.map((link) => (
            <Link to={link.path} key={link.id} className="nav-card">
              <div className="nav-card-icon">{link.icon}</div>
              <h2>{link.label}</h2>
              <p>
                {
                  {
                    home: "Ve un resumen de tu actividad y próximos viajes.",
                    destinations:
                      "Crea, edita y organiza todos tus próximos viajes.",
                    itineraries:
                      "Planifica tus actividades y visitas día por día.",
                    reservations:
                      "Gestiona vuelos, hoteles y otros transportes.",
                    notes: "Guarda ideas, recordatorios y tareas pendientes.",
                    calendar:
                      "Visualiza tus viajes y eventos en un calendario global.",
                    files:
                      "Guarda tickets, reservas y documentos de tus viajes.",
                    docs: "Almacena de forma segura tus documentos personales.",
                    expenses:
                      "Registra y visualiza todos los gastos de tus viajes.",
                    map: "Explora tus rutas de viaje en un mapa interactivo.",
                  }[link.id]
                }
              </p>
            </Link>
          ))}
        </nav>
        <section className="desktop-trips-section">
          <h2>Próximos Viajes</h2>
          <UpcomingTripsSection trips={upcomingTrips} />
        </section>
      </div>

      <div className="mobile-dashboard">
        <section className="mobile-section">
          <h2>Acciones Rápidas</h2>
          <div className="quick-actions-grid">
            {quickActions.map((link) => (
              <Link to={link.path} key={link.id} className="quick-action-card">
                <div className="quick-action-icon">{link.icon}</div>
                <span>{link.label}</span>
              </Link>
            ))}
            <Link to="/menu" className="quick-action-card">
              <div className="quick-action-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </div>
              <span>Ver Todo</span>
            </Link>
          </div>
        </section>
        <section className="mobile-section">
          <h2>Próximos Viajes</h2>
          <UpcomingTripsSection trips={upcomingTrips} />
        </section>
      </div>
    </div>
  );
}

export default HomePage;
