// src/components/converter/CurrencyConverter.jsx

import React, { useState, useEffect, useMemo } from "react";
import { fetchExchangeRates, fetchCountries } from "../../services/apiService";
import { ArrowDownUp } from "lucide-react";
import CurrencySelector from "./CurrencySelector";
import "./CurrencyConverter.css";

function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("ARS");
  const [rates, setRates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState([]);

  // --- Lógica de datos (sin cambios) ---
  useEffect(() => {
    const getCountries = async () => {
      const countryData = await fetchCountries();
      setCountries(countryData);
    };
    getCountries();
  }, []);

  useEffect(() => {
    if (!fromCurrency) return;
    const getRates = async () => {
      setIsLoading(true);
      const fetchedRates = await fetchExchangeRates(fromCurrency);
      setRates(fetchedRates);
      setIsLoading(false);
    };
    getRates();
  }, [fromCurrency]);

  const singleUnitRate = useMemo(() => {
    if (isLoading || !rates || !rates[toCurrency]) return 0;
    return rates[toCurrency];
  }, [toCurrency, rates, isLoading]);

  const convertedAmount = useMemo(() => {
    if (!amount || !singleUnitRate) return "0,00";
    const result = parseFloat(amount.replace(",", ".")) * singleUnitRate;
    return result.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amount, singleUnitRate]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*[,.]?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };

  // --- ✅ JSX CORREGIDO CON GRID PARA ALINEACIÓN PERFECTA ---
  return (
    <div className="converter-container">
      {/* PANEL DE ENTRADA ("DE") */}
      <div className="converter-panel">
        <span className="panel-label">De</span>
        <div className="panel-main">
          <CurrencySelector
            countries={countries}
            value={fromCurrency}
            onChange={setFromCurrency}
          />
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="amount-input"
            placeholder="0"
            inputMode="decimal"
          />
        </div>
      </div>

      {/* SECCIÓN CENTRAL */}
      <div className="converter-middle">
        <button
          onClick={handleSwapCurrencies}
          className="swap-button"
          title="Intercambiar monedas"
        >
          <ArrowDownUp size={20} />
        </button>
        <div className="rate-display">
          {isLoading ? (
            <span>Cargando tasa...</span>
          ) : (
            <span>
              1 {fromCurrency} ={" "}
              {singleUnitRate.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{" "}
              {toCurrency}
            </span>
          )}
        </div>
      </div>

      {/* PANEL DE SALIDA ("A") */}
      <div className="converter-panel result">
        <span className="panel-label">A</span>
        <div className="panel-main">
          <CurrencySelector
            countries={countries}
            value={toCurrency}
            onChange={setToCurrency}
          />
          <div className="amount-display">
            {isLoading ? "..." : convertedAmount}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrencyConverter;
