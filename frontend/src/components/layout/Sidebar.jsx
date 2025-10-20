// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../../firebase-config";
import { signOut } from "firebase/auth";
import { allNavLinks } from "../../config/navLinks";
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun, User } from "lucide-react";
import ModeSwitcher from "./ModeSwitcher";
import "./Layout.css";

function Sidebar({ isCollapsed, onToggle }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const profileLink = {
    id: "profile",
    path: "/perfil",
    label: "Mi Perfil",
    icon: <User size={24} />,
  };

  return (
    <nav className="sidebar" aria-label="Barra lateral de navegación">
      {/* Header */}
      <div className="sidebar-header">
        <span className="logo-icon" aria-hidden>
          ✈️
        </span>
        <h2 className="logo-text">Vuelanding</h2>
      </div>

      {/* Nav */}
      <ul className="sidebar-nav">
        {allNavLinks.map((link) => (
          <li key={link.id} title={isCollapsed ? link.label : ""}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {link.icon}
              <span className="nav-link-text">{link.label}</span>
            </NavLink>
          </li>
        ))}

        {/* Mi Perfil */}
        <li title={isCollapsed ? profileLink.label : ""}>
          <NavLink
            to={profileLink.path}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {profileLink.icon}
            <span className="nav-link-text">{profileLink.label}</span>
          </NavLink>
        </li>
      </ul>

      {/* Modo (debajo del perfil) */}
      <div className="sidebar-mode-wrapper">
        <ModeSwitcher />
      </div>

      {/* Footer: tema + logout */}
      <div className="sidebar-footer">
        {/* Botón completo pulsable */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          title={
            isCollapsed ? (theme === "dark" ? "Modo oscuro" : "Modo claro") : ""
          }
        >
          <span className="switch-slider">
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </span>
          {!isCollapsed && (
            <span className="theme-label">
              {theme === "dark" ? "Modo oscuro" : "Modo claro"}
            </span>
          )}
        </button>

        {isCollapsed ? (
          <button
            onClick={handleLogout}
            className="nav-link logout-button-icon"
            title="Cerrar Sesión"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        ) : (
          <button onClick={handleLogout} className="logout-pill-button">
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Toggle sidebar */}
      <div className="sidebar-toggle-wrapper">
        <button
          onClick={onToggle}
          className="sidebar-toggle"
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;
