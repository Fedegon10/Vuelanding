import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDestinations } from "../context/DestinationsContext";
import { fetchAttractionSuggestions } from "../services/apiService";
import Modal from "../components/common/Modal";
import ItineraryEventForm from "../components/itineraries/ItineraryEventForm";
import DeleteConfirmation from "../components/common/DeleteConfirmation";
import SwipeableListItem from "../components/common/SwipeableListItem";
import "../components/itineraries/Itineraries.css";

// --- ✈️ Iconos para el nuevo diseño ---
const ICONS = {
  Transporte: () => (
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
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2 C4.4 6.1 4 6.3 3.9 6.7L2.2 12l6.2 1.8L12 21.8l5.3-1.7c.4-.1.6-.5.5-.9z" />
    </svg>
  ),
  Alojamiento: () => (
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
      <path d="M2 21V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v13h-3a2 2 0 0 1-2-2v-2a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2H2Z" />
      <path d="M9 16V9a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v7" />
    </svg>
  ),
  Entradas: () => (
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
      <path d="M2 9a3 3 0 0 1 0 6v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a3 3 0 0 1 0-6V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  ),
  Restaurante: () => (
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
      <path d="M3 2v7c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V2" />
      <path d="M5 11v10" />
      <path d="M19 11v10" />
      <path d="M12 11v10" />
    </svg>
  ),
  Tour: () => (
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
      <path d="m13.4 2.6 3.4 3.4" />
      <path d="M12 2a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4" />
      <path d="M12 2a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4" />
      <path d="M16 12h-8" />
    </svg>
  ),
  Museo: () => (
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
      <path d="m22 18-6-6-4 4-1.45-1.45A6.5 6.5 0 1 0 2 13.29V18h20Z" />
      <path d="m14 12-4 4" />
      <path d="m14 6 6 6" />
    </svg>
  ),
  Compras: () => (
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
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Otros: () => (
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
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  ),
};
ICONS["Actividad"] = ICONS["Tour"];
ICONS["Cultural"] = ICONS["Museo"];
ICONS["Histórico"] = ICONS["Museo"];
ICONS["Religioso"] = ICONS["Museo"];
ICONS["Urbano"] = ICONS["Tour"];
ICONS["Gastronomía"] = ICONS["Restaurante"];
ICONS["Monumento"] = ICONS["Museo"];

const getIconForEvent = (event) => {
  const category = event.isReservation ? event.category : event.type;
  const IconComponent = ICONS[category] || ICONS["Otros"];
  return <IconComponent />;
};

const TimelineEvent = ({ event, onEdit, onDelete }) => (
  <div className="timeline-event-wrapper">
    <div className="timeline-event-time">
      {event.startTime || "Todo el día"}
    </div>
    <div className="timeline-event-connector">
      <div className="timeline-event-icon">{getIconForEvent(event)}</div>
      <div className="timeline-event-line"></div>
    </div>
    <div className="timeline-event-card">
      <div className="timeline-event-details">
        <h4>{event.title}</h4>
        <span>{event.isReservation ? event.category : event.type}</span>
      </div>
      <div className="timeline-event-actions">
        <button className="btn-icon" onClick={() => onEdit(event)}>
          ✏️
        </button>
        <button
          className="btn-icon btn-delete"
          onClick={() => onDelete(event.id)}
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
);

const WeeklySummaryEvent = ({ event }) => (
  <div className="weekly-summary-event">
    <div className="weekly-summary-icon">{getIconForEvent(event)}</div>
    <span className="weekly-summary-time">
      {event.startTime || "Todo el día"}
    </span>
    <span className="weekly-summary-title">{event.title}</span>
  </div>
);

const WeeklySummaryDay = ({ date, events }) => {
  const d = new Date(`${date}T00:00:00`);
  return (
    <div className="day-block">
      <div className="day-info">
        <span className="day-info__dow">
          {d.toLocaleDateString("es-ES", { weekday: "short" })}
        </span>
        <span className="day-info__day">{d.getDate()}</span>
      </div>
      <div className="day-events">
        {events.length > 0 ? (
          events.map((event) => (
            <WeeklySummaryEvent key={event.id} event={event} />
          ))
        ) : (
          <div className="no-events-small">Sin actividades</div>
        )}
      </div>
    </div>
  );
};

function ItineraryDetailPage() {
  const { destinationId } = useParams();
  const { destinations, deleteEvent } = useDestinations();
  const destination = useMemo(
    () =>
      (destinations || []).find((d) => String(d.id) === String(destinationId)),
    [destinations, destinationId]
  );

  const [selectedDate, setSelectedDate] = useState(destination?.startDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [suggestionState, setSuggestionState] = useState({
    isLoading: false,
    data: [],
    error: null,
  });

  const fetchSuggestions = async () => {
    setSuggestionState({ isLoading: true, data: [], error: null });
    try {
      const fetched = await fetchAttractionSuggestions(
        destination.city,
        destination.country
      );
      setSuggestionState({ isLoading: false, data: fetched, error: null });
    } catch (error) {
      setSuggestionState({ isLoading: false, data: [], error });
    }
  };

  useEffect(() => {
    if (
      destination?.city &&
      suggestionState.data.length === 0 &&
      !suggestionState.isLoading
    ) {
      fetchSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.city]);

  const tripDates = useMemo(() => {
    if (!destination?.startDate || !destination?.endDate) return [];
    const dates = [];
    let curr = new Date(`${destination.startDate}T00:00:00`);
    const endDate = new Date(`${destination.endDate}T00:00:00`);
    while (curr <= endDate) {
      dates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }, [destination]);

  const [weekOffset, setWeekOffset] = useState(0);
  const scrollerRef = useRef(null);
  const visibleWeek = useMemo(() => {
    const startIndex = weekOffset * 7;
    return tripDates.slice(startIndex, startIndex + 7);
  }, [tripDates, weekOffset]);
  useEffect(() => {
    if (scrollerRef.current)
      scrollerRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }, [weekOffset]);
  const handlePrevWeek = () => {
    if (weekOffset > 0) setWeekOffset(weekOffset - 1);
  };
  const handleNextWeek = () => {
    if ((weekOffset + 1) * 7 < tripDates.length) setWeekOffset(weekOffset + 1);
  };

  const eventsByDate = useMemo(() => {
    const groupedEvents = {};
    (destination?.events || []).forEach((event) => {
      if (!groupedEvents[event.date]) groupedEvents[event.date] = [];
      groupedEvents[event.date].push(event);
    });
    for (const date in groupedEvents) {
      groupedEvents[date].sort((a, b) =>
        (a.startTime || "00:00").localeCompare(b.startTime || "00:00")
      );
    }
    return groupedEvents;
  }, [destination?.events]);

  const eventsForSelectedDate = useMemo(
    () => eventsByDate[selectedDate] || [],
    [selectedDate, eventsByDate]
  );
  const handleEditClick = (event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };
  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setIsConfirmModalOpen(true);
  };
  const handleConfirmDelete = () => {
    if (eventToDelete) deleteEvent(destination.id, eventToDelete);
    setIsConfirmModalOpen(false);
    setEventToDelete(null);
  };

  if (!destination)
    return (
      <div className="page-container">
        <h1>Itinerario no encontrado</h1>
      </div>
    );

  return (
    <div className="page-container itinerary-page">
      <div className="back-link-wrapper">
        <Link to="/itinerarios" className="btn-secondary">
          &larr; Volver
        </Link>
      </div>

      <header className="page-header itinerary-detail-header">
        <div className="itinerary-heading">
          <h1>Itinerario para {destination.city}</h1>
          <p>Planifica tus actividades día por día en {destination.country}.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Añadir Evento
          </button>
        </div>
      </header>

      <div className="week-selector">
        <button
          className="nav-arrow"
          onClick={handlePrevWeek}
          disabled={weekOffset === 0}
        >
          &lt;
        </button>
        <div className="days-strip" ref={scrollerRef}>
          {visibleWeek.map((date) => (
            <button
              key={date}
              className={`day-chip ${selectedDate === date ? "active" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="dow">
                {new Date(`${date}T00:00:00`).toLocaleDateString("es-ES", {
                  weekday: "short",
                })}
              </span>
              <span className="daynum">
                {new Date(`${date}T00:00:00`).getDate()}
              </span>
            </button>
          ))}
        </div>
        <button
          className="nav-arrow"
          onClick={handleNextWeek}
          disabled={(weekOffset + 1) * 7 >= tripDates.length}
        >
          &gt;
        </button>
      </div>

      <section className="card">
        <h2>Actividades del día</h2>
        <div className="daily-timeline-redesigned">
          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((event) => (
              <TimelineEvent
                key={event.id}
                event={event}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))
          ) : (
            <p className="no-events-message">
              No hay actividades para este día.
            </p>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Resumen Semanal</h2>
        <div className="weekly-summary-redesigned">
          {tripDates.map((date) => (
            <WeeklySummaryDay
              key={date}
              date={date}
              events={eventsByDate[date] || []}
            />
          ))}
        </div>
      </section>

      <section className="brb-card">
        <div className="brb-card__head">
          <div>
            <h2 className="brb-card__title">
              Sugerencias en {destination.city}
            </h2>
            <p className="brb-card__subtitle">Explora y agrega al itinerario</p>
          </div>
          <button className="brb-chip" onClick={fetchSuggestions}>
            Actualizar
          </button>
        </div>
        {suggestionState.isLoading ? (
          <div className="brb-loading">Buscando…</div>
        ) : suggestionState.error ? (
          <p className="brb-empty">No se pudieron cargar las sugerencias.</p>
        ) : suggestionState.data.length ? (
          <div className="brb-cards">
            {suggestionState.data.map((sugg) => (
              <article key={sugg.name} className="brb-card-mini">
                {sugg.imageUrl ? (
                  <img
                    className="brb-card-mini__img"
                    src={sugg.imageUrl}
                    alt={sugg.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="brb-card-mini__img ph" />
                )}
                <div className="brb-card-mini__body">
                  <h4 className="brb-card-mini__title" title={sugg.name}>
                    {sugg.name}
                  </h4>
                  <p className="brb-card-mini__meta">
                    {sugg.source || "Wikipedia"} •{" "}
                    {sugg.category || "Atracción"}
                  </p>
                  <div className="brb-card-mini__stars">
                    {"⭐".repeat(sugg.rating || 0)}
                    {"☆".repeat(Math.max(0, 5 - (sugg.rating || 0)))}
                  </div>
                </div>
                <button
                  className="brb-card-mini__btn"
                  onClick={() => {
                    setEventToEdit({
                      title: sugg.name,
                      type: sugg.category || "Actividad",
                      date: selectedDate,
                      isReservation: false,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  Añadir
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="brb-empty">No se encontraron sugerencias.</p>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEventToEdit(null);
        }}
        title={eventToEdit ? "Editar Evento/Reserva" : "Añadir Nuevo Evento"}
      >
        <ItineraryEventForm
          destinationId={destination.id}
          destination={destination}
          eventToEdit={eventToEdit}
          selectedDate={selectedDate}
          onFinished={() => {
            setIsModalOpen(false);
            setEventToEdit(null);
          }}
        />
      </Modal>
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <DeleteConfirmation
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
          message="¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer."
        />
      </Modal>
    </div>
  );
}

export default ItineraryDetailPage;
