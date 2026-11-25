import React, { useState } from 'react';
import LocationInlineRow from '../molecules/LocationInlineRow.jsx';
import Button from '../atoms/Button.jsx';
import Input from '../atoms/Input.jsx';
import Select from '../atoms/Select.jsx';
import { IconCheckCircle, IconCheck } from '../atoms/Icons.jsx';

/**
 * Organism: LocationsReviewTable
 * Human-in-the-loop interactive location curation table with bulk approval helpers and manual location creation
 */
export default function LocationsReviewTable({
  locations = [],
  editStates = {},
  selectedLocIndex = 0,
  canEdit = true,
  onSelectLocation,
  onLocationFieldChange,
  onSaveLocation,
  onDeleteLocation,
  onAddLocation,
  onApproveAll,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLoc, setNewLoc] = useState({
    text_en: '',
    text_th: '',
    admin_level: 2,
    lat: '',
    lng: '',
    semantic_role: 'FLOOD',
    validation_status: 'APPROVED',
  });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const approvedCount = locations.filter(
    (l) => (editStates[l.id]?.validation_status || l.validation_status) === 'APPROVED'
  ).length;

  const pendingCount = locations.filter(
    (l) => (editStates[l.id]?.validation_status || l.validation_status) === 'PENDING'
  ).length;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newLoc.text_en && !newLoc.text_th) return;
    try {
      setIsSubmittingNew(true);
      if (onAddLocation) {
        await onAddLocation(newLoc);
      }
      setNewLoc({
        text_en: '',
        text_th: '',
        admin_level: 2,
        lat: '',
        lng: '',
        semantic_role: 'FLOOD',
        validation_status: 'APPROVED',
      });
      setIsAdding(false);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div>
      {/* Table Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Extracted Spatial Locations ({locations.length})
          </h3>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              padding: '2px 7px',
              borderRadius: 4,
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              fontWeight: 600,
            }}
          >
            <IconCheck size={12} color="#059669" />
            <span>{approvedCount} Approved</span>
          </span>
          {pendingCount > 0 && (
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 4,
                backgroundColor: '#fffbeb',
                color: '#92400e',
                border: '1px solid #fde68a',
                fontWeight: 600,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {pendingCount} Pending
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {canEdit && onAddLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding((prev) => !prev)}
              style={{ fontSize: '11.5px', padding: '3px 8px' }}
            >
              {isAdding ? 'Cancel' : '+ Add Location'}
            </Button>
          )}
          {canEdit && pendingCount > 0 && onApproveAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onApproveAll}
              icon={IconCheckCircle}
              style={{ fontSize: '11.5px', padding: '3px 8px' }}
              title="Set all valid locations in this article to APPROVED"
            >
              Approve All Valid
            </Button>
          )}
        </div>
      </div>

      {/* Inline Add Location Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            padding: '12px',
            marginBottom: 12,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 110px 100px 100px 120px auto',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Name (EN) e.g. Hat Yai"
            value={newLoc.text_en}
            onChange={(e) => setNewLoc((p) => ({ ...p, text_en: e.target.value }))}
          />
          <Input
            placeholder="Name (TH) e.g. หาดใหญ่"
            value={newLoc.text_th}
            onChange={(e) => setNewLoc((p) => ({ ...p, text_th: e.target.value }))}
          />
          <Select
            value={newLoc.admin_level}
            onChange={(e) => setNewLoc((p) => ({ ...p, admin_level: Number(e.target.value) }))}
            options={[
              { value: 1, label: 'L1 Province' },
              { value: 2, label: 'L2 District' },
              { value: 3, label: 'L3 Subdist' },
              { value: 4, label: 'L4 Village' },
              { value: 5, label: 'L5 Hydro' },
              { value: 6, label: 'L6 POI' },
            ]}
          />
          <Input
            isMono
            placeholder="Lat (e.g. 7.008)"
            value={newLoc.lat}
            onChange={(e) => setNewLoc((p) => ({ ...p, lat: e.target.value }))}
          />
          <Input
            isMono
            placeholder="Lng (e.g. 100.47)"
            value={newLoc.lng}
            onChange={(e) => setNewLoc((p) => ({ ...p, lng: e.target.value }))}
          />
          <Select
            value={newLoc.semantic_role}
            onChange={(e) => setNewLoc((p) => ({ ...p, semantic_role: e.target.value }))}
            options={[
              { value: 'FLOOD', label: 'FLOOD' },
              { value: 'EVACUATION', label: 'EVACUATION' },
              { value: 'GENERAL', label: 'GENERAL' },
            ]}
          />
          <Button variant="primary" size="sm" type="submit" disabled={isSubmittingNew}>
            {isSubmittingNew ? '...' : 'Add'}
          </Button>
        </form>
      )}

      {/* Main Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Location Toponym (TH / EN)</th>
              <th style={{ width: '85px' }}>Admin Lvl</th>
              <th style={{ width: '180px' }}>Coordinates (Lat, Lng)</th>
              <th style={{ width: '130px' }}>Semantic Role</th>
              <th style={{ width: '125px' }}>Validation Status</th>
              <th style={{ width: '85px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No location entities extracted for this article.
                </td>
              </tr>
            ) : (
              locations.map((loc, idx) => (
                <LocationInlineRow
                  key={loc.id}
                  loc={loc}
                  editState={editStates[loc.id] || {}}
                  isSelected={idx === selectedLocIndex}
                  canEdit={canEdit}
                  onSelect={() => onSelectLocation(idx)}
                  onFieldChange={onLocationFieldChange}
                  onSave={onSaveLocation}
                  onDelete={onDeleteLocation}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
