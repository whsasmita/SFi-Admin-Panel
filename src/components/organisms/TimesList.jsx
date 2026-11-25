import React, { useState } from 'react';
import Button from '../atoms/Button.jsx';
import Input from '../atoms/Input.jsx';
import Select from '../atoms/Select.jsx';
import { IconSave, IconX } from '../atoms/Icons.jsx';

/**
 * Organism: TimesList
 * Interactive CRUD list for temporal expressions extracted from news articles
 */
export default function TimesList({
  times = [],
  canEdit = true,
  onAddTime,
  onUpdateTime,
  onDeleteTime,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState({
    time_expression: '',
    calendar_system: 'CommonEra',
  });
  const [isCreating, setIsCreating] = useState(false);

  const calendarOptions = [
    { value: 'CommonEra', label: 'CommonEra (CE)' },
    { value: 'BuddhistEra', label: 'BuddhistEra (BE)' },
  ];

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditDraft({
      time_expression: t.time_expression || '',
      calendar_system: t.calendar_system || 'CommonEra',
    });
  };

  const handleSaveEdit = async (id) => {
    if (!onUpdateTime) return;
    try {
      setSavingId(id);
      await onUpdateTime(id, editDraft);
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTime.time_expression || !onAddTime) return;
    try {
      setIsCreating(true);
      await onAddTime(newTime);
      setNewTime({ time_expression: '', calendar_system: 'CommonEra' });
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
          Extracted Temporal Mentions ({times.length})
        </h4>
        {canEdit && onAddTime && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding((p) => !p)}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            {isAdding ? 'Cancel' : '+ Add Time'}
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
            gridTemplateColumns: '1fr 140px auto',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="Time (e.g. October 12, 2024)"
            value={newTime.time_expression}
            onChange={(e) => setNewTime((p) => ({ ...p, time_expression: e.target.value }))}
          />
          <Select
            value={newTime.calendar_system}
            onChange={(e) => setNewTime((p) => ({ ...p, calendar_system: e.target.value }))}
            options={calendarOptions}
          />
          <Button variant="primary" size="sm" type="submit" disabled={isCreating}>
            {isCreating ? '...' : 'Add'}
          </Button>
        </form>
      )}

      {times.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: 12 }}>
          No temporal expressions extracted.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {times.map((t) => {
            const isEditing = editingId === t.id;
            return (
              <div
                key={t.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                {isEditing ? (
                  <>
                    <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                      <Input
                        value={editDraft.time_expression}
                        onChange={(e) => setEditDraft((p) => ({ ...p, time_expression: e.target.value }))}
                        style={{ height: 26, flex: 1 }}
                      />
                      <Select
                        value={editDraft.calendar_system}
                        onChange={(e) => setEditDraft((p) => ({ ...p, calendar_system: e.target.value }))}
                        options={calendarOptions}
                        style={{ height: 26, width: 140 }}
                      />
                    </div>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ padding: '3px 6px' }}
                        onClick={() => handleSaveEdit(t.id)}
                        disabled={savingId === t.id}
                      >
                        <IconSave size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ padding: '3px 5px' }}
                        onClick={() => setEditingId(null)}
                      >
                        <IconX size={12} />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{t.time_expression}</strong>
                      <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>
                        ({t.calendar_system || 'CommonEra'})
                      </span>
                    </div>
                    {canEdit && (
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ fontSize: 10.5, padding: '2px 6px' }}
                          onClick={() => startEdit(t)}
                        >
                          Edit
                        </Button>
                        {onDeleteTime && (
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ padding: '2px 5px', color: '#94a3b8' }}
                            onClick={() => onDeleteTime(t.id)}
                            title="Delete temporal mention"
                          >
                            <IconX size={12} />
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
