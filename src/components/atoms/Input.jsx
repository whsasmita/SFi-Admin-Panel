import React from 'react';

/**
 * Atom: Input
 * Types: 'text' | 'password' | 'email' | 'number'
 */
export default function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  isMono = false,
  className = '',
  style = {},
  required = false,
}) {
  return (
    <input
      type={type}
      className={`table-input ${className}`}
      style={{
        fontFamily: isMono ? 'var(--font-mono)' : 'var(--font-sans)',
        ...style,
      }}
      value={value !== undefined && value !== null ? value : ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
    />
  );
}
