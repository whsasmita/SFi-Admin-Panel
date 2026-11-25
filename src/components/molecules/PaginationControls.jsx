import React from 'react';
import Button from '../atoms/Button.jsx';

/**
 * Molecule: PaginationControls
 */
export default function PaginationControls({
  page,
  totalPages,
  totalItems,
  limit,
  currentCount,
  onPageChange,
  loading = false,
}) {
  const startItem = (page - 1) * limit + (currentCount > 0 ? 1 : 0);
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        fontSize: 12,
        color: '#64748b',
      }}
    >
      <div>
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
        <strong>{totalItems}</strong> articles
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span style={{ padding: '4px 8px', fontWeight: 600, color: '#0f172a' }}>
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
