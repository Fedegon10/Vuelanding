import React, { useState } from 'react';
import { useDestinations } from '../context/DestinationsContext';
import PersonalDocUpload from '../components/personal_docs/PersonalDocUpload';
import PersonalDocList from '../components/personal_docs/PersonalDocList';
import Modal from '../components/common/Modal';
import DeleteConfirmation from '../components/common/DeleteConfirmation';
import PersonalDocEditForm from '../components/personal_docs/PersonalDocEditForm';
import { toast } from 'react-toastify';
import '../components/personal_docs/PersonalDocs.css';

function PersonalDocsPage({ isHubView = false, renderControls = null, showUploadForm, setShowUploadForm }) {
  const { personalDocs, addPersonalDoc, deletePersonalDoc, updatePersonalDoc } = useDestinations();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState(null);

  // El estado de showUploadForm ahora viene por props

  const requestDeleteDoc = (docId) => {
    setDocToDelete(docId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (docToDelete) {
      deletePersonalDoc(docToDelete);
      toast.success("Documento eliminado correctamente ✅", { autoClose: 3000 });
    }
    setIsConfirmModalOpen(false);
    setDocToDelete(null);
  };

  const handleUploadSuccess = (newDoc) => {
    addPersonalDoc(newDoc);
    if (setShowUploadForm) setShowUploadForm(false); // Usamos la función del padre
  };

  const requestEditDoc = (doc) => {
    setDocToEdit(doc);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = (updatedDoc) => {
    if (updatedDoc) {
      updatePersonalDoc(updatedDoc.id, { docType: updatedDoc.docType });
      toast.success("Documento actualizado 👍");
    }
    setIsEditModalOpen(false);
    setDocToEdit(null);
  };

  const pageContent = (
    <>
      {!isHubView && (
        <header className="page-hero">
          <div className="hero-icon">🗂️</div>
          <div className="hero-text">
            <h1>Documentos Personales</h1>
            <p>Arrastra o sube tus archivos y mantenlos protegidos y organizados.</p>
          </div>
        </header>
      )}
      
      {/* ✅ Renderizamos los controles que nos llegan por props */}
      {renderControls && renderControls()}

      {/* Si no estamos en Hub, mostramos el botón como antes */}
      {!isHubView && (
        <div className="upload-toggle">
          <button className="btn-upload-toggle" onClick={() => setShowUploadForm(p => !p)}>
            {showUploadForm ? "Cancelar" : "+ Subir documento"}
          </button>
        </div>
      )}
      
      {showUploadForm && (
        <div className="upload-section card">
          <h2>Subir Documento</h2>
          <PersonalDocUpload onUpload={handleUploadSuccess} />
        </div>
      )}

      <div className="view-toggle">
        <button className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>Tarjetas</button>
        <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>Lista</button>
      </div>

      <main className="list-section card">
        <h2>Mis Documentos</h2>
        <PersonalDocList documents={personalDocs} onDelete={requestDeleteDoc} onEdit={requestEditDoc} viewMode={viewMode} />
      </main>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Eliminación">
        <DeleteConfirmation onConfirm={handleConfirmDelete} onCancel={() => setIsConfirmModalOpen(false)} message="¿Seguro que deseas eliminar este documento?" />
      </Modal>
      
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Documento">
        <PersonalDocEditForm docToEdit={docToEdit} onFinished={handleConfirmEdit} />
      </Modal>
    </>
  );

  if (!isHubView) {
    return <div className="page-container personal-docs-page">{pageContent}</div>;
  }
  return pageContent;
}

export default PersonalDocsPage;