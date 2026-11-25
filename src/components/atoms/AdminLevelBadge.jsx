import React from 'react';

/**
 * Atom: AdminLevelBadge
 * Level 1: Province
 * Level 2: District
 * Level 3: Subdistrict
 * Level 4: Village
 * Level 5: Hydrological
 * Level 6: POI / General
 */
export default function AdminLevelBadge({ level }) {
  const lvlNum = parseInt(level, 10);
  let label = `Lvl ${level || '—'}`;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderRadius: 4,
        backgroundColor: '#f1f5f9',
        border: '1px solid #e2e8f0',
        color: '#475569',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
      }}
      title={`Administrative Level ${level}`}
    >
      {label}
    </span>
  );
}
