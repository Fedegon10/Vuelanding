import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDestinations } from '../context/DestinationsContext';
import Modal from '../components/common/Modal';
import '../components/notes/Notes.css';

// --- Iconos y Variantes (sin cambios) ---
const FolderIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> );
const NoteBookIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H19"></path><path d="M20 2H6.5A2.5 2.5 0 0 0 4 4.5v15"></path><path d="M8 18h.01"></path></svg> );
const pageVariants = { initial: { opacity: 0, y: 25 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -25 } };
const transition = { type: 'tween', ease: 'anticipate', duration: 0.25 };

function PersonalNoteForm({ noteToEdit, onSave, onClose, availableTags }) {
  const [text, setText] = useState(noteToEdit?.text || '');
  const [selectedTags, setSelectedTags] = useState(noteToEdit?.tags || []);
  const handleTagToggle = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return alert('La nota no puede estar vacía.');
    const noteData = noteToEdit
      ? { id: noteToEdit.id, text, tags: selectedTags, completed: noteToEdit.completed }
      : { id: Date.now().toString(), text, tags: selectedTags, completed: false };
    onSave(noteData);
    onClose();
  };
  return ( <form onSubmit={handleSubmit} className="note-form"> <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu nota personal aquí..." rows="5" /> <div className="form-group"> <label>Etiquetas</label> <div className="tag-selector"> {availableTags.map(tag => ( <div key={tag} className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`} onClick={() => handleTagToggle(tag)}> {tag} </div> ))} </div> </div> <div className="form-actions"> <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button> <button type="submit" className="btn-primary">{noteToEdit ? 'Guardar Cambios' : 'Añadir Nota'}</button> </div> </form> );
}

