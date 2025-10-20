import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseCommand } from '../../utils/nlpParser';
import { useDestinations } from '../../context/DestinationsContext';
import { toast } from 'react-toastify';
import './Assistant.css';

export default function TravelAssistant() {
  const { destinations, addNote, addOrUpdateEventWithFile } = useDestinations();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  // Detecta el destino activo (el más reciente)
  const activeDestination = destinations?.[destinations.length - 1];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeDestination) return;

    const command = parseCommand(input);
    setInput('');

    if (command.type === 'note') {
      await addNote(activeDestination.id, {
        id: Date.now().toString(),
        text: command.title,
        date: command.date,
        completed: false,
      });
      toast.success('📝 Nota agregada correctamente');
    } else if (command.type === 'event') {
      await addOrUpdateEventWithFile(activeDestination.id, {
        id: Date.now().toString(),
        title: command.title,
        date: command.date,
        startTime: command.startTime || '09:00',
        endTime: '',
        category: 'Ocio',
        completed: false,
      });
      toast.success('📅 Evento agregado al itinerario');
    } else {
      toast.info('No pude entender la instrucción 😅');
    }
  };

  return (
    <>
      <motion.button
        className="assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        💬
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="assistant-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="assistant-header">
              <h3>Asistente de Viaje ✈️</h3>
              <button onClick={() => setIsOpen(false)}>✖️</button>
            </div>
            <div className="assistant-body">
              <p>Escribe cosas como:</p>
              <ul>
                <li>“Nota: comprar protector solar”</li>
                <li>“Agendar comida mañana 13:00”</li>
              </ul>
            </div>
            <form className="assistant-input-row" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="¿Qué deseas agregar?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit">Enviar</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
