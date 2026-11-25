import React from 'react';
import Input from '../atoms/Input.jsx';
import Button from '../atoms/Button.jsx';
import { IconSearch } from '../atoms/Icons.jsx';

/**
 * Molecule: SearchBar
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search by Thai or English title...',
  loading = false,
}) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 440 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ height: '34px', paddingLeft: '32px', fontSize: '13px' }}
        />
        <div style={{ position: 'absolute', left: 10, top: 9, color: '#94a3b8' }}>
          <IconSearch size={14} />
        </div>
      </div>
      <Button type="submit" variant="primary" size="sm" style={{ padding: '0 12px' }} disabled={loading}>
        Search
      </Button>
      {value && (
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </form>
  );
}
