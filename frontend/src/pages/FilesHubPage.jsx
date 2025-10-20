import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilesPage from './FilesPage';
import PersonalDocsPage from './PersonalDocsPage';
import '../components/files/FilesHub.css';

export default function FilesHubPage() {
  const [viewMode, setViewMode] = useState('choice'); // 'choice' | 'files' | 'personal'
  const [showUploadForm, setShowUploadForm] = useState(false); // ✅ Estado centralizado

  const handleGoBack = () => setViewMode('choice');

  const fadeSlide = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -25 },
    transition: { duration: 0.35, ease: 'easeInOut' },
  };

  const slideHorizontal = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.35, ease: 'easeInOut' },
  };

  // ✅ Creamos una función que renderiza AMBOS botones de control
  const renderControls = (uploadLabel) => (
    <div className="page-controls-container">
      <div className="back-link-wrapper">
        <button className="btn-secondary" onClick={handleGoBack}>
          ← Volver
        </button>
      </div>
      <div className="upload-toggle">
        <button
          className="btn-upload-toggle"
          onClick={() => setShowUploadForm(prev => !prev)}
        >
          {showUploadForm ? "Cancelar" : `+ ${uploadLabel}`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="files-hub-wrapper page-container">
      <AnimatePresence mode="wait">
        {/* === VISTA DE ELECCIÓN === */}
        {viewMode === 'choice' && (
          <motion.div key="choice" {...fadeSlide} className="files-choice-wrapper">
            <header className="page-header">
              <h1>Gestor de Archivos</h1>
              <p>Elige qué tipo de archivo deseas subir o consultar.</p>
            </header>
            <div className="files-choice-grid">
              <motion.div className="files-choice-card" whileHover={{ y: -5, boxShadow: '0 8px 18px rgba(0,0,0,0.1)' }} whileTap={{ scale: 0.97 }} onClick={() => setViewMode('files')}>
                <div className="files-choice-icon">📂</div>
                <h2>Archivos de Viaje</h2>
                <p>Sube documentos asociados a tus destinos o eventos de viaje.</p>
              </motion.div>
              <motion.div className="files-choice-card" whileHover={{ y: -5, boxShadow: '0 8px 18px rgba(0,0,0,0.1)' }} whileTap={{ scale: 0.97 }} onClick={() => setViewMode('personal')}>
                <div className="files-choice-icon">🗂️</div>
                <h2>Documentos Personales</h2>
                <p>Guarda documentos privados o personales cifrados con contraseña.</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* === VISTA DE ARCHIVOS DE VIAJE === */}
        {viewMode === 'files' && (
          <motion.div key="files" {...slideHorizontal}>
            <FilesPage 
              isHubView={true} 
              renderControls={() => renderControls("Subir archivo")}
              showUploadForm={showUploadForm}
              setShowUploadForm={setShowUploadForm}
            />
          </motion.div>
        )}

        {/* === VISTA DE DOCUMENTOS PERSONALES === */}
        {viewMode === 'personal' && (
          <motion.div key="personal" {...slideHorizontal}>
            <PersonalDocsPage 
              isHubView={true} 
              renderControls={() => renderControls("Subir documento")}
              showUploadForm={showUploadForm}
              setShowUploadForm={setShowUploadForm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}