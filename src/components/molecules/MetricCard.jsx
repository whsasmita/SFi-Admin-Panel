import React from 'react';

/**
 * Molecule: MetricCard
 * Clean data metric card (Stripe / Vercel style)
 */
export default function MetricCard({ label, value, subtext, valueColor }) {
  return (
    <div className="metric-card">
      <div className="metric-card-label">{label}</div>
      <div
        className="metric-card-value"
        style={{ color: valueColor || 'var(--text-main)' }}
      >
        {value !== undefined && value !== null ? value.toLocaleString() : '—'}
      </div>
      {subtext && <div className="metric-card-subtext">{subtext}</div>}
    </div>
  );
}
