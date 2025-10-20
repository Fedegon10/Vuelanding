import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDestinations } from '../context/DestinationsContext';

import Modal from '../components/common/Modal';
import DeleteConfirmation from '../components/common/DeleteConfirmation';
import ToggleSwitch from '../components/reservations/ToggleSwitch';
import TransportCard from '../components/reservations/TransportCard';
import AccommodationCard from '../components/reservations/AccommodationCard';
import TicketCard from '../components/reservations/TicketCard';
import ItineraryEventForm from '../components/itineraries/ItineraryEventForm';
import '../components/reservations/Reservations.css';

function ReservesDetailPage() {
  const { destinationId } = useParams();
  const { destinations, deleteEvent } = useDestinations();
  
  const [activeTab, setActiveTab] = useState('Transporte');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const destination = useMemo(() => 
    (destinations || []).find(d => String(d.id) === String(destinationId)),
    [destinations, destinationId]
  );
  
  const reservations = useMemo(() => 
    (destination?.events || [])
      .filter(e => e.isReservation && e.category === activeTab)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [destination?.events, activeTab]
  );

  const openAddModal = () => {
    setEventToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (reservation) => {
    setEventToEdit(reservation);
    setIsFormModalOpen(true);
  };

  const requestDelete = (eventId) => {
    setEventToDelete(eventId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEvent(destination.id, eventToDelete);
      toast.success("Reserva eliminada ✅");
    }
    setIsConfirmModalOpen(false);
    setEventToDelete(null);
  };
  
  if (!destination) return <div className="page-container">Cargando...</div>;
  
  return (
    <div className="page-container reserves-detail-page">
      <Link to="/reservas" className="btn-secondary back-link">&larr; Volver</Link>

      <header className="page-header">
        <div>
          <h1>Reservas para {destination.city}</h1>
          <p>Gestiona la logística de tu viaje.</p>
        </div>
      </header>

      <div className="controls-bar">
        <ToggleSwitch 
          options={['Transporte', 'Alojamiento', 'Entradas']} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        <button className="btn-primary" onClick={openAddModal}>
          + Agregar {activeTab}
        </button>
      </div>

      <div className="reservation-list">
        {reservations.length > 0 ? (
          reservations.map(res => {
            const linkedFile = (destination.files || []).find(f => f.eventId === res.id);
            
            const props = { 
              file: linkedFile, 
              onEdit: () => openEditModal(res), 
              onDelete: () => requestDelete(res.id) 
            };

            if (res.category === 'Transporte') 
              return <TransportCard key={res.id} {...props} transport={res} />;
            if (res.category === 'Alojamiento') 
              return <AccommodationCard key={res.id} {...props} accommodation={res} />;
            if (res.category === 'Entradas') 
              return <TicketCard key={res.id} {...props} ticket={res} />;
            
            return null;
          })
        ) : (
          <p className="no-events-message card">
            No has añadido ninguna reserva de tipo '{activeTab}'.
          </p>
        )}
      </div>

      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={eventToEdit ? `Editar ${activeTab}` : `Añadir ${activeTab}`}
      >
        <ItineraryEventForm 
          destinationId={destinationId}
          destination={destination}
          eventToEdit={eventToEdit}
          selectedDate={destination.startDate}
          onFinished={() => setIsFormModalOpen(false)}
          defaultCategory={activeTab}
        />
      </Modal>

      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        title="Confirmar Eliminación"
      >
        <DeleteConfirmation 
          onConfirm={handleConfirmDelete} 
          onCancel={() => setIsConfirmModalOpen(false)} 
          message="¿Estás seguro de que quieres eliminar esta reserva?" 
        />
      </Modal>
    </div>
  );
}

export default ReservesDetailPage;