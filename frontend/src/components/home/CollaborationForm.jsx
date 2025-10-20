import React, { useState } from "react";
import { Link } from "react-router-dom";

function CollaborationForm({ onSubmit, error, userProfile }) {
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (identifier.trim()) {
      onSubmit(identifier.trim());
    }
  };

  if (userProfile?.collaborativeSpaceId) {
    return (
      <div className="collaboration-form">
        <h2>Ya estás en un viaje colaborativo</h2>
        <p>
          Actualmente estás planeando un viaje con otra persona. Para invitar a
          alguien nuevo, primero debes{" "}
          <Link to="/perfil">salir de tu viaje actual</Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="collaboration-form">
      <h2>Planifica un viaje con alguien</h2>
      <p>
        Ingresa el nombre de usuario o email de la persona que quieres invitar.
        Ambos podrán ver y editar los mismos destinos, itinerarios y gastos.
      </p>
      <div className="input-group">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="nombredeusuario o email@ejemplo.com"
          required
        />
      </div>
      <button type="submit" className="btn-primary">
        Enviar Invitación
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}

export default CollaborationForm;
