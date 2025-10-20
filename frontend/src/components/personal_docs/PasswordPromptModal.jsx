import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import './PasswordPromptModal.css';

function PasswordPromptModal({ isOpen, onClose, onSubmit, error }) {
  const [password, setPassword] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      // Limpiar estado al cerrar
      setPassword('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
    // No limpiamos la contraseña aquí para que el usuario pueda reintentar si se equivoca
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contraseña Requerida">
      <form onSubmit={handleSubmit} className="password-prompt-form">
        <p>Este archivo está protegido. Ingresa la contraseña para verlo.</p>
        <div className="form-group">
          <label htmlFor="doc-password">Contraseña</label>
          <input
            ref={inputRef}
            type="password"
            id="doc-password"
            className="styled-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Desbloquear
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PasswordPromptModal;