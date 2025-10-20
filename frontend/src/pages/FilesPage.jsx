import React, { useState } from 'react';
import { useDestinations } from '../context/DestinationsContext';
import FileList from '../components/files/FileList';
import FileUploadForm from '../components/files/FileUploadForm';
import Modal from '../components/common/Modal';
import DeleteConfirmation from '../components/common/DeleteConfirmation';
import FileEditForm from '../components/files/FileEditForm';
import '../components/files/Files.css';

function FilesPage({ isHubView = false, renderControls = null, showUploadForm, setShowUploadForm }) {
  const { destinations, addFile, deleteFile, updateFile } = useDestinations();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fileToEdit, setFileToEdit] = useState(null);

  // El estado local de showUploadForm se elimina, ahora viene por props
  // const [showUploadForm, setShowUploadForm] = useState(false);

  const handleFileUpload = (fileData) => {
    if (fileData.destinationId) {
      addFile(String(fileData.destinationId), fileData);
      if (setShowUploadForm) setShowUploadForm(false); // Usamos la función del padre
    }
  };

  const requestDeleteFile = (destinationId, fileId) => {
    setFileToDelete({ destinationId, fileId });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      deleteFile(fileToDelete.destinationId, fileToDelete.fileId);
    }
    setIsConfirmModalOpen(false);
    setFileToDelete(null);
  };
  
  const requestEditFile = (file) => {
    setFileToEdit(file);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = (updatedFile) => {
    if (updatedFile) {
      updateFile(updatedFile.destinationId, updatedFile.id, { name: updatedFile.name });
    }
    setIsEditModalOpen(false);
    setFileToEdit(null);
  };

  const pageContent = (
    <>
      {!isHubView && (
        <header className="page-header files-header">
          <div className="files-header__content"><h1>📂 Archivos de Viaje</h1><p>Sube, organiza y accede a tus documentos importantes.</p></div>
        </header>
      )}

      {/* ✅ Renderizamos los controles que nos llegan por props */}
      {renderControls && renderControls()}

      {/* Si no estamos en Hub, mostramos el botón como antes */}
      {!isHubView && (
        <div className="upload-toggle">
          <button className="btn-upload-toggle" onClick={() => setShowUploadForm(p => !p)}>
            {showUploadForm ? "Cancelar" : "+ Subir archivo"}
          </button>
        </div>
      )}

      {showUploadForm && (
        <div className="upload-section card glass-card">
          <FileUploadForm destinations={destinations} onUploadSuccess={handleFileUpload} />
        </div>
      )}

      <div className="view-toggle">
        <button className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>Tarjetas</button>
        <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>Lista</button>
      </div>

      <main className="list-section card glass-card">
        <FileList destinations={destinations} onRequestDeleteFile={requestDeleteFile} onRequestEditFile={requestEditFile} viewMode={viewMode} />
      </main>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar eliminación">
        <DeleteConfirmation onConfirm={handleConfirmDelete} onCancel={() => setIsConfirmModalOpen(false)} message="¿Estás seguro de que quieres eliminar este archivo?" />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar nombre del archivo">
        <FileEditForm fileToEdit={fileToEdit} onFinished={handleConfirmEdit} />
      </Modal>
    </>
  );

  if (!isHubView) {
    return <div className="page-container files-page">{pageContent}</div>;
  }
  return pageContent;
}

export default FilesPage;