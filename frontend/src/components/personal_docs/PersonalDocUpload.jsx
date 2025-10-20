import React, { useState, useRef } from 'react';
import { encryptFile } from '../../utils/crypto';
import { toast } from 'react-toastify';

const CLOUDINARY_CLOUD_NAME = 'dso5wotlg';
const CLOUDINARY_UPLOAD_PRESET = 'Vuelanding';

function PersonalDocUpload({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [password, setPassword] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setErrors((prev) => ({ ...prev, file: null }));
    }
  };
  
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
  
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!selectedFile) {
      setErrors({ file: 'Debes seleccionar un archivo.' });
      return;
    }
    if (!docType.trim()) {
      setErrors({ docType: 'El tipo de documento es obligatorio.' });
      return;
    }
    if (isProtected && !password) {
      setErrors({ password: 'La contraseña es obligatoria para proteger el archivo.' });
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Procesando y subiendo documento...");

    try {
      let fileToUpload = selectedFile;
      if (isProtected) {
        toast.update(toastId, { render: "Cifrando documento..." });
        fileToUpload = await encryptFile(selectedFile, password);
      }
      
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;

      toast.update(toastId, { render: "Subiendo a la nube..." });
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('La subida del archivo a Cloudinary falló.');

      const data = await response.json();
      const fileUrl = data.secure_url;

      const newDoc = {
        name: selectedFile.name,
        docType,
        isProtected,
        type: selectedFile.type,
        url: fileUrl,
      };
      
      onUpload(newDoc);

      toast.update(toastId, { render: "¡Documento subido! 🎉", type: "success", isLoading: false, autoClose: 3000 });
      
      setSelectedFile(null); setDocType(''); setPassword(''); setIsProtected(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      console.error('Error en el proceso de subida:', error);
      toast.update(toastId, { render: "No se pudo subir el documento ❌", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="personal-doc-form centered-form" onSubmit={handleSubmit} onDragEnter={handleDrag}>
      <div className={`dropzone ${dragActive ? 'active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
          <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} className="file-input-hidden" />
          {isUploading ? <p>Subiendo...</p> : selectedFile ? <p><strong>{selectedFile.name}</strong></p> : <p>Arrastra tu archivo aquí o haz click para seleccionarlo</p>}
      </div>
      {errors.file && <p className="error-message">{errors.file}</p>}
      <div className="form-group">
        <label>Tipo de Documento</label>
        <input type="text" className="styled-input" value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="Ej: Pasaporte, DNI" />
        {errors.docType && <p className="error-message">{errors.docType}</p>}
      </div>
      <div className="form-group switch-group">
        <label className="switch"><input type="checkbox" checked={isProtected} onChange={() => setIsProtected(!isProtected)} /><span className="slider"></span></label>
        <span className="switch-label">Proteger con contraseña</span>
      </div>
      {isProtected && (
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" className="styled-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Introduce una contraseña" />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>
      )}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Procesando...' : 'Subir Documento'}
        </button>
      </div>
    </form>
  );
}

export default PersonalDocUpload;