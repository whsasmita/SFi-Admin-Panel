import React from 'react';

/**
 * Atom: StatusBadge
 */
export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let badgeClass = 'badge-pending';
  let dotColor = '#f59e0b';
  let label = status;

  switch (normalized) {
    case 'PUBLISHED_TO_KG':
    case 'PUBLISHED':
      badgeClass = 'badge-approved';
      dotColor = '#10b981';
      label = 'Published to KG';
      break;
    case 'APPROVED':
      badgeClass = 'badge-approved';
      dotColor = '#10b981';
      label = 'Approved';
      break;
    case 'VALIDATED':
      badgeClass = 'badge-validated';
      dotColor = '#0284c7';
      label = 'Validated';
      break;
    case 'PROCESSING':
      badgeClass = 'badge-processing';
      dotColor = '#0284c7';
      label = 'Processing';
      break;
    case 'MODIFIED':
      badgeClass = 'badge-modified';
      dotColor = '#6366f1';
      label = 'Modified';
      break;
    case 'SCRAPED':
      badgeClass = 'badge-scraped';
      dotColor = '#f59e0b';
      label = 'Scraped';
      break;
    case 'PENDING':
      badgeClass = 'badge-pending';
      dotColor = '#f59e0b';
      label = 'Pending';
      break;
    case 'REJECTED':
      badgeClass = 'badge-rejected';
      dotColor = '#ef4444';
      label = 'Rejected';
      break;
    case 'CONNECTED':
      badgeClass = 'badge-approved';
      dotColor = '#10b981';
      label = 'Connected';
      break;
    case 'DISCONNECTED':
    case 'FAILED':
      badgeClass = 'badge-rejected';
      dotColor = '#ef4444';
      label = 'Disconnected';
      break;
    default:
      badgeClass = 'badge-pending';
      dotColor = '#64748b';
      label = status;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}
