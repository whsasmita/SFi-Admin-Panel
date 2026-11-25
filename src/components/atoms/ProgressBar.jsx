import React from 'react';

/**
 * Atom: ProgressBar
 * Reusable progress indicator supporting 0-100% values, animated striping, status coloring, and dual labels.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  height = 8,
  color = null,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'info'
  striped = false,
  animated = false,
  showValue = false,
  label = null,
  sublabel = null,
  style = {},
}) {
  const percent = Math.min(100, Math.max(0, Math.round(((value || 0) / (max || 100)) * 100)));

  const variantColors = {
    primary: '#0284c7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
  };

  const activeColor = color || variantColors[variant] || '#0284c7';

  return (
    <div style={{ width: '100%', ...style }}>
      {(label || sublabel || showValue) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          {label && <span style={{ color: '#475569', fontWeight: 600 }}>{label}</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            {sublabel && <span style={{ color: '#64748b' }}>{sublabel}</span>}
            {showValue && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: activeColor,
                  fontSize: 12,
                }}
              >
                {percent}%
              </span>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: '#f1f5f9',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative',
        }}
      >
        <div
          className={`progress-bar-inner ${striped ? 'progress-bar-striped' : ''} ${
            animated ? 'progress-bar-animated' : ''
          }`}
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: activeColor,
            borderRadius: `${height / 2}px`,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}
