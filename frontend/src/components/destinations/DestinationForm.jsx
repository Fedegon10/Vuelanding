// src/components/destinations/DestinationForm.jsx

import React, { useState, useEffect, useRef } from "react";
import { useDestinations } from "../../context/DestinationsContext";
import { fetchCities, fetchCoordinates } from "../../services/apiService";
import CountryAutocomplete from "./CountryAutocomplete";
import CustomDatePicker from "../common/CustomDatePicker";
import "./CountryAutocomplete.css";
import { toast } from "react-toastify";

function DestinationForm({ destinationId, onFinished }) {
  // ✅ PASO 1: Asegurarse de que 'loadingCountries' se está extrayendo del contexto.
  const {
    destinations,
    addDestination,
    updateDestination,
    countriesWithFlags,
    loadingCountries, // <--- Esta línea es crucial
  } = useDestinations();

  const [formData, setFormData] = useState({
    city: "",
    country: null,
    startDate: "",
    endDate: "",
    color: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [cityInputValue, setCityInputValue] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityWrapperRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (destinationId) {
      const destToEdit = destinations.find((d) => d.id === destinationId);
      if (destToEdit) {
        const countryObject = countriesWithFlags.find(
          (c) =>
            c.name === destToEdit.country || c.commonName === destToEdit.country
        );
        setFormData({
          city: destToEdit.city,
          country: countryObject || null,
          startDate: destToEdit.startDate,
          endDate: destToEdit.endDate,
          color: destToEdit.color,
        });
        setCityInputValue(destToEdit.city);
      }
    } else {
      setFormData({
        city: "",
        country: null,
        startDate: "",
        endDate: "",
        color:
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0"),
      });
      setCityInputValue("");
    }
  }, [destinationId, destinations, countriesWithFlags]);

  useEffect(() => {
    if (!formData.country) {
      setCities([]);
      return;
    }
    const countryNameToFetch =
      formData.country.commonName || formData.country.name;
    const getCities = async () => {
      setIsLoadingCities(true);
      const cityData = await fetchCities(countryNameToFetch);
      setCities(cityData);
      setIsLoadingCities(false);
    };
    getCities();
  }, [formData.country]);

  useEffect(() => {
    if (cityInputValue) {
      setCitySuggestions(
        cities
          .filter((c) => c.toLowerCase().includes(cityInputValue.toLowerCase()))
          .slice(0, 10)
      );
    } else {
      setCitySuggestions([]);
    }
  }, [cityInputValue, cities]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        cityWrapperRef.current &&
        !cityWrapperRef.current.contains(event.target)
      ) {
        setShowCitySuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cityWrapperRef]);

  const handleCityInputChange = (e) => {
    setCityInputValue(e.target.value);
    setShowCitySuggestions(true);
  };
  const handleCitySuggestionClick = (cityName) => {
    setCityInputValue(cityName);
    setShowCitySuggestions(false);
  };
  const handleCountryChange = (countryObject) => {
    setFormData((prev) => ({ ...prev, country: countryObject, city: "" }));
    setCityInputValue("");
  };
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !cityInputValue ||
      !formData.country ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }
    setIsSaving(true);
    const finalFormData = { ...formData, city: cityInputValue };
    const countryNameForCoords =
      finalFormData.country?.commonName || finalFormData.country?.name || "";
    const coords = await fetchCoordinates(
      finalFormData.city,
      countryNameForCoords
    );
    const dataToSave = { ...finalFormData, lat: coords?.lat, lng: coords?.lng };
    if (destinationId) {
      updateDestination(destinationId, dataToSave);
    } else {
      addDestination(dataToSave);
    }
    setIsSaving(false);
    onFinished();
  };

  return (
    <form className="destination-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label>País</label>
        {/* ✅ PASO 2: Asegurarse de que la prop 'isLoading' se está pasando al componente. */}
        <CountryAutocomplete
          countries={countriesWithFlags}
          value={formData.country}
          onChange={handleCountryChange}
          isLoading={loadingCountries} // <--- Esta línea es crucial
        />
      </div>

      <div className="form-group">
        <label>Ciudad</label>
        <div className="autocomplete-wrapper" ref={cityWrapperRef}>
          <input
            type="text"
            placeholder={
              !formData.country
                ? "Selecciona un país primero"
                : isLoadingCities
                ? "Cargando ciudades..."
                : "Escribe para buscar..."
            }
            value={cityInputValue}
            onChange={handleCityInputChange}
            onFocus={() => setShowCitySuggestions(true)}
            required
            disabled={!formData.country || isLoadingCities}
            autoComplete="off"
          />
          {showCitySuggestions && citySuggestions.length > 0 && (
            <ul className="suggestions-list">
              {citySuggestions.map((cityName) => (
                <li
                  key={cityName}
                  onClick={() => handleCitySuggestionClick(cityName)}
                >
                  <span>{cityName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Fecha de inicio</label>
          <CustomDatePicker
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleDateChange}
            min={today}
            placeholder="Seleccionar fecha de inicio"
          />
        </div>
        <div className="form-group">
          <label>Fecha de fin</label>
          <CustomDatePicker
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleDateChange}
            min={formData.startDate || today}
            placeholder="Seleccionar fecha de fin"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onFinished}
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving
            ? "Guardando..."
            : destinationId
            ? "Guardar Cambios"
            : "Agregar Destino"}
        </button>
      </div>
    </form>
  );
}

export default DestinationForm;
