import React, { useState, useMemo, useEffect } from "react";
import { useDestinations } from "../context/DestinationsContext";
import { Link } from "react-router-dom";
import "../components/calendar/Calendar.css";

// --- Iconos ---
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
const ClipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

// --- Colores pastel por categoría ---
const CATEGORY_COLORS = {
  default: { bg: "rgba(255, 171, 145, 0.2)", border: "#FFAB91" },
  Alojamiento: { bg: "rgba(129, 212, 250, 0.25)", border: "#81D4FA" },
  Transporte: { bg: "rgba(128, 222, 234, 0.25)", border: "#80DEEA" },
  Comida: { bg: "rgba(255, 224, 130, 0.25)", border: "#FFE082" },
  Ocio: { bg: "rgba(179, 157, 219, 0.25)", border: "#B39DDB" },
  Compras: { bg: "rgba(244, 143, 177, 0.25)", border: "#F48FB1" },
};

function CalendarPage() {
  const { destinations, toggleEventComplete } = useDestinations();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [initialDateSet, setInitialDateSet] = useState(false);
  const [transitionDir, setTransitionDir] = useState(null);

  // Inicializar fecha
  useEffect(() => {
    if (destinations && destinations.length > 0 && !initialDateSet) {
      const earliest = destinations.reduce((a, b) =>
        new Date(a.startDate) < new Date(b.startDate) ? a : b
      );
      setCurrentDate(new Date(earliest.startDate + "T00:00:00"));
      setInitialDateSet(true);
    }
  }, [destinations, initialDateSet]);

  // Días de la semana actual
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(currentDate.getDate() + diff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const changeWeek = (dir) => {
    setTransitionDir(dir === "prev" ? "left" : "right");
    setTimeout(() => {
      setCurrentDate((prev) => {
        const next = new Date(prev);
        next.setDate(next.getDate() + (dir === "prev" ? -7 : 7));
        return next;
      });
      setTransitionDir(null);
    }, 150);
  };

  // Destino correspondiente
  const destinationForSelectedDay = useMemo(() => {
    const day = new Date(currentDate);
    day.setHours(0, 0, 0, 0);
    return (destinations || []).find((dest) => {
      const start = new Date(dest.startDate + "T00:00:00");
      const end = new Date(dest.endDate + "T23:59:59");
      return day >= start && day <= end;
    });
  }, [currentDate, destinations]);

  // Eventos del día
  const eventsForSelectedDay = useMemo(() => {
    const dayStr = currentDate.toISOString().split("T")[0];
    if (!destinationForSelectedDay) return [];
    return (destinationForSelectedDay.events || [])
      .filter((e) => e.date === dayStr)
      .sort((a, b) =>
        (a.startTime || "00:00").localeCompare(b.startTime || "00:00")
      );
  }, [currentDate, destinationForSelectedDay]);

  // Calcular duración
  const getDuration = (start, end) => {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let total = eh * 60 + em - (sh * 60 + sm);
    if (total < 0) total += 24 * 60; // si cruza medianoche
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  };

  // Posicionamiento visual
  const getEventStyle = (event, minHour, maxHour) => {
    if (!event.startTime) return { top: "0px", height: "60px" };

    const [sh, sm] = event.startTime.split(":").map(Number);
    const [eh, em] = event.endTime
      ? event.endTime.split(":").map(Number)
      : [sh + 1, sm];

    const startMinutes = sh * 60 + sm - minHour * 60;
    const durationMinutes = eh * 60 + em - (sh * 60 + sm);
    const hourHeight = 60; // igual que .hour-label height en CSS
    const pxPerMinute = hourHeight / 60;

    return {
      top: `${startMinutes * pxPerMinute}px`,
      height: `${Math.max(durationMinutes * pxPerMinute, 30)}px`, // mínimo 30px
    };
  };

  // Rango de horas relevantes
  const timeRange = useMemo(() => {
    if (eventsForSelectedDay.length === 0) return { min: 8, max: 22 }; // Rango por defecto
    const starts = eventsForSelectedDay.map((e) =>
      parseInt(e.startTime?.split(":")[0] || "8")
    );
    const ends = eventsForSelectedDay.map((e) =>
      parseInt(
        e.endTime?.split(":")[0] ||
          (parseInt(e.startTime?.split(":")[0] || "8") + 1).toString()
      )
    );
    const min = Math.min(...starts);
    const max = Math.max(...ends) + 1;
    return { min, max };
  }, [eventsForSelectedDay]);

  return (
    <div className="page-container">
      <div className="calendar-view">
        <header className="calendar-header-neo">
          <div className="calendar-header-top">
            <button onClick={() => changeWeek("prev")} className="nav-arrow">
              ‹
            </button>
            <div className="month-display">
              <span className="month-icon">🗓️</span>
              <h2>
                {currentDate.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>
            <button onClick={() => changeWeek("next")} className="nav-arrow">
              ›
            </button>
          </div>

          <div
            className={`calendar-days-scroll ${
              transitionDir ? `slide-${transitionDir}` : ""
            }`}
          >
            {weekDays.map((day) => {
              const isSelected =
                day.toDateString() === currentDate.toDateString();
              const dayName = day.toLocaleDateString("es-ES", {
                weekday: "short",
              });
              const dayNum = day.getDate();
              return (
                <div
                  key={day.toISOString()}
                  className={`calendar-day-chip ${isSelected ? "active" : ""}`}
                  onClick={() => setCurrentDate(day)}
                >
                  <span className="day-name">{dayName.replace(".", "")}</span>
                  <span className="day-number">{dayNum}</span>
                </div>
              );
            })}
          </div>
        </header>

        {destinationForSelectedDay && (
          <div className="destination-float">
            <Link
              to={`/itinerarios/${destinationForSelectedDay.id}`}
              className="destination-chip-neo"
            >
              <img
                className="country-flag"
                src={`https://flagcdn.com/w20/${destinationForSelectedDay.countryCode.toLowerCase()}.png`}
                alt=""
              />
              <span>
                {destinationForSelectedDay.city},{" "}
                {destinationForSelectedDay.country?.name?.common ||
                  destinationForSelectedDay.country}
              </span>
            </Link>
          </div>
        )}

        <main className="calendar-body">
          {eventsForSelectedDay.length === 0 ? (
            <div className="empty-state-neo">
              <div className="empty-emoji">🌈</div>
              <p>
                No hay eventos en este día.
                <br />
                ¡Planeá algo increíble!
              </p>
            </div>
          ) : (
            <div className="timeline-wrapper">
              <div className="time-ruler">
                {Array.from(
                  { length: timeRange.max - timeRange.min + 1 },
                  (_, i) => {
                    const h = timeRange.min + i;
                    return (
                      <div key={h} className="hour-label">{`${h
                        .toString()
                        .padStart(2, "0")}:00`}</div>
                    );
                  }
                )}
              </div>
              <div className="events-canvas">
                {eventsForSelectedDay.map((event) => {
                  const colors =
                    CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default;
                  const linkedFile = destinationForSelectedDay.files?.find(
                    (f) => f.eventId === event.id
                  );
                  const style = getEventStyle(
                    event,
                    timeRange.min,
                    timeRange.max
                  );
                  return (
                    <div
                      key={event.id}
                      className={`agenda-event-card ${
                        event.completed ? "completed" : ""
                      }`}
                      style={{
                        ...style,
                        borderLeftColor: colors.border,
                        backgroundColor: colors.bg,
                      }}
                    >
                      <div className="event-content">
                        <h3 className="event-title">{event.title}</h3>
                        <p className="event-time">
                          {event.startTime}{" "}
                          {event.endTime && `- ${event.endTime}`}
                          {event.startTime && event.endTime && (
                            <span className="event-duration">
                              {" (" +
                                getDuration(event.startTime, event.endTime) +
                                ")"}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="event-actions">
                        {linkedFile && (
                          <button
                            className="event-action-btn"
                            onClick={() =>
                              window.open(linkedFile.url, "_blank")
                            }
                            title={linkedFile.name}
                          >
                            <ClipIcon />
                          </button>
                        )}
                        <button
                          className={`event-action-btn complete-btn ${
                            event.completed ? "is-completed" : ""
                          }`}
                          onClick={() =>
                            toggleEventComplete(
                              destinationForSelectedDay.id,
                              event.id
                            )
                          }
                          title="Marcar como completado"
                        >
                          <CheckIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CalendarPage;
