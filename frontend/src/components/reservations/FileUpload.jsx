import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import './FileUpload.css';

// --- CONFIGURACIÓN DE CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = 'dso5wotlg'; // Tu Cloud Name
const CLOUDINARY_UPLOAD_PRESET = 'Vuelanding'; // Tu Upload Preset

function FileUpload({ onUploadSuccess, existingFile }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      triggerUpload(files[0]); // Subir automáticamente al seleccionar
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const triggerUpload = async (fileToUpload) => {
    if (!fileToUpload) return;

    setIsUploading(true);
    const toastId = toast.loading("Subiendo archivo...");

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('La subida del archivo falló.');

      const data = await response.json();
      
      onUploadSuccess(data.secure_url, fileToUpload.name); 

      toast.update(toastId, {
        render: "¡Archivo adjuntado! 🎉",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setSelectedFile(null);

    } catch (error) {
      console.error('Error al subir a Cloudinary:', error);
      toast.update(toastId, {
        render: "No se pudo subir el archivo ❌",
        type: "error",
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`dropzone ${dragActive ? 'active' : ''}`} 
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop} 
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => handleFiles(e.target.files)} 
          className="file-input-hidden" 
          disabled={isUploading}
        />
        {isUploading 
          ? <p>Subiendo...</p> 
          : existingFile
            ? <p>Archivo adjunto: <strong>{existingFile.name}</strong> (click para reemplazar)</p>
            : <p>Arrastra un archivo o haz click para seleccionar</p>}
      </div>
    </div>
  );
}

export default FileUpload;