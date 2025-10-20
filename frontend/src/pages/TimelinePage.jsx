import React, { useMemo } from 'react';
import { useDestinations } from '../context/DestinationsContext';
import TimelineCard from '../components/timeline/TimelineCard';
import '../components/timeline/Timeline.css';

export default function TimelinePage() {
  const { destinations } = useDestinations();

  const itemsByDate = useMemo(() => {
    const items = {};
    destinations.forEach(dest => {
      const base = {
        destinationId: dest.id,
        city: dest.city,
        country: dest.country,
        flag: dest.countryCode
          ? `https://flagcdn.com/w40/${dest.countryCode.toLowerCase()}.png`
          : '',
      };

      (dest.events || []).forEach(ev => {
        if (ev.date) {
          if (!items[ev.date]) items[ev.date] = [];
          items[ev.date].push({ ...base, ...ev, type: 'event', title: ev.title });
        }
      });

      (dest.notes || []).forEach(note => {
        const date = note.date || dest.startDate;
        if (date) {
          if (!items[date]) items[date] = [];
          items[date].push({
            ...base,
            ...note,
            type: 'note',
            title: note.text || 'Nota',
            date,
          });
        }
      });
    });

    Object.keys(items).forEach(date => {
      items[date].sort((a, b) =>
        (a.startTime || '').localeCompare(b.startTime || '')
      );
    });

    return items;
  }, [destinations]);

  const sortedDates = useMemo(
    () => Object.keys(itemsByDate).sort((a, b) => new Date(a) - new Date(b)),
    [itemsByDate]
  );

  return (
    <div className="page-container timeline-page">
      <header className="timeline-header">
        <h1>🗓️ Línea de Tiempo del Viaje</h1>
        <p>Visualiza tus actividades y notas por fecha y destino.</p>
      </header>

      {sortedDates.length > 0 ? (
        <section className="timeline-modern timeline-responsive">
          {sortedDates.map((date, index) => (
            <div key={date} className="timeline-group">
              <div className="timeline-date">
                {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>

              <div className="timeline-items">
                {itemsByDate[date].map(item => (
                  <TimelineCard key={item.id || item.title} item={item} />
                ))}
              </div>

              {index !== sortedDates.length - 1 && (
                <div className="timeline-connector-horizontal" />
              )}
            </div>
          ))}
        </section>
      ) : (
        <div className="timeline-empty card">
          <p>No hay eventos ni notas en la línea de tiempo aún.</p>
        </div>
      )}
    </div>
  );
}
