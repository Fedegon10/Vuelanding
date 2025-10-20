import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './SwipeableListItem.css';

const SwipeableListItem = ({ children, onEdit, onDelete, onClick }) => {
  const controls = useAnimation();
  const swipeThreshold = 70;
  const [hasDragged, setHasDragged] = useState(false);
  const startX = useRef(0);

  const handleDragStart = (event, info) => {
    startX.current = info.point.x;
    setHasDragged(false);
  };

  const handleDrag = (event, info) => {
    const deltaX = Math.abs(info.point.x - startX.current);
    // Si se mueve más de 8 px, ya no se considera tap
    if (deltaX > 8 && !hasDragged) {
      setHasDragged(true);
    }
  };

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // --- Swipe izquierda (eliminar) ---
    if (offset < -swipeThreshold || velocity < -600) {
      onDelete();
    }
    // --- Swipe derecha (editar) ---
    else if (offset > swipeThreshold || velocity > 600) {
      onEdit();
    }
    // --- Tap (solo si NO hubo desplazamiento) ---
    else if (!hasDragged) {
      if (onClick) onClick();
    }

    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  };

  return (
    <div className="swipeable-list-item-wrapper">
      <div className="swipeable-actions">
        <div className="swipe-action edit">
          <span>✏️</span>
          <span>Editar</span>
        </div>
        <div className="swipe-action delete">
          <span>🗑️</span>
          <span>Eliminar</span>
        </div>
      </div>

      <motion.div
        className="swipeable-content"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        dragElastic={0.25}
        dragMomentum={false}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableListItem;
