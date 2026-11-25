import React from 'react';
import { IconUser } from '../atoms/Icons.jsx';

/**
 * Molecule: UserBadge
 */
export default function UserBadge({ user, role }) {
  let roleBadgeColor = '#475569';
  let roleBadgeBg = '#f1f5f9';

  if (role === 'SUPERADMIN' || role === 'ADMIN') {
    roleBadgeColor = '#0369a1';
    roleBadgeBg = '#e0f2fe';
  } else if (role === 'OPERATOR') {
    roleBadgeColor = '#047857';
    roleBadgeBg = '#d1fae5';
  } else if (role === 'VIEWER') {
    roleBadgeColor = '#b45309';
    roleBadgeBg = '#fef3c7';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
        >
          <IconUser size={15} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
            {user?.username || 'Operator'}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email}</div>
        </div>
      </div>

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          padding: '2px 8px',
          borderRadius: 4,
          backgroundColor: roleBadgeBg,
          color: roleBadgeColor,
          border: `1px solid ${roleBadgeColor}33`,
          textTransform: 'uppercase',
        }}
      >
        {role}
      </span>
    </div>
  );
}
