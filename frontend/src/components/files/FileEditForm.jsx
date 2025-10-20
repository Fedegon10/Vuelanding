import React, { useState, useEffect } from 'react';

function FileEditForm({ fileToEdit, onFinished }) {
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (fileToEdit) {
      setFileName(fileToEdit.name);
    }
  }, [fileToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    
    // Devolvemos el archivo actualizado
    onFinished({
      ...fileToEdit,
      name: fileName,
    });
  };

  if (!fileToEdit) return null;

  return (
    <form onSubmit={handleSubmit} className="destination-form">
      <div className="form-group">
        <label htmlFor="edit-file-name">Nombre del archivo</label>
        <input
          type="text"
          id="edit-file-name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Ej: Pasaporte escaneado"
          required
        />
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={() => onFinished(null)}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}

export default FileEditForm;