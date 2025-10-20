import React, { useEffect, useRef } from "react";
import "./CustomDatePicker.css";

/**
 * CustomDatePicker nativo — compatible con iOS, Android y Safari.
 * Corrige el bug del cursor y mantiene el foco al escribir.
 */
function CustomDatePicker({
  type = "date",
  value,
  onChange,
  name,
  min,
  max,
  disabled,
  placeholder,
  ...props
}) {
  const inputRef = useRef(null);
  const effectivePlaceholder = placeholder || (type === "time" ? "HH:MM" : "");

  // 🔧 Corrige el bug: pasa el valor de forma estable sin interferir con React
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange({ target: { name, value: newValue } });
    }
  };

  // ✅ Refresca el calendario cuando cambia el mínimo permitido
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      try {
        inputRef.current.showPicker?.();
      } catch {
        // No soportado (ej: Firefox)
      }
    }
  }, [min]);

  return (
    <div className="custom-datepicker-wrapper">
      <input
        ref={inputRef}
        className={`custom-datepicker-input type-${type}`}
        type={type}
        name={name}
        value={value || ""}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        placeholder={effectivePlaceholder}
        {...props}
      />
    </div>
  );
}

export default CustomDatePicker;
