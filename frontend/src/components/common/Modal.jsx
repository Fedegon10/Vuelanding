import React, { useEffect, useCallback, useRef, useId, useState } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, extraClass }) {
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);
  const titleId = useId();
  const [visible, setVisible] = useState(isOpen);

  /* =========================================================
     MANEJO DE BLOQUEO DE SCROLL Y VISIBILIDAD
     ========================================================= */
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.documentElement.classList.add('body--lock');
      document.body.classList.add('body--lock');
    } else if (visible) {
      const timeout = setTimeout(() => setVisible(false), 250);
      document.documentElement.classList.remove('body--lock');
      document.body.classList.remove('body--lock');
      return () => clearTimeout(timeout);
    }
  }, [isOpen, visible]);

  /* =========================================================
     ESCAPE KEY PARA CERRAR
     ========================================================= */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  /* =========================================================
     FIX: FORZAR POSICIONAMIENTO RELATIVO AL VIEWPORT
     ========================================================= */
  useEffect(() => {
    if (isOpen) {
      const modalNode = document.querySelector('.modal-overlay');
      if (modalNode) {
        modalNode.style.position = 'fixed';
        modalNode.style.top = '0';
        modalNode.style.left = '0';
        modalNode.style.width = '100vw';
        modalNode.style.height = '100vh';
        modalNode.style.transform = 'none';
        modalNode.style.margin = '0';
        modalNode.style.padding = '0';
        modalNode.style.justifyContent = 'center';
        modalNode.style.alignItems = 'center';
      }
    }
  }, [isOpen]);

  if (!visible) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  /* =========================================================
     ESTRUCTURA DEL MODAL
     ========================================================= */
  const modalElement = (
    <div
      ref={overlayRef}
      className={`modal-overlay ${extraClass || ''} ${isOpen ? 'open' : 'closing'}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className={`modal-content ${isOpen ? 'open' : 'closing'}`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="modal-header">
          {title ? <h2 id={titleId}>{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Cerrar"
            ref={closeBtnRef}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );

  /* =========================================================
     PORTAL: SE RENDERIZA EN EL BODY (fuera de cualquier transform)
     ========================================================= */
  return ReactDOM.createPortal(modalElement, document.body);
}
