// src/components/files/FileUploadForm.jsx

import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";

const CLOUDINARY_CLOUD_NAME = "dso5wotlg";
const CLOUDINARY_UPLOAD_PRESET = "Vuelanding";

function FileUploadForm({ destinations, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [linkToEvent, setLinkToEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");

  const resetForm = () => {
    setSelectedFile(null);
    setFileName("");
    setDestinationId("");
    setErrors({});
    setLinkToEvent(false);
    setSelectedEventId("");
  };

  const handleFileChange = (files) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setFileName(files[0].name.replace(/\.[^/.]+$/, ""));
      setErrors((prev) => ({ ...prev, file: null }));
    }
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e) => {
    handleDragEvents(e);
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!selectedFile) newErrors.file = "Debes seleccionar un archivo.";
    if (!fileName.trim())
      newErrors.name = "Debes ingresar un nombre para el archivo.";
    if (!destinationId) newErrors.destination = "Debes seleccionar un destino.";
    if (linkToEvent && !selectedEventId)
      newErrors.event = "Debes seleccionar un evento.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsUploading(true);
    const toastId = toast.loading("Subiendo archivo...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // ❌ LÍNEA ELIMINADA: Esta línea causaba el error 400
      // formData.append('access_mode', 'public');

      const isImage = selectedFile.type.startsWith("image/");
      const resourceType = isImage ? "image" : "raw";
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

      formData.append("resource_type", resourceType);

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error de Cloudinary:", errorData);
        throw new Error(
          `Cloudinary respondió con error ${response.status}: ${errorData.error.message}`
        );
      }

      const data = await response.json();
      let fileUrl = data.secure_url;

      if (fileUrl.endsWith(".pdf.pdf")) {
        fileUrl = fileUrl.slice(0, -4);
      }

      const newFileData = {
        id: Date.now().toString(),
        name: fileName,
        type: selectedFile.type,
        destinationId: destinationId,
        url: fileUrl,
        ...(linkToEvent && selectedEventId ? { eventId: selectedEventId } : {}),
      };

      onUploadSuccess(newFileData);

      toast.update(toastId, {
        render: "¡Archivo subido correctamente!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
      resetForm();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      toast.update(toastId, {
        render: "No se pudo subir el archivo. Revisa la consola.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const eventsForSelectedDestination = useMemo(() => {
    if (!destinationId) return [];
    const selectedDest = destinations.find((d) => d.id === destinationId);
    return (selectedDest?.events || [])
      .filter((event) => event.title)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [destinationId, destinations]);

  return (
    <form onSubmit={handleSubmit} className="destination-form" noValidate>
      <div
        className={`file-drop-zone ${isDragging ? "dragging" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEvents}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="file-input-hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        <label htmlFor="file-upload" className="file-drop-zone__label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>
            {selectedFile
              ? selectedFile.name
              : "Arrastra un archivo o haz clic"}
          </span>
        </label>
      </div>
      {errors.file && <p className="error-message">{errors.file}</p>}

      <div className="form-group">
        <label htmlFor="file-name">Nombre del archivo</label>
        <input
          type="text"
          id="file-name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Ej: Pasaporte escaneado"
          required
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="destination-select">Asociar a Destino</label>
        <select
          id="destination-select"
          value={destinationId}
          onChange={(e) => setDestinationId(e.target.value)}
          required
        >
          <option value="">Selecciona un destino...</option>
          {(destinations || []).map((dest) => (
            <option key={dest.id} value={dest.id}>
              {dest.city}, {dest.country}
            </option>
          ))}
        </select>
        {errors.destination && (
          <p className="error-message">{errors.destination}</p>
        )}
      </div>

      <div className="form-group-checkbox">
        <label className="switch">
          <input
            type="checkbox"
            checked={linkToEvent}
            onChange={() => setLinkToEvent(!linkToEvent)}
            disabled={!destinationId}
          />
          <span className="slider round"></span>
        </label>
        <span>Vincular a un evento (opcional)</span>
      </div>

      {linkToEvent && (
        <div className="form-group">
          <label htmlFor="event-select">Selecciona el Evento</label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={
              !destinationId || eventsForSelectedDestination.length === 0
            }
            required
          >
            <option value="">
              {!destinationId
                ? "Primero elige un destino"
                : eventsForSelectedDestination.length === 0
                ? "No hay eventos en este destino"
                : "Selecciona un evento..."}
            </option>
            {eventsForSelectedDestination.map((event) => (
              <option key={event.id} value={event.id}>
                {new Date(event.date + "T00:00:00").toLocaleDateString(
                  "es-ES",
                  { day: "2-digit", month: "short" }
                )}{" "}
                - {event.title}
              </option>
            ))}
          </select>
          {errors.event && <p className="error-message">{errors.event}</p>}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? "Subiendo..." : "Subir Archivo"}
        </button>
      </div>
    </form>
  );
}

export default FileUploadForm;
