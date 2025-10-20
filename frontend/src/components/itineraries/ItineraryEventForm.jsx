import React, { useState, useEffect, useCallback } from 'react';
import { useDestinations } from '../../context/DestinationsContext';
import CustomDatePicker from '../common/CustomDatePicker';
import ReservationFields from './ReservationFields';
import { toast } from 'react-toastify';

const types = [ 'Otros', 'Tour', 'Museo', 'Restaurante', 'Actividad', 'Cultural', 'Histórico', 'Religioso', 'Urbano', 'Gastronomía', 'Compras', 'Monumento' ];
const reservationCategories = ['Transporte', 'Alojamiento', 'Entradas'];

// === CONFIG CLOUDINARY ===
const CLOUDINARY_CLOUD_NAME = 'dso5wotlg';
const CLOUDINARY_UPLOAD_PRESET = 'Vuelanding';

const FormStep = ({ step, title, children, currentStep, setCurrentStep }) => (
  <div className={`form-step ${currentStep === step ? 'active' : ''}`}>
    <div className="form-step-header" onClick={() => setCurrentStep(step)}>
      <span className="step-number">{step}</span>
      <h3 className="step-title">{title}</h3>
      <span className="step-arrow">{currentStep === step ? '▲' : '▼'}</span>
    </div>
    <div className="form-step-content">{children}</div>
  </div>
);

