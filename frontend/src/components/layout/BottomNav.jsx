// src/components/layout/BottomNav.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { bottomNavLinks } from '../../config/navLinks';
import './Layout.css';

function BottomNav() {
  // Contenedor del portal (definido en public/index.html)
  const portalRoot = document.getElementById('bottom-nav-root');
  if (!portalRoot) return null;

  // Contenido del menú inferior
  const navContent = (
    <nav className="bottom-nav" aria-label="Navegación principal móvil">
      {bottomNavLinks.map(link => (
        <NavLink
          key={link.id}
          to={link.path}
          className={({ isActive }) =>
            isActive ? 'bottom-nav__link active' : 'bottom-nav__link'
          }
        >
          {link.icon}
          <span className="bottom-nav__label">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  // Renderizamos el menú fuera del flujo principal del body
  return createPortal(navContent, portalRoot);
}

export default BottomNav;
