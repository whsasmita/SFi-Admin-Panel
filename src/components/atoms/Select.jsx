import React from 'react';

/**
 * Atom: Select
 */
export default function Select({
  value,
  onChange,
  options = [],
  disabled = false,
  className = '',
  style = {},
}) {
  return (
    <select
      className={`table-select ${className}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={style}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
