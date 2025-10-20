// src/components/converter/CurrencySelector.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";

// ✅ PASO 1: Lista de países preferidos por código de moneda.
// Usamos el código 'cca2' del país (ej: 'US' para Estados Unidos).
const PREFERRED_COUNTRIES = {
  USD: "US", // Dólar Estadounidense -> Estados Unidos
  EUR: "ES", // Euro -> España
  GBP: "GB", // Libra Esterlina -> Reino Unido
  JPY: "JP", // Yen Japonés -> Japón
  ARS: "AR", // Peso Argentino -> Argentina
  BRL: "BR", // Real Brasileño -> Brasil
};

function CurrencySelector({ countries, value, onChange }) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // ✅ PASO 2: Un nuevo estado para guardar el país seleccionado EXACTO.
  const [selectedCountry, setSelectedCountry] = useState(null);
  const wrapperRef = useRef(null);

  // ✅ PASO 3: Lógica mejorada para seleccionar la bandera correcta.
  useEffect(() => {
    if (!value || countries.length === 0) return;

    // Cuando el valor cambia (carga inicial o swap), buscamos el país preferido.
    const preferredCca2 = PREFERRED_COUNTRIES[value];
    let countryToShow = countries.find((c) => c.cca2 === preferredCca2);

    // Si no encontramos un preferido, usamos el método anterior como fallback.
    if (!countryToShow) {
      countryToShow = countries.find((c) => c.currencyCode === value);
    }

    setSelectedCountry(countryToShow);
    setInputValue(value);
  }, [value, countries]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    setShowSuggestions(true);
  };

  const suggestions = useMemo(() => {
    if (!inputValue) return [];
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          c.currencyCode.toLowerCase().includes(inputValue.toLowerCase())
      )
      .slice(0, 10);
  }, [inputValue, countries]);

  // ✅ PASO 4: Al hacer clic, guardamos el país exacto.
  const handleSuggestionClick = (country) => {
    setSelectedCountry(country); // Guardamos el país completo (con su bandera).
    onChange(country.currencyCode); // Enviamos solo el código de moneda al padre.
    setInputValue(country.currencyCode);
    setShowSuggestions(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
        if (value) setInputValue(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value]);

  return (
    <div className="currency-selector" ref={wrapperRef}>
      <div className="currency-input-wrapper">
        {/* Usamos el nuevo estado 'selectedCountry' para la bandera */}
        {selectedCountry && (
          <div className="selected-flag">
            <img src={selectedCountry.flag} alt={selectedCountry.name} />
          </div>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Buscar..."
          autoComplete="off"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((country) => (
            <li
              key={country.cca2}
              onClick={() => handleSuggestionClick(country)}
            >
              <img
                src={country.flag}
                alt={country.name}
                className="flag-icon"
              />
              <span>
                {country.name} - <strong>{country.currencyCode}</strong>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CurrencySelector;
