import React, { useEffect } from 'react';
import { IconAlertTriangle, IconX } from './Icons.jsx';
import Button from './Button.jsx';

/**
 * Atom: Modal Dialog
 * Responsive, executive-grade modal with fixed header, scrollable body, and fixed footer.
 * Never exceeds viewport height (max-height: calc(100vh - 48px)) and never overflows screen edges.
 */
export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
  maxWidth = 560,
  footer = null,
  icon = null,
  children,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const defaultIcon = icon || (isDanger ? <IconAlertTriangle size={18} /> : null);

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div
        className="modal-card"
        style={{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            {defaultIcon && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: isDanger ? '#fee2e2' : '#f0f9ff',
                  color: isDanger ? '#dc2626' : '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {defaultIcon}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.3,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </h3>
              {(subtitle || message) && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    margin: '2px 0 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle || message}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              marginLeft: 12,
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            title="Close dialog (Esc)"
          >
            <IconX size={15} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer ? (
          <div className="modal-footer">
            {footer}
          </div>
        ) : onConfirm ? (
          <div className="modal-footer">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={isDanger ? 'danger' : 'publish'}
              size="sm"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmText}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
