import React, { useState, useEffect } from 'react';

function PersonalDocEditForm({ docToEdit, onFinished }) {
  const [docType, setDocType] = useState('');

  useEffect(() => {
    if (docToEdit) {
      setDocType(docToEdit.docType);
    }
  }, [docToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docType.trim()) return;

    onFinished({
      ...docToEdit,
      docType: docType,
    });
  };

  if (!docToEdit) return null;

  return (
    <form onSubmit={handleSubmit} className="personal-doc-form">
      <div className="form-group">
        <label htmlFor="edit-doc-type">Tipo de Documento</label>
        <input
          type="text"
          id="edit-doc-type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          placeholder="Ej: Pasaporte, DNI"
          required
          className="styled-input"
        />
      </div>
      
      <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
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

export default PersonalDocEditForm;