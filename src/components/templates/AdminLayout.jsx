import React from 'react';

/**
 * Template: AdminLayout
 * Composes Sidebar, HeaderBar, and main content area
 */
export default function AdminLayout({ sidebar, header, children }) {
  return (
    <div className="admin-layout">
      {sidebar}
      <div className="admin-main">
        {header}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
