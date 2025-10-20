import React, { useState, useEffect, useMemo } from 'react';
import { useDestinations } from '../context/DestinationsContext';
import { Link } from 'react-router-dom';
import ExpenseSummary from '../components/expenses/ExpenseSummary';
import { fetchConversionRates } from '../services/apiService';
import '../components/expenses/Expenses.css';
import '../components/notes/Notes.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function DestinationExpenseSummary({ destination, rates, baseCurrency }) {
  const total = useMemo(() => {
    const expenses = destination.expenses || [];

    // ✅ FIX: Lógica especial para ARS
    if (baseCurrency === 'ARS') {
      return expenses
        .filter(exp => exp.currency === 'ARS')
        .reduce((sum, exp) => sum + exp.amount, 0);
    }

    // Lógica de conversión para el resto
    if (!rates) return 0;
    let totalInBase = 0;
    expenses.forEach(expense => {
        if (expense.currency === baseCurrency) {
            totalInBase += expense.amount;
            return;
        }
        const rate = rates[expense.currency];
        if (rate) {
            totalInBase += expense.amount / rate;
        }
    });
    return totalInBase;
  }, [destination.expenses, rates, baseCurrency]);

  return (
    <Link to={`/gastos/${destination.id}`} className="destination-summary-card">
      <div className="with-flag">
        {destination.countryCode && <img className="country-flag" src={`https://flagcdn.com/w40/${destination.countryCode.toLowerCase()}.png`} alt={`Bandera de ${destination.country}`} />}
        <h3>{destination.city}, {destination.country}</h3>
      </div>
      <span className="destination-total-spend">
        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: baseCurrency, minimumFractionDigits: 2 }).format(total)}
      </span>
    </Link>
  );
}

function ExpensesPage() {
  const { destinations } = useDestinations();
  const [rates, setRates] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('USD');

  useEffect(() => {
    // ✅ FIX: Si la moneda es ARS, no llamamos a la API.
    if (baseCurrency === 'ARS') {
      setRates({});
      return;
    }
    const getRates = async () => {
      const fetchedRates = await fetchConversionRates(baseCurrency);
      setRates(fetchedRates);
    };
    getRates();
  }, [baseCurrency]);

  const allExpenses = destinations.flatMap(dest => dest.expenses || []);

  const [legendPosition, setLegendPosition] = useState('right');
  useEffect(() => {
    const handleResize = () => setLegendPosition(window.innerWidth < 768 ? 'bottom' : 'right');
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const expensesByCategory = useMemo(() => {
    if (!allExpenses) return {};
    const byCategory = {};

    // ✅ FIX: Lógica especial para ARS en el gráfico
    if (baseCurrency === 'ARS') {
      const arsExpenses = allExpenses.filter(exp => exp.currency === 'ARS');
      arsExpenses.forEach(expense => {
        if (!byCategory[expense.category]) byCategory[expense.category] = 0;
        byCategory[expense.category] += expense.amount;
      });
      return byCategory;
    }
    
    // Lógica de conversión para el resto en el gráfico
    if (!rates) return {};
    allExpenses.forEach(expense => {
      if (!byCategory[expense.category]) byCategory[expense.category] = 0;
      let amountInBase = 0;
      if(expense.currency === baseCurrency) {
        amountInBase = expense.amount;
      } else {
        const rate = rates[expense.currency];
        if (rate) amountInBase = expense.amount / rate;
      }
      byCategory[expense.category] += amountInBase; 
    });
    return byCategory;
  }, [allExpenses, rates, baseCurrency]);

  const chartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [{ data: Object.values(expensesByCategory), backgroundColor: ['#4361EE', '#F72585', '#4CC9F0', '#7209B7', '#F9C74F', '#4895EF'], borderColor: '#f4f5f7', borderWidth: 2, cutout: '70%' }],
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: legendPosition } } };

  return (
    <div className="page-container">
      <header className="page-header">
        <div><h1>Control de Gastos</h1><p>Un resumen global y detallado de todos los gastos de tus viajes.</p></div>
      </header>
      
      <div className="expenses-page-layout">
        <div className="global-summary-container">
          <h2 className="section-title">Resumen Global</h2>
          <div className="card">
            <ExpenseSummary 
              expenses={allExpenses} 
              baseCurrency={baseCurrency}
              onCurrencyChange={setBaseCurrency}
            />
            {Object.keys(expensesByCategory).length > 0 && (
              <div className="chart-container">
                <h3 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Distribución Global</h3>
                <div className="chart-wrapper"><Doughnut data={chartData} options={chartOptions} /></div>
              </div>
            )}
          </div>
        </div>
        <div className="per-destination-summary">
          <h2 className="section-title">Gastos por Viaje</h2>
          <div className="destination-selection-list">
            {destinations.length > 0 ? (
              destinations.map(dest => (
                <DestinationExpenseSummary 
                  key={dest.id}
                  destination={dest}
                  rates={rates}
                  baseCurrency={baseCurrency}
                />
              ))
            ) : (
              <div className="card no-destinations-message"><p>No has creado ningún destino todavía.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpensesPage;