import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './ImagePickerModal.css';

const UNSPLASH_ACCESS_KEY = 'ceoSs1TkAtnlVaT7yR0m5moeB0dMJ_QnD51_RMb6dlc';

function ImagePickerModal({ isOpen, onClose, onSelect, city, country }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      return;
    }

    const fetchImages = async () => {
      setLoading(true);
      try {
        const query = `${city} ${country} travel landmark`;
        const res = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query,
            per_page: 20,
            client_id: UNSPLASH_ACCESS_KEY,
          },
        });
        setImages(res.data.results);
      } catch (err) {
        console.error('Error cargando imágenes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [isOpen, city, country]);

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage.urls.regular);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="image-picker-overlay" onClick={onClose}>
      <div
        className="image-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="close-btn">
          ×
        </button>
        <header>
          <h2>Elegir imagen para {city}</h2>
        </header>

        <div className="image-picker-grid">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            images.map((img) => (
              <img
                key={img.id}
                src={img.urls.small}
                alt={img.alt_description || city}
                onClick={() => setSelectedImage(img)}
                className={`selectable-img ${
                  selectedImage?.id === img.id ? 'selected' : ''
                }`}
              />
            ))
          )}
        </div>

        {selectedImage && (
          <div className="image-picker-footer">
            <button className="confirm-btn" onClick={handleConfirm}>
              Confirmar Selección
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 🚀 Render directo al body (fuera de .app-container y cualquier transform)
  return ReactDOM.createPortal(modalContent, document.body);
}

export default ImagePickerModal;
