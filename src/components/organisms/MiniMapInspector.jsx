import React, { useState } from 'react';
import RoleBadge from '../atoms/RoleBadge.jsx';
import MiniMapPreview from '../molecules/MiniMapPreview.jsx';
import Button from '../atoms/Button.jsx';
import { IconMapPin, IconCheckCircle } from '../atoms/Icons.jsx';

/**
 * Organism: MiniMapInspector
 * Spatial verification panel with interactive drag/click coordinate inspector,
 * hierarchy path display, and 1-click Save & Approve.
 */
export default function MiniMapInspector({
  selectedLoc,
  activeRole,
  activeLat,
  activeLng,
  canEdit = true,
  onCoordinateChange,
  onQuickSaveAndApprove,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCoords = () => {
    if (activeLat && activeLng) {
      navigator.clipboard.writeText(`${activeLat}, ${activeLng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  let parentPathArr = [];
  if (selectedLoc?.parent_path) {
    if (Array.isArray(selectedLoc.parent_path)) {
      parentPathArr = selectedLoc.parent_path;
    } else if (typeof selectedLoc.parent_path === 'string') {
      try {
        parentPathArr = JSON.parse(selectedLoc.parent_path);
      } catch {
        parentPathArr = [];
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Spatial Verification Map
        </h3>

        <div style={{ display: 'flex', gap: 6 }}>
          {activeLat && activeLng && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCoords}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              {copied ? <><IconCheckCircle size={12} color="#059669" /> Copied</> : 'Copy Lat,Lng'}
            </Button>
          )}
          {canEdit && selectedLoc && onQuickSaveAndApprove && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onQuickSaveAndApprove(selectedLoc)}
              style={{ fontSize: '11px', padding: '3px 9px' }}
              title="Save current coordinates and mark this location APPROVED"
            >
              Save & Approve Pin
            </Button>
          )}
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '16px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {selectedLoc ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>FOCUSED LOCATION ENTITY:</span>
                <RoleBadge role={activeRole} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                {selectedLoc.text_en || selectedLoc.text_th || selectedLoc.node_id}
                {selectedLoc.text_th && selectedLoc.text_th !== selectedLoc.text_en && (
                  <span style={{ fontWeight: 500, fontSize: 12, color: '#64748b', marginLeft: 6 }}>
                    ({selectedLoc.text_th})
                  </span>
                )}
              </div>

              {parentPathArr.length > 0 && (
                <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 600, marginTop: 3 }}>
                  Hierarchy: {parentPathArr.join(' ➔ ')} ➔ {selectedLoc.text_en || selectedLoc.text_th}
                </div>
              )}

              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, lineHeight: 1.3 }}>
                {selectedLoc.formatted_address || 'No formatted address registered in OpenStreetMap'}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {selectedLoc.geocode_level && (
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    Tier: {selectedLoc.geocode_level}
                  </span>
                )}
                {selectedLoc.geocode_confidence !== null && selectedLoc.geocode_confidence !== undefined && (
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    Conf: {Math.round(Number(selectedLoc.geocode_confidence) * 100)}%
                  </span>
                )}
                {selectedLoc.rejection_reason && (
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      backgroundColor: '#fff1f2',
                      color: '#9f1239',
                      border: '1px solid #fecdd3',
                    }}
                  >
                    Reason: {selectedLoc.rejection_reason}
                  </span>
                )}
              </div>
            </div>

            <MiniMapPreview
              lat={activeLat}
              lng={activeLng}
              label={selectedLoc.text_en || selectedLoc.text_th}
              semanticRole={activeRole}
              height={260}
              canEdit={canEdit}
              onCoordinateChange={onCoordinateChange}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b', fontSize: 12.5 }}>
            <IconMapPin size={24} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <div>Select any row from the locations table to inspect or adjust its spatial coordinates on the map.</div>
          </div>
        )}
      </div>
    </div>
  );
}
