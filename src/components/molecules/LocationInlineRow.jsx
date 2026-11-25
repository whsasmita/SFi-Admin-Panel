import React from 'react';
import Input from '../atoms/Input.jsx';
import Select from '../atoms/Select.jsx';
import Button from '../atoms/Button.jsx';
import AdminLevelBadge from '../atoms/AdminLevelBadge.jsx';
import { IconCheckCircle, IconSave, IconX } from '../atoms/Icons.jsx';

/**
 * Molecule: LocationInlineRow
 */
export default function LocationInlineRow({
  loc,
  editState = {},
  isSelected = false,
  canEdit = true,
  onSelect,
  onFieldChange,
  onSave,
  onDelete,
}) {
  const semanticOptions = [
    { value: 'FLOOD', label: 'FLOOD (Hazard)' },
    { value: 'EVACUATION', label: 'EVACUATION (Shelter)' },
    { value: 'GENERAL', label: 'GENERAL (Area)' },
  ];

  const validationOptions = [
    { value: 'PENDING', label: 'PENDING' },
    { value: 'APPROVED', label: 'APPROVED' },
    { value: 'MODIFIED', label: 'MODIFIED' },
    { value: 'REJECTED', label: 'REJECTED' },
  ];

  let parentPathArr = [];
  if (loc.parent_path) {
    if (Array.isArray(loc.parent_path)) {
      parentPathArr = loc.parent_path;
    } else if (typeof loc.parent_path === 'string') {
      try {
        parentPathArr = JSON.parse(loc.parent_path);
      } catch {
        parentPathArr = [];
      }
    }
  }

  return (
    <tr
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? '#f0f9ff' : undefined,
        cursor: 'pointer',
      }}
    >
      {/* Location Name, Parent Hierarchy & Address */}
      <td>
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 12 }}>
          {loc.text_en || loc.text_th || loc.node_id}
        </div>
        {loc.text_th && loc.text_th !== loc.text_en && (
          <div style={{ fontSize: 11, color: '#64748b' }}>{loc.text_th}</div>
        )}
        {parentPathArr.length > 0 && (
          <div style={{ fontSize: 10, color: '#0284c7', fontWeight: 600, marginTop: 2 }}>
            ↳ {parentPathArr.join(' › ')}
          </div>
        )}
        {loc.formatted_address && (
          <div
            style={{
              fontSize: 10,
              color: '#94a3b8',
              maxWidth: '230px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={loc.formatted_address}
          >
            {loc.formatted_address}
          </div>
        )}
        {loc.rejection_reason && (
          <div style={{ fontSize: 9.5, color: '#dc2626', fontWeight: 600, marginTop: 1 }}>
            ⚠ {loc.rejection_reason}
          </div>
        )}
      </td>

      {/* Admin Level */}
      <td>
        <AdminLevelBadge level={loc.admin_level} />
      </td>

      {/* Lat / Lng Inputs */}
      <td onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Input
            isMono
            placeholder="Latitude"
            value={editState.lat !== undefined ? editState.lat : ''}
            onChange={(e) => onFieldChange(loc.id, 'lat', e.target.value)}
            disabled={!canEdit}
            style={{ height: '26px' }}
          />
          <Input
            isMono
            placeholder="Longitude"
            value={editState.lng !== undefined ? editState.lng : ''}
            onChange={(e) => onFieldChange(loc.id, 'lng', e.target.value)}
            disabled={!canEdit}
            style={{ height: '26px' }}
          />
        </div>
      </td>

      {/* Semantic Role Select */}
      <td onClick={(e) => e.stopPropagation()}>
        <Select
          value={editState.semantic_role || 'FLOOD'}
          onChange={(e) => onFieldChange(loc.id, 'semantic_role', e.target.value)}
          options={semanticOptions}
          disabled={!canEdit}
          style={{ height: '28px' }}
        />
      </td>

      {/* Validation Status Select */}
      <td onClick={(e) => e.stopPropagation()}>
        <Select
          value={editState.validation_status || 'PENDING'}
          onChange={(e) => onFieldChange(loc.id, 'validation_status', e.target.value)}
          options={validationOptions}
          disabled={!canEdit}
          style={{ height: '28px' }}
        />
      </td>

      {/* Action Save & Delete Buttons */}
      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Button
            variant="outline"
            size="sm"
            style={{
              padding: '4px 6px',
              backgroundColor: editState.saved ? '#ecfdf5' : undefined,
              borderColor: editState.saved ? '#a7f3d0' : undefined,
              color: editState.saved ? '#065f46' : undefined,
            }}
            onClick={() => onSave(loc)}
            disabled={!canEdit || editState.saving}
            title="Save location changes"
          >
            {editState.saving ? (
              '...'
            ) : editState.saved ? (
              <IconCheckCircle size={14} color="#059669" />
            ) : (
              <IconSave size={13} />
            )}
          </Button>
          {canEdit && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              style={{ padding: '4px 5px', color: '#94a3b8' }}
              onClick={() => onDelete(loc.id)}
              title="Delete location"
            >
              <IconX size={13} />
            </Button>
          )}
        </div>
        {editState.error && (
          <div style={{ fontSize: 9, color: '#dc2626', marginTop: 2 }}>Error</div>
        )}
      </td>
    </tr>
  );
}
