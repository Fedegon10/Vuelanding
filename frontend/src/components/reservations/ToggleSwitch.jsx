import React from 'react';
import './ToggleSwitch.css';

function ToggleSwitch({ options, activeTab, setActiveTab }) {
  const activeIndex = options.indexOf(activeTab);

  // El estilo calcula la posición y el ancho de la "píldora" de fondo
  const switchStyle = {
    width: `calc(${100 / options.length}% - 4px)`,
    transform: `translateX(${activeIndex * 100}%)`,
  };

  return (
    <div className="toggle-switch-container">
      <div className="switch-background" style={switchStyle}></div>
      {options.map((option) => (
        <button
          key={option}
          className={`toggle-option ${activeTab === option ? 'active' : ''}`}
          onClick={() => setActiveTab(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default ToggleSwitch;