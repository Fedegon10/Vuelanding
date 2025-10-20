import React from "react";

const AcceptIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const DeclineIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

function CollaborationInvite({ invitation, onAccept, onDecline }) {
  return (
    <div className="invitation-card">
      <p>
        <span>{invitation.fromUsername || "Alguien"}</span> te ha invitado a
        planificar un viaje.
      </p>
      <div className="invitation-actions">
        <button
          className="btn-icon btn-accept"
          onClick={() => onAccept(invitation)}
          aria-label="Aceptar invitación"
        >
          <AcceptIcon />
        </button>
        <button
          className="btn-icon btn-decline"
          onClick={() => onDecline(invitation)}
          aria-label="Rechazar invitación"
        >
          <DeclineIcon />
        </button>
      </div>
    </div>
  );
}

export default CollaborationInvite;
