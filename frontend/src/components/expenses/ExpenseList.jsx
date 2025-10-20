// src/components/expenses/ExpenseList.jsx

import React from 'react';
import SwipeableListItem from '../common/SwipeableListItem'; // 1. Importar

const formatAmount = (amount, currency) => {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses || expenses.length === 0) {
    return <p className="no-expenses-message">No hay gastos registrados para la categoría seleccionada.</p>;
  }

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    // 2. Cambiamos 'ul' por 'div'
    <div className="expense-list">
      {sortedExpenses.map(expense => (
        // 3. Envolvemos cada item con el componente de swipe
        <SwipeableListItem
          key={expense.id}
          onEdit={() => onEdit(expense)}
          onDelete={() => onDelete(expense.id)}
        >
          {/* El 'li' ahora es un 'div' dentro del swipe */}
          <div className="expense-item">
            <div className="expense-category-icon">
              {expense.category === 'Comida' && '🍔'}
              {expense.category === 'Alojamiento' && '🏨'}
              {expense.category === 'Transporte' && '✈️'}
              {expense.category === 'Ocio' && '🎟️'}
              {expense.category === 'Compras' && '🛍️'}
              {expense.category === 'Otros' && '🧾'}
            </div>

            <div className="expense-details">
              <span className="expense-description">{expense.description}</span>
              <span className="expense-category">{expense.category}</span>
              <div className="expense-amount">
                {formatAmount(expense.amount, expense.currency)}
              </div>
            </div>

            {/* 4. El div de acciones con los botones se elimina de aquí */}
          </div>
        </SwipeableListItem>
      ))}
    </div>
  );
}

export default ExpenseList;