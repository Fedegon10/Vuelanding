import React, { useState, useEffect, useMemo } from 'react';
import { fetchConversionRates } from '../../services/apiService';

const formatCurrency = (amount, currency) => {
  try {
    const locale = currency === 'USD' ? 'en-US' : 'es-AR';
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency: currency, minimumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

function ExpenseSummary({ expenses, baseCurrency, onCurrencyChange }) {
  const [rates, setRates] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    const getRates = async () => {
      // ✅ FIX: Si la moneda es ARS, no llamamos a la API.
      if (baseCurrency === 'ARS') {
        setRates({}); // Reseteamos las tasas para activar el recálculo
        setLoadingRates(false);
        return;
      }

      setLoadingRates(true);
      const fetchedRates = await fetchConversionRates(baseCurrency);
      setRates(fetchedRates);
      setLoadingRates(false);
    };
    getRates();
  }, [baseCurrency]);

  const totalExpenseInBase = useMemo(() => {
    if (!expenses) return 0;

    // ✅ FIX: Lógica especial para ARS
    if (baseCurrency === 'ARS') {
      return expenses
        .filter(expense => expense.currency === 'ARS')
        .reduce((sum, expense) => sum + expense.amount, 0);
    }

    // Lógica de conversión para el resto de las monedas
    if (loadingRates || !rates) return 0;

    let total = 0;
    expenses.forEach(expense => {
      if (expense.currency === baseCurrency) {
        total += expense.amount;
        return;
      }
      const rate = rates[expense.currency];
      if (rate && typeof rate === 'number' && rate > 0) {
        total += expense.amount / rate;
      }
    });
    return total;
  }, [expenses, rates, baseCurrency, loadingRates]);

  return (
    <section className="summary-section">
      <div className="section-header">
        <h2>Resumen de Gastos</h2>
        <div className="currency-selector">
          <span>Moneda Base:</span>
          <select value={baseCurrency} onChange={(e) => onCurrencyChange(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="ARS">ARS</option>
            <option value="BRL">BRL</option>
          </select>
        </div>
      </div>
      <div className="summary-cards-container">
        <div className="summary-card">
          <h4>Gasto Total</h4>
          <p>{loadingRates ? 'Calculando...' : formatCurrency(totalExpenseInBase, baseCurrency)}</p>
        </div>
        <div className="summary-card">
          <h4># de Gastos</h4>
          <p>{baseCurrency === 'ARS' ? expenses.filter(e => e.currency === 'ARS').length : expenses.length}</p>
        </div>
      </div>
    </section>
  );
}

export default ExpenseSummary;