function ItineraryEventForm({ destinationId, destination, eventToEdit, selectedDate, onFinished, defaultCategory }) {
  const [currentStep, setCurrentStep] = useState(1);
  const { addOrUpdateEventWithFile } = useDestinations();

  const getInitialFormData = () => ({
    title: '',
    date: selectedDate || '',
    startTime: '',
    endTime: '',
    isReservation: false,
    category: '',
    type: 'Otros',
    origin: '',
    destination: '',
    price: '',
    address: '',
    checkInDate: '',
    checkOutDate: '',
    location: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [attachFile, setAttachFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Inicialización
  useEffect(() => {
    const isReservationContext = window.location.pathname.includes('/reservas');
    if (eventToEdit) {
      setFormData(prev => ({
        ...getInitialFormData(),
        date: selectedDate,
        ...eventToEdit,
      }));
    } else {
      setFormData({
        ...getInitialFormData(),
        date: selectedDate,
        isReservation: isReservationContext,
        category: isReservationContext ? (defaultCategory || 'Transporte') : '',
      });
    }
  }, [eventToEdit, selectedDate, defaultCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const newState = { ...prev, [name]: val };
      if (name === 'checkInDate' || name === 'departureDate') {
        newState.date = val;
      } else if (name === 'date' && newState.isReservation) {
        if (newState.category === 'Alojamiento') newState.checkInDate = val;
        if (newState.category === 'Transporte') newState.departureDate = val;
      }
      return newState;
    });
  };

  const handleFileChange = (files) => {
    if (files && files[0]) setSelectedFile(files[0]);
  };

  const handleDragEvents = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragEnter = useCallback((e) => { handleDragEvents(e); setIsDragging(true); }, [handleDragEvents]);
  const handleDragLeave = useCallback((e) => { handleDragEvents(e); setIsDragging(false); }, [handleDragEvents]);
  const handleDrop = useCallback((e) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleDragEvents]);

  // --- 🔥 SUBIDA DIRECTA A CLOUDINARY ---
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Error al subir archivo');
    const data = await res.json();
    return { url: data.secure_url, name: file.name };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('El título es obligatorio.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(eventToEdit ? "Actualizando evento..." : "Guardando evento...");

    const finalData = { ...formData };

    try {
      // 🚀 Subida a Cloudinary si corresponde
      if (attachFile && selectedFile) {
        const uploaded = await uploadToCloudinary(selectedFile);
        finalData.fileUrl = uploaded.url;
        finalData.fileName = uploaded.name;
      }

      // Guardar evento
      await addOrUpdateEventWithFile(destinationId, finalData, null);

      toast.update(toastId, {
        render: `¡Evento ${eventToEdit ? 'actualizado' : 'guardado'}! 🎉`,
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
      onFinished();
    } catch (error) {
      console.error("¡ERROR AL GUARDAR EVENTO!", error);
      toast.update(toastId, {
        render: "Error al guardar o subir archivo ❌",
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const showGenericDateField = !formData.isReservation || formData.category === 'Entradas' || !formData.category;
  const isEditing = !!eventToEdit;
  const existingFile = isEditing ? (destination.files || []).find(f => f.eventId === eventToEdit.id) : null;
  const goToNextStep = () => { setCurrentStep(prev => prev + 1); };

  return (
    <form onSubmit={handleSubmit} className="itinerary-form multi-step" noValidate>
      <FormStep step={1} title="Información Básica" currentStep={currentStep} setCurrentStep={setCurrentStep}>
        <div className="form-group">
          <label>Título del Evento / Reserva</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group switch-group">
          <label className="switch">
            <input type="checkbox" name="isReservation" checked={formData.isReservation} onChange={handleChange} />
            <span className="slider"></span>
          </label>
          <span className="switch-label">Es una reserva (vuelo, hotel, entrada)</span>
        </div>
        {!formData.isReservation && (
          <div className="form-group">
            <label>Tipo de Actividad</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              {types.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
        )}
        <button type="button" className="btn-next-step" onClick={goToNextStep}>Siguiente</button>
      </FormStep>

      {formData.isReservation && (
        <FormStep step={2} title="Detalles de la Reserva" currentStep={currentStep} setCurrentStep={setCurrentStep}>
          <div className="form-group">
            <label>Categoría de Reserva</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Selecciona una categoría...</option>
              {reservationCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <ReservationFields category={formData.category} formData={formData} handleChange={handleChange} destination={destination} />
          <button type="button" className="btn-next-step" onClick={goToNextStep}>Siguiente</button>
        </FormStep>
      )}

      <FormStep step={formData.isReservation ? 3 : 2} title="Fecha y Hora" currentStep={currentStep} setCurrentStep={setCurrentStep}>
        {showGenericDateField && (
          <div className="form-group">
            <label>Fecha</label>
            <CustomDatePicker type="date" name="date" value={formData.date} onChange={handleChange} min={destination.startDate} max={destination.endDate} />
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label>Hora de Inicio (Opcional)</label>
            <CustomDatePicker type="time" name="startTime" value={formData.startTime} onChange={handleChange} placeholder="HH:MM" />
          </div>
          <div className="form-group">
            <label>Hora de Fin (Opcional)</label>
            <CustomDatePicker type="time" name="endTime" value={formData.endTime} onChange={handleChange} placeholder="HH:MM" />
          </div>
        </div>
        <button type="button" className="btn-next-step" onClick={goToNextStep}>Siguiente</button>
      </FormStep>

      {!existingFile && (
        <FormStep step={formData.isReservation ? 4 : 3} title="Archivo Adjunto (Opcional)" currentStep={currentStep} setCurrentStep={setCurrentStep}>
          <div className="form-group switch-group">
            <label className="switch">
              <input
                type="checkbox"
                checked={attachFile}
                onChange={(e) => {
                  setAttachFile(e.target.checked);
                  if (!e.target.checked) setSelectedFile(null);
                }}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label">Adjuntar un archivo</span>
          </div>
          {attachFile && (
            <div className="form-group">
              <div
                className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragEvents}
                onDrop={handleDrop}
              >
                <input type="file" id="event-file-upload" className="file-input-hidden" onChange={(e) => handleFileChange(e.target.files)} />
                <label htmlFor="event-file-upload" className="file-drop-zone__label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <span>{selectedFile ? selectedFile.name : 'Arrastra un archivo o haz clic'}</span>
                </label>
              </div>
            </div>
          )}
        </FormStep>
      )}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onFinished}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Guardando...' : 'Guardar Evento'}
        </button>
      </div>
    </form>
  );
}

export default ItineraryEventForm;