function PersonalTagManager({ tags, onAddTag, onDeleteTag }) {
  const [newTag, setNewTag] = useState('');
  const handleAdd = (e) => {
    e.preventDefault();
    if (newTag && !tags.includes(newTag)) {
      onAddTag(newTag);
      setNewTag('');
    }
  };
  return ( <div className="tag-manager"> <ul className="tag-list"> {tags.map(tag => ( <li key={tag}><span>{tag}</span><button onClick={() => onDeleteTag(tag)}>&times;</button></li> ))} </ul> <form onSubmit={handleAdd} className="tag-add-form"> <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Nueva etiqueta" /> <button type="submit" className="btn-primary">Añadir</button> </form> </div> );
}

export default function NotesPage() {
  const { 
    destinations, personalNotes, personalNoteTags,
    addPersonalNote, updatePersonalNote, deletePersonalNote, togglePersonalNoteComplete,
    addPersonalNoteTag, deletePersonalNoteTag
  } = useDestinations();

  const [viewMode, setViewMode] = useState('choice');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  
  // ✅ 1. AÑADIMOS EL ESTADO PARA EL FILTRO ACTIVO
  const [activeFilter, setActiveFilter] = useState('Todas');

  const handleSavePersonalNote = (noteData) => {
    if (noteToEdit) {
      // Al actualizar, solo pasamos los campos que pueden cambiar
      updatePersonalNote(noteData.id, { text: noteData.text, tags: noteData.tags });
    } else {
      addPersonalNote(noteData);
    }
  };

  // ✅ 2. ACTUALIZAMOS LA LÓGICA DE FILTRADO
  const filteredNotes = useMemo(() => {
    const sorted = [...personalNotes].sort((a, b) => a.completed - b.completed);
    if (activeFilter === 'Todas') {
      return sorted;
    }
    return sorted.filter(note => note.tags && note.tags.includes(activeFilter));
  }, [personalNotes, activeFilter]);

  return (
    <AnimatePresence mode="wait">
      {viewMode === 'choice' && (
        <motion.div key="choice" className="page-container notes-choice" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition}>
          <header className="page-header"><h1>Mis Notas</h1><p>Elige el tipo de notas que deseas ver.</p></header>
          <div className="notes-choice-grid">
            <motion.div className="notes-choice-card" whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} transition={{ duration: 0.2 }} onClick={() => setViewMode('personal')}>
              <div className="notes-choice-icon"><NoteBookIcon /></div>
              <h2>Notas Personales</h2><p>Guarda ideas o pendientes que no pertenecen a un destino específico.</p>
            </motion.div>
            <motion.div className="notes-choice-card" whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} transition={{ duration: 0.2 }} onClick={() => setViewMode('destinations')}>
              <div className="notes-choice-icon"><FolderIcon /></div>
              <h2>Notas por Destino</h2><p>Organiza tus notas dentro de cada viaje o ciudad visitada.</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {viewMode === 'personal' && (
        <motion.div key="personal" className="page-container note-detail-page" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition}>
          <div className="back-link-wrapper"><button className="btn-secondary" onClick={() => setViewMode('choice')}>← Volver</button></div>
          <header className="page-header note-detail-header">
            <div><h1>Notas Personales</h1><p>Guarda tus ideas, pendientes o recordatorios personales.</p></div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => setIsTagModalOpen(true)}>Gestionar Etiquetas</button>
              <button className="btn-primary" onClick={() => { setNoteToEdit(null); setIsNoteModalOpen(true); }}>+ Añadir Nota</button>
            </div>
          </header>

          {/* ✅ 3. AÑADIMOS LA BARRA DE FILTROS */}
          <div className="note-filter-bar">
            <button onClick={() => setActiveFilter('Todas')} className={activeFilter === 'Todas' ? 'active' : ''}>Todas</button>
            {personalNoteTags.map(tag => (
              <button key={tag} onClick={() => setActiveFilter(tag)} className={activeFilter === tag ? 'active' : ''}>{tag}</button>
            ))}
          </div>

          <motion.div className="notes-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {filteredNotes.length > 0 ? (
              <motion.div layout className="notes-list">
                {filteredNotes.map(note => (
                  <motion.div key={note.id} className={`note-card ${note.completed ? 'completed' : ''}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    <div className="note-card-body">
                      <button className="completed-toggle" onClick={() => togglePersonalNoteComplete(note.id)}>{note.completed ? '✔' : ''}</button>
                      <div className="note-main">
                        <p className="note-text">{note.text}</p>
                        <div className="note-tags">{(note.tags || []).map(tag => (<span key={tag} className="note-tag">{tag}</span>))}</div>
                      </div>
                      <div className="note-actions">
                        <button className="btn-icon edit" onClick={() => { setNoteToEdit(note); setIsNoteModalOpen(true); }}>✎</button>
                        <button className="btn-icon delete" onClick={() => deletePersonalNote(note.id)}>🗑</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (<p className="no-notes-message">No tienes notas para el filtro seleccionado. ¡Crea una nueva!</p>)}
          </motion.div>

          <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={noteToEdit ? 'Editar Nota Personal' : 'Nueva Nota Personal'}>
            <PersonalNoteForm noteToEdit={noteToEdit} onSave={handleSavePersonalNote} onClose={() => setIsNoteModalOpen(false)} availableTags={personalNoteTags} />
          </Modal>

          <Modal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} title="Gestionar Etiquetas Personales">
            <PersonalTagManager tags={personalNoteTags} onAddTag={addPersonalNoteTag} onDeleteTag={deletePersonalNoteTag} />
          </Modal>
        </motion.div>
      )}

      {viewMode === 'destinations' && (
        <motion.div key="destinations" className="page-container" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transition}>
          <header className="page-header">
            <div><h1>Notas por Destino</h1><p>Organiza tus ideas y descubrimientos para cada viaje.</p></div>
            <button className="btn-secondary" onClick={() => setViewMode('choice')}>← Volver</button>
          </header>
          <motion.div layout className="notes-grid-container">
            {(destinations || []).length > 0 ? (
              destinations.map(dest => (
                <motion.div key={dest.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Link to={`/notas/${dest.id}`} className="note-summary-card">
                    <div className="note-summary-card__header">
                      <div className="note-summary-card__icon"><FolderIcon /></div>
                      <div className="with-flag">
                        {dest.countryCode && (<img className="country-flag" src={`https://flagcdn.com/w20/${dest.countryCode.toLowerCase()}.png`} alt={`Bandera de ${dest.country}`} />)}
                        <h3>{dest.city}, {dest.country}</h3>
                      </div>
                    </div>
                    <div className="note-summary-card__preview">
                      <p>{dest.notes?.length ? `"${dest.notes[dest.notes.length - 1].text.substring(0, 40)}..."` : 'Aún no hay notas.'}</p>
                    </div>
                    <div className="note-summary-card__footer">
                      <div className="note-summary-card__stats">
                        <span><strong>{dest.notes?.length || 0}</strong> Notas</span>
                        <span><strong>{new Set(dest.notes?.flatMap(n => n.tags || [])).size}</strong> Etiquetas</span>
                      </div>
                      <span className="arrow-icon">&rarr;</span>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="card no-destinations-message"><p>Aún no tienes destinos. ¡Crea uno para empezar a guardar tus notas!</p></div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}