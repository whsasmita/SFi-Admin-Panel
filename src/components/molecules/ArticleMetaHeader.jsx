import React from 'react';
import StatusBadge from '../atoms/StatusBadge.jsx';
import Select from '../atoms/Select.jsx';
import Button from '../atoms/Button.jsx';
import { IconExternalLink, IconCheckCircle } from '../atoms/Icons.jsx';

/**
 * Molecule: ArticleMetaHeader
 * Displays article metadata + quick status selector and 1-click article approval
 */
export default function ArticleMetaHeader({
  article,
  canEdit = true,
  onStatusChange,
  onApproveArticleQuick,
  isApproving = false,
}) {
  if (!article) return null;

  const statusOptions = [
    { value: 'SCRAPED', label: 'Status: SCRAPED' },
    { value: 'PROCESSING', label: 'Status: PROCESSING' },
    { value: 'VALIDATED', label: 'Status: VALIDATED (Curated)' },
    { value: 'PUBLISHED_TO_KG', label: 'Status: PUBLISHED_TO_KG' },
    { value: 'REJECTED', label: 'Status: REJECTED' },
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '20px',
        marginBottom: 20,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: '#0284c7' }}>
              Article #{article.id}
            </span>
            <StatusBadge status={article.status} />
            {article.is_foreign ? (
              <span className="badge badge-rejected">International News</span>
            ) : (
              <span className="badge badge-approved">Domestic Thailand</span>
            )}
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: 6 }}>
            {article.title_en || article.title}
          </h2>

          {article.title_th && article.title_th !== article.title_en && (
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>
              {article.title_th}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#64748b' }}>
            <div>
              Date: <strong style={{ color: '#334155' }}>{article.publish_date || '—'}</strong>
            </div>
            <div>
              Source: <strong style={{ color: '#334155' }}>{article.source || 'Cheerio'}</strong>
            </div>
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#0284c7',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>Original Article Link</span>
                <IconExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Quick Status Change & 1-Click Approve Controls */}
        {canEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 210 }}>
            {onApproveArticleQuick && article.status !== 'PUBLISHED_TO_KG' && (
              <Button
                variant="primary"
                size="sm"
                icon={IconCheckCircle}
                onClick={onApproveArticleQuick}
                disabled={isApproving}
                title="Approve all valid locations & impacts and set article status to VALIDATED in 1 click"
              >
                {isApproving ? 'Approving...' : 'Approve All & Mark Validated'}
              </Button>
            )}
            {onStatusChange && (
              <div style={{ width: '100%' }}>
                <Select
                  value={article.status || 'SCRAPED'}
                  onChange={(e) => onStatusChange(e.target.value)}
                  options={statusOptions}
                  style={{ height: 30, fontSize: 12 }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
