import React from 'react';

/**
 * Atom: RoleBadge
 * FLOOD: Red/Crimson
 * EVACUATION: Emerald
 * GENERAL: Slate
 */
export default function RoleBadge({ role }) {
  if (!role) return null;

  const normalized = String(role).toUpperCase();

  let badgeClass = 'badge-role-general';
  let label = role;

  if (normalized === 'FLOOD') {
    badgeClass = 'badge-role-flood';
    label = 'Flood Hazard';
  } else if (normalized === 'EVACUATION') {
    badgeClass = 'badge-role-evac';
    label = 'Evac Shelter';
  } else {
    badgeClass = 'badge-role-general';
    label = 'General Area';
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}
