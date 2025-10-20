import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, StickyNote, Clock } from 'lucide-react';
import './Timeline.css';

export default function TimelineCard({ item }) {
  const isEvent = item.type === 'event';
  const Icon = isEvent ? Calendar : StickyNote;
  const color = isEvent ? 'var(--color-primary)' : 'var(--color-accent)';

  return (
    <motion.div
      className={`timeline-modern-card ${isEvent ? 'event' : 'note'}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="timeline-modern-icon" style={{ backgroundColor: color }}>
        <Icon size={18} />
      </div>

      <div className="timeline-modern-content">
        <h3>{item.title}</h3>
        <div className="timeline-meta">
          {item.startTime && (
            <span className="timeline-time">
              <Clock size={14} /> {item.startTime}
              {item.endTime ? ` - ${item.endTime}` : ''}
            </span>
          )}
          {item.flag && (
            <span className="timeline-location">
              <img src={item.flag} alt="" />
              <Link to={`/itinerarios/${item.destinationId}`}>
                {item.city}, {item.country}
              </Link>
            </span>
          )}
        </div>

        {isEvent && item.category && (
          <span className="timeline-category-badge">{item.category}</span>
        )}
      </div>
    </motion.div>
  );
}
