import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { decryptFileContent, base64ToBlob } from '../../utils/crypto';
import PasswordPromptModal from './PasswordPromptModal';
import './PersonalDocs.css';

function DocPreview({ doc }) {
  if (doc.isProtected) return <div className="doc-preview-icon">🔒</div>;
  if (doc.type && doc.type.startsWith('image/')) {
    return <img src={doc.url} alt={doc.docType} className="doc-preview-image" />;
  }
  return <div className="doc-preview-icon">📄</div>;
}

function PersonalDocList({ documents, onDelete, onEdit, viewMode = "grid" }) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [docToOpen, setDocToOpen] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleFileClick = (doc) => {
    if (isDecrypting) return;
    if (doc.isProtected) {
      setDocToOpen(doc);
      setPasswordError('');
      setIsPromptOpen(true);
    } else {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePasswordSubmit = async (password) => {
    if (!docToOpen) return;

    setIsDecrypting(true);
    setPasswordError('');
    const toastId = toast.loading("Descifrando documento...");

    try {
      // ⚡️ abrir una ventana o pestaña en blanco *antes* del await
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const newTab = isIOS ? window.open('', '_blank') : null;

      const response = await fetch(docToOpen.url);
      if (!response.ok) throw new Error('No se pudo descargar el archivo.');
      const encryptedContent = await response.text();

      const decryptedBase64 = decryptFileContent(encryptedContent, password);
      const fileBlob = base64ToBlob(decryptedBase64, docToOpen.type);
      const blobUrl = URL.createObjectURL(fileBlob);

      if (isIOS) {
        // ✅ actualizamos la pestaña previamente abierta
        if (newTab) newTab.location = blobUrl;
      } else {
        // 💻 desktop/android normal
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
      }

      toast.update(toastId, {
        render: "¡Archivo abierto!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setIsPromptOpen(false);
      setDocToOpen(null);
    } catch (error) {
      console.error("Error al procesar archivo protegido:", error);
      setPasswordError('Contraseña incorrecta o el archivo está dañado.');
      toast.update(toastId, {
        render: "Error al descifrar ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  if (!documents || documents.length === 0) {
    return <p className="no-files-message">Aún no has subido ningún documento personal.</p>;
  }

  return (
    <>
      {viewMode === "grid" ? (
        <ul className="personal-doc-list">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="doc-item"
              onClick={() => handleFileClick(doc)}
              title={doc.name}
            >
              <div className="doc-preview-container">
                <DocPreview doc={doc} />
              </div>
              <div className="doc-footer">
                <span className="doc-badge">{doc.docType}</span>
                <div className="doc-actions">
                  <button
                    className="btn-icon"
                    onClick={(e) => { e.stopPropagation(); onEdit(doc); }}
                    title="Editar documento"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                    title="Eliminar documento"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="doc-list-view">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="doc-list-item"
              onClick={() => handleFileClick(doc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFileClick(doc)}
            >
              <div className="doc-list-info">
                {doc.isProtected ? (
                  <div className="doc-preview-icon">🔒</div>
                ) : doc.type && doc.type.startsWith('image/') ? (
                  <img src={doc.url} alt={doc.docType} className="doc-preview-thumb" />
                ) : (
                  <div className="doc-preview-icon">📄</div>
                )}
                <span className="doc-badge">{doc.docType}</span>
              </div>

              <div className="doc-list-actions">
                <button
                  className="btn-icon"
                  onClick={(e) => { e.stopPropagation(); onEdit(doc); }}
                  title="Editar documento"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                  title="Eliminar documento"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PasswordPromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
        isDecrypting={isDecrypting}
      />
    </>
  );
}

export default PersonalDocList;
