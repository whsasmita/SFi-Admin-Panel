import React from 'react';
import { IconRefresh } from './Icons.jsx';

/**
 * Atom: Button
 * Variants: 'primary' | 'publish' | 'outline' | 'danger'
 * Sizes: 'sm' | 'md'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  icon: Icon,
  className = '',
  style = {},
  title = '',
}) {
  const variantClass = {
    primary: 'btn-primary',
    publish: 'btn-publish',
    outline: 'btn-outline',
    danger: 'btn-danger',
  }[variant] || 'btn-primary';

  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      title={title}
    >
      {loading ? (
        <span className="animate-spin" style={{ display: 'flex', alignItems: 'center' }}>
          <IconRefresh size={size === 'sm' ? 12 : 14} />
        </span>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 12 : 14} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
