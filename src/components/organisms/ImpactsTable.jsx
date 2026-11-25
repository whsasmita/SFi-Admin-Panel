import React, { useState } from 'react';
import Button from '../atoms/Button.jsx';
import Input from '../atoms/Input.jsx';
import Select from '../atoms/Select.jsx';
import { IconSave, IconCheckCircle, IconX } from '../atoms/Icons.jsx';

/**
 * Organism: ImpactsTable
 * Interactive CRUD table for quantitative disaster impact metrics
 */
export default function ImpactsTable({
  impacts = [],
  canEdit = true,
  onAddImpact,
  onUpdateImpact,
  onDeleteImpact,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newImp, setNewImp] = useState({
    impact_type: 'HumanImpact',
    raw_expression: '',
    quantity_value: '',
    unit: 'persons',
    validation_status: 'APPROVED',
  });
  const [isCreating, setIsCreating] = useState(false);

  const impactTypeOptions = [
    { value: 'HumanImpact', label: 'HumanImpact' },
    { value: 'StructuralImpact', label: 'StructuralImpact' },
    { value: 'HydrologicalMetric', label: 'HydrologicalMetric' },
    { value: 'GeneralImpact', label: 'GeneralImpact' },
  ];

  const startEdit = (imp) => {
    setEditingId(imp.id);
    setEditDraft({
      impact_type: imp.impact_type || 'GeneralImpact',
      raw_expression: imp.raw_expression || '',
      quantity_value: imp.quantity_value !== null && imp.quantity_value !== undefined ? String(imp.quantity_value) : '',
      unit: imp.unit || '',
      validation_status: imp.validation_status || 'APPROVED',
    });
  };

  const handleSaveEdit = async (id) => {
    if (!onUpdateImpact) return;
    try {
      setSavingId(id);
      await onUpdateImpact(id, {
        ...editDraft,
        quantity_value: editDraft.quantity_value !== '' ? parseFloat(editDraft.quantity_value) : null,
      });
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newImp.raw_expression || !onAddImpact) return;
    try {
      setIsCreating(true);
      await onAddImpact({
        ...newImp,
        quantity_value: newImp.quantity_value !== '' ? parseFloat(newImp.quantity_value) : null,
      });
      setNewImp({
        impact_type: 'HumanImpact',
        raw_expression: '',
        quantity_value: '',
        unit: 'persons',
        validation_status: 'APPROVED',
      });
      setIsAdding(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          Reported Impacts & Metrics ({impacts.length})
        </h4>
        {canEdit && onAddImpact && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding((p) => !p)}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            {isAdding ? 'Cancel' : '+ Add Impact'}
          </Button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreateSubmit}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            padding: '10px',
            marginBottom: 12,
            display: 'grid',
            gridTemplateColumns: '130px 1fr 80px 80px auto',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <Select
            value={newImp.impact_type}
            onChange={(e) => setNewImp((p) => ({ ...p, impact_type: e.target.value }))}
            options={impactTypeOptions}
          />
          <Input
            placeholder="Raw Expression (e.g. 500 families)"
            value={newImp.raw_expression}
            onChange={(e) => setNewImp((p) => ({ ...p, raw_expression: e.target.value }))}
          />
          <Input
            isMono
            placeholder="Value"
            value={newImp.quantity_value}
            onChange={(e) => setNewImp((p) => ({ ...p, quantity_value: e.target.value }))}
          />
          <Input
            placeholder="Unit"
            value={newImp.unit}
            onChange={(e) => setNewImp((p) => ({ ...p, unit: e.target.value }))}
          />
          <Button variant="primary" size="sm" type="submit" disabled={isCreating}>
            {isCreating ? '...' : 'Add'}
          </Button>
        </form>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Impact Type</th>
              <th>Raw Expression</th>
              <th style={{ width: '85px', textAlign: 'right' }}>Value</th>
              <th style={{ width: '80px' }}>Unit</th>
              <th style={{ width: '90px' }}>Status</th>
              {canEdit && <th style={{ width: '85px', textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {impacts.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 6 : 5} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: 12 }}>
                  No quantified disaster impact metrics reported.
                </td>
              </tr>
            ) : (
              impacts.map((imp) => {
                const isEditing = editingId === imp.id;
                return (
                  <tr key={imp.id}>
                    <td>
                      {isEditing ? (
                        <Select
                          value={editDraft.impact_type}
                          onChange={(e) => setEditDraft((p) => ({ ...p, impact_type: e.target.value }))}
                          options={impactTypeOptions}
                          style={{ height: 26 }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: 12, color: '#0f172a' }}>
                          {imp.impact_type}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          value={editDraft.raw_expression}
                          onChange={(e) => setEditDraft((p) => ({ ...p, raw_expression: e.target.value }))}
                          style={{ height: 26 }}
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: '#475569' }}>{imp.raw_expression}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0284c7' }}>
                      {isEditing ? (
                        <Input
                          isMono
                          value={editDraft.quantity_value}
                          onChange={(e) => setEditDraft((p) => ({ ...p, quantity_value: e.target.value }))}
                          style={{ height: 26, textAlign: 'right' }}
                        />
                      ) : imp.quantity_value !== null && imp.quantity_value !== undefined ? (
                        Number(imp.quantity_value).toLocaleString()
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>
                      {isEditing ? (
                        <Input
                          value={editDraft.unit}
                          onChange={(e) => setEditDraft((p) => ({ ...p, unit: e.target.value }))}
                          style={{ height: 26 }}
                        />
                      ) : (
                        imp.unit || '—'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Select
                          value={editDraft.validation_status}
                          onChange={(e) => setEditDraft((p) => ({ ...p, validation_status: e.target.value }))}
                          options={[
                            { value: 'APPROVED', label: 'APPROVED' },
                            { value: 'REJECTED', label: 'REJECTED' },
                          ]}
                          style={{ height: 26 }}
                        />
                      ) : (
                        <span
                          className={`badge ${imp.validation_status === 'REJECTED' ? 'badge-rejected' : 'badge-approved'}`}
                          style={{ fontSize: 10 }}
                        >
                          {imp.validation_status || 'APPROVED'}
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td style={{ textAlign: 'center' }}>
                        {isEditing ? (
                          <div style={{ display: 'inline-flex', gap: 4 }}>
                            <Button
                              variant="primary"
                              size="sm"
                              style={{ padding: '3px 6px' }}
                              onClick={() => handleSaveEdit(imp.id)}
                              disabled={savingId === imp.id}
                              title="Save impact"
                            >
                              <IconSave size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              style={{ padding: '3px 5px' }}
                              onClick={() => setEditingId(null)}
                              title="Cancel"
                            >
                              <IconX size={12} />
                            </Button>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: 4 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              style={{ fontSize: 10.5, padding: '2px 6px' }}
                              onClick={() => startEdit(imp)}
                            >
                              Edit
                            </Button>
                            {onDeleteImpact && (
                              <Button
                                variant="ghost"
                                size="sm"
                                style={{ padding: '2px 5px', color: '#94a3b8' }}
                                onClick={() => onDeleteImpact(imp.id)}
                                title="Delete impact"
                              >
                                <IconX size={12} />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
