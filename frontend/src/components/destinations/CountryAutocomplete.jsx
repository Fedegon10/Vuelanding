import React, { useState, useEffect, useRef } from "react";
import "./CountryAutocomplete.css";

function CountryAutocomplete({ countries, value, onChange, isLoading }) {
  const [inputValue, setInputValue] = useState(
    value?.translations?.spa?.common ||
      value?.name?.common ||
      value?.commonName ||
      value?.name ||
      ""
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      setInputValue(
        value?.translations?.spa?.common ||
          value?.name?.common ||
          value?.commonName ||
          value?.name ||
          ""
      );
    }
  }, [value]);

  useEffect(() => {
    if (inputValue) {
      const filteredSuggestions = countries
        .filter((country) => {
          const countryName =
            country?.translations?.spa?.common ||
            country?.name?.common ||
            country?.commonName ||
            country?.name ||
            "";
          return countryName.toLowerCase().includes(inputValue.toLowerCase());
        })
        .slice(0, 10);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, countries]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(null);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (country) => {
    const countryName =
      country.translations?.spa?.common ||
      country.name?.common ||
      country.commonName ||
      country.name ||
      "";
    setInputValue(countryName);
    onChange(country);
    setShowSuggestions(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        placeholder={isLoading ? "Cargando países..." : "Ej: España"}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        required
        autoComplete="off"
        disabled={isLoading}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((country) => {
            const countryName =
              country.translations?.spa?.common ||
              country.name?.common ||
              country.commonName ||
              country.name ||
              "";
            return (
              <li
                key={country.cca2 || country.commonName || country.name}
                onClick={() => handleSuggestionClick(country)}
              >
                {country.flag && (
                  <img
                    src={country.flag}
                    alt={`Bandera de ${countryName}`}
                    width="20"
                    height="14"
                  />
                )}
                <span>{countryName}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CountryAutocomplete;
