// src/utils/storage.js

// Datos por defecto si no hay nada en el navegador
const initialData = [
  { id: 1, city: 'Tokio', country: 'Japón', startDate: '2025-10-15', endDate: '2025-10-25', priority: 'Alta', notes: 'Visitar el templo Senso-ji', files: [], lat: 35.6895, lng: 139.6917 },
  { id: 2, city: 'Roma', country: 'Italia', startDate: '2026-04-05', endDate: '2026-04-12', priority: 'Media', notes: '', files: [], lat: 41.9028, lng: 12.4964 }
];

// Esta función es a prueba de balas.
export const loadDataFromStorage = () => {
  try {
    const serializedData = localStorage.getItem('vuelandingData');
    // Si no hay nada, devolvemos los datos iniciales.
    if (serializedData === null) {
      return initialData;
    }
    const parsedData = JSON.parse(serializedData);
    // Verificamos que los datos parseados sean un array. Si no, devolvemos los iniciales.
    return Array.isArray(parsedData) ? parsedData : initialData;
  } catch (error) {
    console.error("Error al cargar datos. Se restauran los valores por defecto.", error);
    return initialData; // Si hay cualquier error, volvemos a un estado seguro.
  }
};

export const saveDataToStorage = (data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem('vuelandingData', serializedData);
  } catch (error) {
    console.error("Error al guardar datos:", error);
  }
};