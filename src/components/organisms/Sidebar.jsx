import React from 'react';
import taLogo from '../../assets/TA.png';
import { IconDatabase, IconFileText, IconActivity, IconLayers } from '../atoms/Icons.jsx';

/**
 * Organism: Sidebar
 * Dark Mode Navigation Sidebar with high contrast and precision system monitoring
 */
export default function Sidebar({ currentTab, onSelectTab, healthData }) {
  const isConnected = healthData?.graphdb_status === 'CONNECTED';
  const totalArticles = healthData?.database_statistics?.total_articles || 695;

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <img
          src={taLogo}
          alt="SFi Admin Logo"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            objectFit: 'contain',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
          }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Admin Console
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Knowledge Graph Curation
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 8px 6px',
          }}
        >
          Core Workspace
        </div>

        {/* Tab 1: Dashboard Overview */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: currentTab === 'dashboard' ? 600 : 500,
            color: currentTab === 'dashboard' ? '#ffffff' : '#94a3b8',
            backgroundColor: currentTab === 'dashboard' ? '#1e293b' : 'transparent',
            border: 'none',
            borderLeft: currentTab === 'dashboard' ? '3px solid #0284c7' : '3px solid transparent',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            if (currentTab !== 'dashboard') e.currentTarget.style.backgroundColor = '#151f32';
          }}
          onMouseLeave={(e) => {
            if (currentTab !== 'dashboard') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconActivity size={16} color={currentTab === 'dashboard' ? '#38bdf8' : '#64748b'} />
            <span>Dashboard Overview</span>
          </div>
        </button>

        {/* Tab 2: Staging Queue */}
        <button
          type="button"
          onClick={() => onSelectTab('staging')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: currentTab === 'staging' || currentTab === 'detail' ? 600 : 500,
            color: currentTab === 'staging' || currentTab === 'detail' ? '#ffffff' : '#94a3b8',
            backgroundColor: currentTab === 'staging' || currentTab === 'detail' ? '#1e293b' : 'transparent',
            border: 'none',
            borderLeft: currentTab === 'staging' || currentTab === 'detail' ? '3px solid #0284c7' : '3px solid transparent',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            if (currentTab !== 'staging' && currentTab !== 'detail') e.currentTarget.style.backgroundColor = '#151f32';
          }}
          onMouseLeave={(e) => {
            if (currentTab !== 'staging' && currentTab !== 'detail') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconFileText size={16} color={currentTab === 'staging' || currentTab === 'detail' ? '#38bdf8' : '#64748b'} />
            <span>Staging Queue</span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: '#0f172a',
              color: '#94a3b8',
              border: '1px solid #334155',
            }}
          >
            {totalArticles}
          </span>
        </button>
      </nav>

      {/* Footer System Status Panel */}
      <div
        style={{
          padding: '16px 18px',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#070b12',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IconDatabase size={13} color="#64748b" />
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>GraphDB SPARQL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              className={isConnected ? 'animate-pulse-live' : ''}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#ef4444',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 700, color: isConnected ? '#10b981' : '#ef4444' }}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: '#f8fafc', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          {healthData?.graphdb_triples_count
            ? `${healthData.graphdb_triples_count.toLocaleString()} Triples`
            : 'Connecting...'}
        </div>

        <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span>Repo: <strong>flood-events-db</strong></span>
          <span>v10.x</span>
        </div>
      </div>
    </aside>
  );
}
