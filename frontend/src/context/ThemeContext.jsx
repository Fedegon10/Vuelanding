// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Detecta si está en modo standalone (instalada como app)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone;

  // 🔹 Función que actualiza la barra superior (notch) según el tema
  const updateStatusBarColor = (currentTheme) => {
    const meta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );
    if (!meta) return;

    // iOS no admite colores hex, solo: default | black | black-translucent
    // Por eso acompañamos con un fondo de body para el color real
    if (currentTheme === "dark") {
      meta.content = "black-translucent";
      document.documentElement.style.backgroundColor = "#0f111b";
      document.body.style.backgroundColor = "#0f111b";
    } else {
      meta.content = "default";
      document.documentElement.style.backgroundColor = "#ffffff";
      document.body.style.backgroundColor = "#ffffff";
    }
  };

  // 🔹 Efecto que aplica el tema y sincroniza localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Actualiza meta theme-color (Android + Safari)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0f111b" : "#ffffff"
      );
    }

    // Actualiza barra superior en PWA standalone (iOS)
    if (isStandalone) {
      updateStatusBarColor(theme);
    }
  }, [theme]);

  // 🔹 Cambiar tema
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
