import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDestinations } from '../context/DestinationsContext';
import Modal from '../components/common/Modal';
import DeleteConfirmation from '../components/common/DeleteConfirmation';
import SwipeableListItem from '../components/common/SwipeableListItem'; // 1. Importar
import '../components/notes/NotesDetail.css';

// --- Formulario para crear/editar una nota (sin cambios) ---
function NoteForm({ destinationId, noteToEdit, onFinished }) {
  const { destinations, addNote, updateNote } = useDestinations();
  const destination = destinations.find(d => d.id === destinationId);
  const availableTags = destination?.noteTags || [];

  const [text, setText] = useState(noteToEdit?.text || '');
  const [selectedTags, setSelectedTags] = useState(noteToEdit?.tags || []);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('El contenido de la nota no puede estar vacío.');
      return;
    }
    const noteData = { text, tags: selectedTags };
    if (noteToEdit) {
      updateNote(destinationId, { ...noteToEdit, ...noteData });
    } else {
      addNote(destinationId, noteData);
    }
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit} className="note-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        rows="5"
      />
      <div className="form-group">
        <label>Etiquetas</label>
        <div className="tag-selector">
          {availableTags.map(tag => (
            <div
              key={tag}
              className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onFinished}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {noteToEdit ? 'Guardar Cambios' : 'Añadir Nota'}
        </button>
      </div>
    </form>
  );
}

// --- Modal para gestionar etiquetas (sin cambios) ---
function TagManagerModal({ destination, onFinished }) {
  const { addNoteTag, deleteNoteTag } = useDestinations();
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag && !(destination.noteTags || []).includes(newTag)) {
      addNoteTag(destination.id, newTag);
      setNewTag('');
    }
  };

  return (
    <div className="tag-manager">
      <ul className="tag-list">
        {(destination.noteTags || []).map(tag => (
          <li key={tag}>
            <span>{tag}</span>
            <button onClick={() => deleteNoteTag(destination.id, tag)}>&times;</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddTag} className="tag-add-form">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Nueva etiqueta"
        />
        <button type="submit" className="btn-primary">Añadir</button>
      </form>
    </div>
  );
}

// --- Página principal ---
function NoteDetailPage() {
  const { destinationId } = useParams();
  const { destinations, deleteNote, toggleNoteComplete } = useDestinations();
  const destination = destinations.find(d => d.id === destinationId);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const filteredNotes = useMemo(() => {
    if (!destination?.notes) return [];
    const sorted = [...destination.notes].sort((a, b) => a.completed - b.completed);
    if (activeFilter === 'Todas') return sorted;
    return sorted.filter(note => note.tags && note.tags.includes(activeFilter));
  }, [destination?.notes, activeFilter]);

  const handleAddNoteClick = () => {
    setNoteToEdit(null);
    setIsNoteModalOpen(true);
  };

  const handleEditNoteClick = (note) => {
    setNoteToEdit(note);
    setIsNoteModalOpen(true);
  };

  const requestDeleteNote = (noteId) => {
    setNoteToDelete(noteId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) deleteNote(destination.id, noteToDelete);
    setIsConfirmModalOpen(false);
    setNoteToDelete(null);
  };

  if (!destination) {
    return (
      <div className="page-container">
        <h1>Destino no encontrado</h1>
        <p>El destino que buscas no existe o ha sido eliminado.</p>
        <Link to="/notas" className="btn-primary">Volver a mis notas</Link>
      </div>
    );
  }

  return (
    <div className="page-container note-detail-page">
      <div className="back-link-wrapper">
        <Link to="/notas" className="btn-secondary">&larr; Volver a todos los destinos</Link>
      </div>

      <header className="page-header note-detail-header">
        <div>
          <h1>Notas para {destination.city}</h1>
          <p>Tus recomendaciones y recordatorios para {destination.country}.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setIsTagModalOpen(true)}>Gestionar Etiquetas</button>
          <button className="btn-primary" onClick={handleAddNoteClick}>+ Añadir Nota</button>
        </div>
      </header>

      <div className="note-filter-bar">
        <button onClick={() => setActiveFilter('Todas')} className={activeFilter === 'Todas' ? 'active' : ''}>Todas</button>
        {(destination.noteTags || []).map(tag => (
          <button key={tag} onClick={() => setActiveFilter(tag)} className={activeFilter === tag ? 'active' : ''}>{tag}</button>
        ))}
      </div>

      <div className="notes-section">
        {filteredNotes.length > 0 ? (
          // 2. Cambiamos 'ul' por 'div'
          <div className="notes-list">
            {filteredNotes.map(note => (
              // 3. Envolvemos cada nota con SwipeableListItem
              <SwipeableListItem
                key={note.id}
                onEdit={() => handleEditNoteClick(note)}
                onDelete={() => requestDeleteNote(note.id)}
              >
                <div className={`note-card ${note.completed ? 'completed' : ''}`}>
                  <div className="note-card-header" />
                  <div className="note-card-body">
                    <button
                      className="completed-toggle"
                      onClick={() => toggleNoteComplete(destination.id, note.id)}
                      title={note.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      {note.completed ? '✔' : ''}
                    </button>

                    <div className="note-main">
                      <p className="note-text">{note.text}</p>
                      <div className="note-tags">
                        {(note.tags || []).map(tag => (
                          <span key={tag} className="note-tag">{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* 4. El div de acciones con los botones se elimina de aquí */}
                  </div>
                </div>
              </SwipeableListItem>
            ))}
          </div>
        ) : (
          <p className="no-notes-message">No hay notas para el filtro seleccionado. ¡Añade una!</p>
        )}
      </div>

      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={noteToEdit ? 'Editar Nota' : 'Nueva Nota'}>
        <NoteForm destinationId={destination.id} noteToEdit={noteToEdit} onFinished={() => setIsNoteModalOpen(false)} />
      </Modal>

      <Modal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} title="Gestionar Etiquetas">
        <TagManagerModal destination={destination} onFinished={() => setIsTagModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <DeleteConfirmation
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
          message="¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer."
        />
      </Modal>
    </div>
  );
}

export default NoteDetailPage;