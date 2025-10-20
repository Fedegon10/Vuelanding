import React from "react";
import CurrencyConverter from "../components/converter/CurrencyConverter";
import "../components/converter/CurrencyConverterPage.css";

function CurrencyConverterPage() {
  return (
    <div className="converter-page">
      <header className="converter-header">
        <h1>Conversor de Monedas</h1>
        <p>Calculá tipos de cambio actualizados para tus próximos viajes.</p>
      </header>

      <div className="converter-wrapper">
        <CurrencyConverter />
      </div>
    </div>
  );
}

export default CurrencyConverterPage;
