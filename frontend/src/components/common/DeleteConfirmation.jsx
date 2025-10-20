import React from "react";
import "../destinations/Destinations.css";

function DeleteConfirmation({ onConfirm, onCancel, message }) {
  return (
    <div className="delete-confirmation">
      <p>{message}</p>
      <div className="delete-confirmation-actions">
        <button onClick={onCancel} className="btn-secondary cancel-btn">
          Cancelar
        </button>
        <button onClick={onConfirm} className="btn-danger modern-danger-btn">
          <span>🗑️</span> Sí, eliminar
        </button>
      </div>
    </div>
  );
}

export default DeleteConfirmation;
