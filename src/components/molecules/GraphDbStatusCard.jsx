import React from 'react';
import { IconDatabase } from '../atoms/Icons.jsx';
import StatusBadge from '../atoms/StatusBadge.jsx';

/**
 * Molecule: GraphDbStatusCard
 */
export default function GraphDbStatusCard({ healthData }) {
  const isConnected = healthData?.graphdb_status === 'CONNECTED';

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '20px',
        marginBottom: 24,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: isConnected ? '#ecfdf5' : '#fff1f2',
              color: isConnected ? '#059669' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconDatabase size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
              Ontotext GraphDB RDF Repository
            </h3>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              SPARQL 1.1 Endpoint (`http://localhost:7200/repositories/flood-events-db`)
            </div>
          </div>
        </div>

        <StatusBadge status={isConnected ? 'CONNECTED' : 'DISCONNECTED'} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          borderRadius: 4,
          border: '1px solid #f1f5f9',
          fontSize: 12,
        }}
      >
        <div>
          <span style={{ color: '#64748b' }}>Repository ID:</span>{' '}
          <strong style={{ fontFamily: 'var(--font-mono)' }}>flood-events-db</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Total Active Triples:</span>{' '}
          <strong style={{ fontFamily: 'var(--font-mono)', color: '#059669' }}>
            {healthData?.graphdb_triples_count !== undefined
              ? `${healthData.graphdb_triples_count.toLocaleString()} triples`
              : '—'}
          </strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Ontology Standard:</span>{' '}
          <strong>W3C OWL / RDF-S / Geo WGS84</strong>
        </div>
      </div>
    </div>
  );
}
