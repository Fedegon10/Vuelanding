import React, { useState } from "react";
import SwipeableListItem from "../common/SwipeableListItem";

function FilePreview({ file }) {
  if (file.type && file.type.startsWith("image/")) {
    return (
      <img src={file.url} alt={file.name} className="file-preview-image" />
    );
  }
  return <div className="file-preview-icon">📄</div>;
}

function FileList({
  destinations,
  onRequestDeleteFile,
  onRequestEditFile,
  viewMode = "grid",
}) {
  const [openAccordion, setOpenAccordion] = useState(
    destinations && destinations.length > 0 ? destinations[0].id : null
  );

  const toggleAccordion = (id) =>
    setOpenAccordion(openAccordion === id ? null : id);

  // ✅ FUNCIÓN CORREGIDA Y SIMPLIFICADA
  // Esta simple línea le pasa la URL al navegador, y él se encarga de
  // previsualizar imágenes, PDFs, o descargar otros tipos de archivo.
  const handleOpenFile = (file, e) => {
    e?.stopPropagation();
    if (file?.url) {
      window.open(file.url, "_blank", "noopener,noreferrer");
    }
  };

  if (!destinations || destinations.length === 0) {
    return (
      <p className="no-files-message">
        Aún no has creado ningún destino para asociar archivos.
      </p>
    );
  }

  return (
    <div className="file-accordion">
      {destinations.map((dest) => (
        <div key={dest.id} className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => toggleAccordion(dest.id)}
          >
            <div className="accordion-title">
              {dest.countryCode && (
                <img
                  src={`https://flagcdn.com/w20/${dest.countryCode.toLowerCase()}.png`}
                  alt={`Bandera de ${dest.country}`}
                  className="flag-icon"
                />
              )}
              <span>
                {dest.city}, {dest.country}
              </span>
            </div>
            <span
              className={`accordion-icon ${
                openAccordion === dest.id ? "open" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {openAccordion === dest.id && (
            <div className="accordion-content">
              {dest.files?.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="file-grid">
                    {dest.files.map((file) => (
                      <div
                        key={file.id}
                        className="file-card"
                        onClick={(e) => handleOpenFile(file, e)}
                        title={file.name}
                      >
                        <div className="file-preview-container">
                          <FilePreview file={file} />
                        </div>
                        <div className="file-info-bar">
                          <span className="file-name">{file.name}</span>
                          <div className="file-card-actions">
                            <button
                              className="btn-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestEditFile({
                                  ...file,
                                  destinationId: dest.id,
                                });
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestDeleteFile(dest.id, file.id);
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="file-list-view">
                    {dest.files.map((file) => (
                      <div
                        key={file.id}
                        className="file-list-item"
                        role="button"
                        tabIndex={0}
                      >
                        <SwipeableListItem
                          onEdit={() =>
                            onRequestEditFile({
                              ...file,
                              destinationId: dest.id,
                            })
                          }
                          onDelete={() => onRequestDeleteFile(dest.id, file.id)}
                        >
                          <div
                            className="file-list-inner"
                            onClick={(e) => handleOpenFile(file, e)}
                          >
                            <span className="file-list-icon">📄</span>
                            <span className="file-list-name">{file.name}</span>
                          </div>
                        </SwipeableListItem>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="no-files-message">
                  No hay archivos para este destino.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FileList;
