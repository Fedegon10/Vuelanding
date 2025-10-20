import React from "react";
import "./Loader.css";

function Loader({ message = "Cargando..." }) {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p className="loader-message">{message}</p>

      {/* Skeleton demo */}
      <div className="skeleton-list">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    </div>
  );
}

export default Loader;
