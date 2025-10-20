import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";
import { categorizedNavLinks } from "../config/navLinks";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import ModeSwitcher from "../components/layout/ModeSwitcher";
import { Moon, Sun, User, Users } from "lucide-react";
import "./MenuPage.css";

function MenuPage() {
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { userProfile } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categorizedNavLinks;

    const q = searchTerm.toLowerCase();
    const filtered = {};

    if (!categorizedNavLinks) return {};

    Object.keys(categorizedNavLinks).forEach((category) => {
      const links = categorizedNavLinks[category].filter((l) =>
        l.label.toLowerCase().includes(q)
      );
      if (links.length) filtered[category] = links;
    });
    return filtered;
  }, [searchTerm]);

  const profileLink = {
    id: "profile",
    label: "Mi Perfil",
    path: "/perfil",
    icon: <User size={28} />,
  };

  const inviteIcon = <Users size={28} />;

  return (
    <div className="menu-page-container">
      {/* --- Toggle de tema --- */}
      <div className="menu-theme-toggle">
        <label className="theme-switch">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <span className="switch-slider">
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          </span>
        </label>
        <span className="theme-label">
          {theme === "dark" ? "Modo oscuro" : "Modo claro"}
        </span>
      </div>

      {/* --- Header --- */}
      <header className="page-header">
        <h1>Todos los productos</h1>
      </header>

      {/* --- Barra de búsqueda --- */}
      <div className="search-bar-wrapper">
        <div className="search-field" role="search">
          <span className="search-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            aria-label="Buscar productos"
            placeholder="Buscar productos"
            className="menu-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Secciones del menú --- */}
      <div className="menu-sections-wrapper">
        {/* --- Sección de cuenta --- */}
        <section className="menu-section">
          <h2 className="menu-section-title">Herramientas de Cuenta</h2>
          <div className="menu-grid account-tools-grid">
            <Link to={profileLink.path} className="menu-grid-item">
              <div className="menu-grid-item__icon">{profileLink.icon}</div>
              <span className="menu-grid-item__label">{profileLink.label}</span>
            </Link>

            {userProfile?.username && (
              <div className="menu-grid-item" onClick={() => navigate("/")}>
                <div className="menu-grid-item__icon">{inviteIcon}</div>
                <span className="menu-grid-item__label">Invitar</span>
              </div>
            )}
          </div>
        </section>

        {/* --- Selector de modo (si aplica) --- */}
        {userProfile?.collaborativeSpaceId && <ModeSwitcher />}

        {/* --- Categorías --- */}
        {Object.keys(filteredCategories || {}).length > 0 ? (
          Object.keys(filteredCategories).map((category, idx) => (
            <section
              key={category}
              className="menu-section fade-in"
              style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
            >
              <h2 className="menu-section-title">{category}</h2>
              <div className="menu-grid">
                {filteredCategories[category].map((link) => (
                  <Link key={link.id} to={link.path} className="menu-grid-item">
                    <div className="menu-grid-item__icon">{link.icon}</div>
                    <span className="menu-grid-item__label">{link.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="no-results-message">
            No se encontraron resultados para “{searchTerm}”.
          </p>
        )}
      </div>

      {/* --- Botón de cerrar sesión --- */}
      <div className="menu-logout-section">
        <button onClick={handleLogout} className="menu-logout-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar sesión
        </button>
      </div>

      {/* --- Botón pequeño de recarga PWA --- */}
      <div className="menu-reload-section">
        <button
          onClick={() => window.location.reload(true)}
          className="menu-reload-button"
        >
          🔄 Actualizar versión
        </button>
      </div>
    </div>
  );
}

export default MenuPage;
