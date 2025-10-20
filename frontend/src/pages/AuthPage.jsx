import React, { useState, useEffect } from "react";
import { auth } from "../firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile, // Necesario para añadir el nombre de usuario
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchDestinationCoverImage } from "../services/apiService";
import "./AuthPage.css";

// --- Icono de Google ---
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.93H12.29V14.5H18.2C17.93 16.03 17.06 17.34 15.75 18.23V21.1H19.78C21.62 19.33 22.56 16.03 22.56 12.25Z"
      fill="#4285F4"
    />
    <path
      d="M12.29 23C15.42 23 18.04 21.96 19.78 20.1L15.75 18.23C14.73 18.89 13.61 19.25 12.29 19.25C9.64 19.25 7.4 17.56 6.57 15.1H2.49V17.99C4.28 20.93 8.04 23 12.29 23Z"
      fill="#34A853"
    />
    <path
      d="M6.57 15.1C6.34 14.44 6.21 13.73 6.21 13C6.21 12.27 6.34 11.56 6.57 10.9H2.49C1.72 12.43 1.25 14.1 1.25 16C1.25 17.9 1.72 19.57 2.49 21.1L6.57 18.01C6.34 17.36 6.21 16.65 6.21 16C6.21 15.27 6.34 14.56 6.57 13.9H2.49V11.01L6.57 15.1Z"
      fill="#FBBC05"
    />
    <path
      d="M12.29 6.75C13.77 6.75 15.03 7.25 15.98 8.12L19.87 4.23C18.04 2.56 15.42 1.5 12.29 1.5C8.04 1.5 4.28 3.57 2.49 6.51L6.57 9.4C7.4 6.94 9.64 5.25 12.29 5.25V6.75Z"
      fill="#EA4335"
    />
  </svg>
);

function AuthPage() {
  const [authMode, setAuthMode] = useState("login"); // 'login', 'signup', 'reset'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const navigate = useNavigate();

  // --- Efecto para cargar imagen de fondo ---
  useEffect(() => {
    const getBackgroundImage = async () => {
      try {
        const cities = [
          "Kyoto",
          "Santorini",
          "Patagonia",
          "Reykjavik",
          "Bora Bora",
        ];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const imageUrl = await fetchDestinationCoverImage(randomCity, "travel");
        setBackgroundImage(imageUrl || "");
      } catch {
        setBackgroundImage("");
      }
    };
    getBackgroundImage();
  }, []);

  // --- Limpiar mensajes y campos al cambiar de modo ---
  useEffect(() => {
    setError("");
    setMessage("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
  }, [authMode]);

  // --- Manejador para Login y Registro ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (authMode === "signup") {
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
    }

    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      navigate("/destinos");
    } catch (err) {
      setError("El correo o la contraseña son incorrectos.");
    }
  };

  // --- Manejador para Reseteo de Contraseña ---
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Se ha enviado un enlace de recuperación a tu correo.");
    } catch (err) {
      setError(
        "No se pudo enviar el correo. Verifica que la dirección sea correcta."
      );
    }
  };

  // --- Manejador para Login con Google ---
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/destinos");
    } catch (err) {
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  // --- Renderizado Condicional del Formulario ---
  const renderFormContent = () => {
    // --- VISTA: RECUPERAR CONTRASEÑA ---
    if (authMode === "reset") {
      return (
        <>
          <h2>Recuperar Contraseña</h2>
          <p>Ingresa tu correo para recibir un enlace de recuperación.</p>
          <form onSubmit={handlePasswordReset}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ejemplo@email.com"
                autoComplete="email"
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}
            <button type="submit" className="btn-primary">
              Enviar Enlace
            </button>
          </form>
          <button
            className="link-button"
            type="button"
            onClick={() => setAuthMode("login")}
          >
            Volver a Iniciar Sesión
          </button>
        </>
      );
    }

    // --- VISTA: LOGIN Y REGISTRO ---
    return (
      <>
        <h2>
          {authMode === "login"
            ? "Bienvenido de nuevo 👋"
            : "Crea tu cuenta ✈️"}
        </h2>
        <p>
          {authMode === "login"
            ? "Ingresa tus datos para continuar"
            : "Completa el formulario para empezar"}
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="btn-google"
          type="button"
        >
          <GoogleIcon /> Continuar con Google
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <form onSubmit={handleAuthSubmit}>
          {authMode === "signup" && (
            <div className="input-group">
              <label>Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@email.com"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete={
                authMode === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          {authMode === "signup" && (
            <div className="input-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          {authMode === "login" && (
            <div className="forgot-password-link">
              <button type="button" onClick={() => setAuthMode("reset")}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary">
            {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>

        <button
          className="link-button"
          type="button"
          onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
        >
          {authMode === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia Sesión"}
        </button>
      </>
    );
  };

  return (
    <div className="auth-container">
      <div
        className="auth-image"
        style={
          backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}
        }
      >
        <div className="auth-overlay" />
        <div className="auth-branding">
          <h1>Vuelanding</h1>
          <p>Tu próxima aventura comienza hoy.</p>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-content">{renderFormContent()}</div>
      </div>
    </div>
  );
}

export default AuthPage;
