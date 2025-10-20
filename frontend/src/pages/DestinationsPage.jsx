import React, { useState } from "react";
import { useDestinations } from "../context/DestinationsContext";
import DestinationList from "../components/destinations/DestinationList";
import Modal from "../components/common/Modal";
import DestinationForm from "../components/destinations/DestinationForm";
import DeleteConfirmation from "../components/common/DeleteConfirmation";
import "../components/destinations/Destinations.css";

function DestinationsPage() {
  const { destinations, deleteDestination, loading } = useDestinations();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState(null);
  const [destinationToEdit, setDestinationToEdit] = useState(null);

  const [viewMode, setViewMode] = useState("grid");

  const handleEditClick = (destination) => {
    setDestinationToEdit(destination);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDestinationToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteDestination(destinationToDelete);
    setIsConfirmModalOpen(false);
    setDestinationToDelete(null);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setDestinationToEdit(null);
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <div>
          <h1>Mis Destinos</h1>
          <p>Crea, edita y organiza todos tus próximos viajes.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setDestinationToEdit(null);
            setIsFormModalOpen(true);
          }}
          disabled={loading}
        >
          {loading ? "Cargando..." : "+ Agregar Destino"}
        </button>
      </header>

      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => setViewMode("grid")}
        >
          Tarjetas
        </button>
        <button
          className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
          onClick={() => setViewMode("list")}
        >
          Lista
        </button>
      </div>

      <DestinationList
        destinations={destinations}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        viewMode={viewMode}
      />

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={destinationToEdit ? "Editar Destino" : "Nuevo Destino"}
        extraClass="modal-destinations" // <-- Clase para posicionamiento
      >
        <DestinationForm
          destinationId={destinationToEdit ? destinationToEdit.id : null}
          onFinished={closeFormModal}
        />
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Eliminación"
        extraClass="modal-destinations" // <-- Clase para posicionamiento
      >
        <DeleteConfirmation
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
          message="¿Estás seguro de que quieres eliminar este destino? Esta acción no se puede deshacer."
        />
      </Modal>
    </div>
  );
}

export default DestinationsPage;
