import React, { useState } from "react";
import { useUser } from "../../context/UserContext";

function CreateUsernameForm() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { createUsername } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación simple
    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Solo se permiten letras, números y guiones bajos.");
      return;
    }

    setLoading(true);
    try {
      await createUsername(username.toLowerCase());
      // No necesitamos hacer nada más, el context se actualizará solo
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-username-form">
      <h4>Crea tu nombre de usuario</h4>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Nombre de usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu_usuario_unico"
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Usuario"}
        </button>
        {error && (
          <p className="error-text" style={{ marginTop: "1rem" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default CreateUsernameForm;
