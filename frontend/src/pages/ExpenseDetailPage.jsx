import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDestinations } from '../context/DestinationsContext';
import Modal from '../components/common/Modal';
import DeleteConfirmation from '../components/common/DeleteConfirmation';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseSummary from '../components/expenses/ExpenseSummary';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import '../components/expenses/ExpenseDetail.css';
import { fetchConversionRates } from '../services/apiService';

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseDetailPage() {
  const { destinationId } = useParams();
  const { destinations, deleteExpense } = useDestinations();
  const destination = (destinations || []).find(d => String(d.id) === String(destinationId));

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [rates, setRates] = useState(null);

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

  const openAddModal = () => { setExpenseToEdit(null); setIsFormModalOpen(true); };
  const handleEditClick = (expense) => { setExpenseToEdit(expense); setIsFormModalOpen(true); };
  const handleDeleteClick = (expenseId) => { setExpenseToDelete(expenseId); setIsConfirmModalOpen(true); };
  const handleConfirmDelete = () => { deleteExpense(destinationId, expenseToDelete); setIsConfirmModalOpen(false); setExpenseToDelete(null); };
  const closeFormModal = () => { setIsFormModalOpen(false); setExpenseToEdit(null); };

  const [legendPosition, setLegendPosition] = useState('right');
  useEffect(() => {
    const handleResize = () => setLegendPosition(window.innerWidth < 768 ? 'bottom' : 'right');
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = useMemo(() => {
    if (!destination?.expenses) return ['Todas'];
    const uniqueCategories = [...new Set(destination.expenses.map(exp => exp.category))];
    return ['Todas', ...uniqueCategories.sort()];
  }, [destination?.expenses]);

  const filteredExpenses = useMemo(() => {
    if (!destination?.expenses) return [];
    if (selectedCategory === 'Todas') return destination.expenses;
    return destination.expenses.filter(exp => exp.category === selectedCategory);
  }, [destination?.expenses, selectedCategory]);

  const expensesByCategory = useMemo(() => {
    if (!filteredExpenses) return {};
    const byCategory = {};

    // ✅ FIX: Lógica especial para ARS en el gráfico
    if (baseCurrency === 'ARS') {
        const arsExpenses = filteredExpenses.filter(exp => exp.currency === 'ARS');
        arsExpenses.forEach(expense => {
            if (!byCategory[expense.category]) byCategory[expense.category] = 0;
            byCategory[expense.category] += expense.amount;
        });
        return byCategory;
    }

    // Lógica de conversión para el resto en el gráfico
    if (!rates) return {};
    filteredExpenses.forEach(expense => {
      if (!byCategory[expense.category]) byCategory[expense.category] = 0;
      let amountInBase = 0;
      if (expense.currency === baseCurrency) {
        amountInBase = expense.amount;
      } else {
        const rate = rates[expense.currency];
        if (rate) amountInBase = expense.amount / rate;
      }
      byCategory[expense.category] += amountInBase;
    });
    return byCategory;
  }, [filteredExpenses, rates, baseCurrency]);

  const chartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [{ data: Object.values(expensesByCategory), backgroundColor: ['#4361EE', '#F72585', '#4CC9F0', '#7209B7', '#F9C74F', '#4895EF'], borderWidth: 0, cutout: '70%' }],
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: legendPosition } } };

  if (!destination) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <h2>Destino no encontrado</h2>
        <Link to="/gastos" className="btn-secondary" style={{ marginTop: '1rem' }}>Volver</Link>
      </div>
    );
  }

  return (
    <div className="page-container expense-detail-page">
      <div className="back-link-wrapper"><Link to="/gastos" className="btn-secondary">&larr; Volver a todos los viajes</Link></div>
      <header className="page-header">
        <h1>Gastos para {destination.city}</h1>
        <p>Consulta tus gastos y estadísticas para {destination.country}.</p>
      </header>
      
      <ExpenseSummary 
        expenses={destination.expenses || []}
        baseCurrency={baseCurrency}
        onCurrencyChange={setBaseCurrency}
      />

      <section className="action-section"><button className="add-expense-button" onClick={openAddModal}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Añadir Gasto</button></section>
      
      {categories.length > 1 && (<section className="filter-section"><div className="filter-pills-container">{categories.map(category => (<button key={category} className={`filter-btn ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>))}</div></section>)}
      
      <section className="expense-list-section">
        <h2>Registro de Gastos</h2>
        <ExpenseList expenses={filteredExpenses} onEdit={handleEditClick} onDelete={handleDeleteClick} />
      </section>

      {Object.keys(expensesByCategory).length > 0 && (
        <section className="chart-section">
          <h2>Distribución por Categoría</h2>
          <div className="chart-wrapper-card"><Doughnut data={chartData} options={chartOptions} /></div>
        </section>
      )}

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={expenseToEdit ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}><ExpenseForm destinationId={destinationId} expenseToEdit={expenseToEdit} onFinished={closeFormModal} /></Modal>
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Eliminación"><DeleteConfirmation onConfirm={handleConfirmDelete} onCancel={() => setIsConfirmModalOpen(false)} message="¿Estás seguro de que quieres eliminar este gasto?" /></Modal>
    </div>
  );
}

export default ExpenseDetailPage;