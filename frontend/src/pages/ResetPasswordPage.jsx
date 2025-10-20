// src/pages/ResetPasswordPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../firebase-config";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import "./AuthPage.css"; // Reutilizaremos los estilos de la página de autenticación

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isValidCode, setIsValidCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionCode = searchParams.get("oobCode"); // Obtiene el código de la URL

  // Paso 1: Verificar que el código del enlace es válido
  useEffect(() => {
    if (!actionCode) {
      setError(
        "El enlace no es válido o ha expirado. Por favor, solicita uno nuevo."
      );
      setIsLoading(false);
      return;
    }

    verifyPasswordResetCode(auth, actionCode)
      .then((email) => {
        console.log("Código válido para el email:", email);
        setIsValidCode(true);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(
          "El enlace no es válido o ha expirado. Por favor, solicita uno nuevo."
        );
        setIsLoading(false);
      });
  }, [actionCode]);

  // Paso 2: Manejar el envío del formulario
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await confirmPasswordReset(auth, actionCode, password);
      setMessage(
        "¡Tu contraseña ha sido cambiada con éxito! Ya puedes iniciar sesión."
      );
      // Opcional: Redirigir al login después de unos segundos
      setTimeout(() => {
        navigate("/auth");
      }, 4000);
    } catch (error) {
      setError(
        "Ocurrió un error al cambiar la contraseña. El enlace puede haber expirado."
      );
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p>Verificando enlace...</p>;
    }

    if (!isValidCode || message) {
      return (
        <>
          <h2>Restablecer Contraseña</h2>
          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}
          <button className="link-button" onClick={() => navigate("/auth")}>
            Volver a Iniciar Sesión
          </button>
        </>
      );
    }

    return (
      <>
        <h2>Ingresa tu nueva contraseña</h2>
        <p>Asegúrate de que sea segura y la recuerdes.</p>
        <form onSubmit={handleResetSubmit}>
          <div className="input-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="input-group">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-primary">
            Cambiar Contraseña
          </button>
        </form>
      </>
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ gridColumn: "1 / -1" }}>
        <div className="auth-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
