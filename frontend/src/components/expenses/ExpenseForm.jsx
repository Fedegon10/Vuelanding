import React, { useState, useEffect } from 'react';
import { useDestinations } from '../../context/DestinationsContext';
import '../destinations/Destinations.css';

const categories = ['Comida', 'Alojamiento', 'Transporte', 'Ocio', 'Compras', 'Otros'];
const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'ARS', 'BRL', 'CAD', 'CHF', 'CNY'];

function ExpenseForm({ destinationId, expenseToEdit, onFinished }) {
  const { addExpense, updateExpense } = useDestinations();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'USD',
    category: 'Otros',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ==========================================================
     CARGAR DATOS EXISTENTES (si se edita)
     ========================================================== */
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        description: expenseToEdit.description || '',
        amount: expenseToEdit.amount?.toString() || '',
        currency: expenseToEdit.currency || 'USD',
        category: expenseToEdit.category || 'Otros',
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        currency: 'USD',
        category: 'Otros',
      });
    }
  }, [expenseToEdit]);

  /* ==========================================================
     MANEJO DE FORMULARIO
     ========================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria.';
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Introduce un monto válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ==========================================================
     GUARDAR / ACTUALIZAR GASTO
     ========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      if (expenseToEdit) {
        // ✅ FIX: usar los tres parámetros correctos (destinationId, expenseId, data)
        await updateExpense(destinationId, expenseToEdit.id, expenseData);
      } else {
        await addExpense(destinationId, expenseData);
      }

      // ✅ Cierra modal al terminar (con pequeña pausa opcional)
      setTimeout(() => {
        setSaving(false);
        onFinished();
      }, 200);
    } catch (err) {
      console.error('Error guardando gasto:', err);
      setSaving(false);
    }
  };

  /* ==========================================================
     RENDER
     ========================================================== */
  return (
    <form onSubmit={handleSubmit} className="destination-form expense-form" noValidate>
      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ej: Entradas al museo"
          required
        />
        {errors.description && <p className="error-message">{errors.description}</p>}
      </div>

      <div className="form-row centered-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label htmlFor="amount">Monto</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Ej: 50.00"
            required
          />
          {errors.amount && <p className="error-message">{errors.amount}</p>}
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="currency">Moneda</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="styled-select"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Categoría</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="styled-select"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onFinished} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : expenseToEdit ? 'Guardar Cambios' : 'Añadir Gasto'}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
