import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import UserBadge from '../molecules/UserBadge.jsx';
import Button from '../atoms/Button.jsx';
import { IconLogOut, IconLayers } from '../atoms/Icons.jsx';

/**
 * Organism: HeaderBar
 * Executive Header with Environment Pill and Operator Session
 */
export default function HeaderBar({ pageTitle, breadcrumb }) {
  const { user, logout, role } = useAuth();

  return (
    <header className="admin-header">
      {/* Breadcrumb & Navigation Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748b' }}>
          <span>Admin</span>
          <span style={{ color: '#cbd5e1' }}>/</span>
          {breadcrumb && (
            <>
              <span style={{ fontWeight: 500, color: '#475569' }}>{breadcrumb}</span>
              <span style={{ color: '#cbd5e1' }}>/</span>
            </>
          )}
        </div>
        <h1 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right Side: User Profile + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* User Identity Molecule */}
        <UserBadge user={user} role={role} />

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          icon={IconLogOut}
          title="Sign out of admin session"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
