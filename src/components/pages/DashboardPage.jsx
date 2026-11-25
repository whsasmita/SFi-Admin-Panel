import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client.js';
import MetricCard from '../molecules/MetricCard.jsx';
import GraphDbStatusCard from '../molecules/GraphDbStatusCard.jsx';
import Button from '../atoms/Button.jsx';
import { IconRefresh, IconFileText, IconAlertTriangle, IconCheckCircle, IconExternalLink } from '../atoms/Icons.jsx';

/**
 * Page: DashboardPage
 * Analytics, Apify Limits & Quota, NLP Microservice Health, and Knowledge Graph Status
 */
export default function DashboardPage({ onNavigate, onUpdateHealth }) {
  const [health, setHealth] = useState(null);
  const [crawlerStats, setCrawlerStats] = useState(null);
  const [nlpHealth, setNlpHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all three status endpoints in parallel
      const [healthRes, crawlerRes, nlpRes] = await Promise.allSettled([
        apiClient.getPipelineHealth(),
        apiClient.getCrawlerStats(),
        apiClient.getNlpHealth(),
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value.success) {
        setHealth(healthRes.value.data);
        if (onUpdateHealth) onUpdateHealth(healthRes.value.data);
      }

      if (crawlerRes.status === 'fulfilled' && crawlerRes.value.success) {
        setCrawlerStats(crawlerRes.value.data);
      }

      if (nlpRes.status === 'fulfilled' && nlpRes.value.success) {
        setNlpHealth(nlpRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.message || 'Failed to connect to backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMetrics();
  }, []);

  const stats = health?.database_statistics || {};
  const apify = crawlerStats || {};
  const nlp = nlpHealth || {};

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Pipeline Health & Disaster Inventory Analytics
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
            Real-time status of staged disaster news, Apify crawler quotas, NLP microservices, and Ontotext GraphDB RDF repository.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="outline"
            onClick={fetchAllMetrics}
            disabled={loading}
            icon={IconRefresh}
          >
            {loading ? 'Refreshing...' : 'Refresh Metrics'}
          </Button>
          <Button
            variant="primary"
            onClick={() => onNavigate('staging')}
            icon={IconFileText}
          >
            Open Staging Queue
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderRadius: 8,
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#9f1239',
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          <IconAlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Clean Metric Cards Grid */}
      <div className="metric-grid" style={{ marginBottom: 24 }}>
        <MetricCard
          label="Total Articles Staged"
          value={stats.total_articles || 0}
          subtext="Scraped natural disaster news"
        />
        <MetricCard
          label="Published to KG"
          value={stats.published_count || 0}
          valueColor="#059669"
          subtext="Active in GraphDB Knowledge Graph"
        />
        <MetricCard
          label="Ready for Review"
          value={stats.ready_count || 0}
          valueColor="#0284c7"
          subtext="Validated entities pending publish"
        />
        <MetricCard
          label="Pending Ingestion"
          value={stats.pending_count || 0}
          valueColor="#d97706"
          subtext="Raw scraped articles queue"
        />
      </div>

      {/* Two-Column Infrastructure Cards: Apify Crawler & Quota (Left) + NLP / AI Service (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Apify Quota & Resource Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '20px 22px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: apify.connection_status === 'CONNECTED' ? '#10b981' : '#f59e0b',
                }}
              />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Apify Web Scraper & Monthly Limit
              </h3>
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              Free Tier Quota
            </span>
          </div>

          {/* Quota Progress Bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: '#64748b' }}>
                Monthly Free Usage: <strong style={{ color: '#0f172a' }}>${(apify.used_usd || 0).toFixed(3)}</strong> / ${apify.monthly_limit_usd?.toFixed(2) || '5.00'}
              </span>
              <span style={{ color: '#059669', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {apify.remaining_percent || 100}% Remaining (${(apify.remaining_usd || 5.0).toFixed(3)})
              </span>
            </div>
            <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${apify.usage_percent || 0}%`,
                  height: '100%',
                  backgroundColor: (apify.usage_percent || 0) > 80 ? '#ef4444' : '#0284c7',
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Latest Scraper Run Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '12px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9', fontSize: 12 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>Task Status</div>
              <div style={{ fontWeight: 700, color: apify.latest_run?.status === 'RUNNING' ? '#0284c7' : '#059669' }}>
                {apify.latest_run?.status || 'IDLE'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>Dataset Items</div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                {apify.latest_run?.dataset_items_count || 0} scraped
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>Latest Run Cost</div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                ${(apify.latest_run?.cost_usd || 0).toFixed(4)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>
              Active Task: <code style={{ color: '#0284c7' }}>{apify.task_id || 'cheerio-scraper-task'}</code>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('staging')}
              style={{
                fontSize: 12,
                color: '#0284c7',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
              }}
            >
              <span>Trigger Scraper in Staging</span>
              <IconExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* NLP Microservice Status Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '20px 22px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: nlp.status === 'OK' ? '#10b981' : '#f59e0b',
                }}
              />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                NLP & Geoparsing Engine
              </h3>
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: 4,
                backgroundColor: nlp.status === 'OK' ? '#ecfdf5' : '#fffbeb',
                color: nlp.status === 'OK' ? '#065f46' : '#92400e',
                fontWeight: 600,
              }}
            >
              {nlp.status === 'OK' ? 'ONLINE (Port 8000)' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Translation Model:</span>
              <strong style={{ color: '#0f172a' }}>Meta NLLB-200 (1.3B Distilled)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Named Entity Recognizer:</span>
              <strong style={{ color: '#0f172a' }}>Dual-Track BERT NER + 77-Prov Thai Gazetteer</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Temporal Normalizer:</span>
              <strong style={{ color: '#059669' }}>Anchor-Based Fallback (TIME)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Impact Ontology Cleaner:</span>
              <strong style={{ color: '#059669' }}>Semantics & Unit Validator (IMPACT)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Geocoder Spatial Engine:</span>
              <strong style={{ color: '#0284c7' }}>5-Tier Fallback + 77 Offline Centroids</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Compute Acceleration:</span>
              <strong style={{ color: nlp.cuda_available ? '#059669' : '#475569' }}>
                {nlp.device ? nlp.device.toUpperCase() : 'CPU (PyTorch)'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* GraphDB Status Card Molecule */}
      <GraphDbStatusCard healthData={health} />

      {/* Human-in-the-Loop Operational Guide */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '22px 24px',
          boxShadow: 'var(--shadow-card)',
          marginTop: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <IconCheckCircle size={17} color="#0284c7" />
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Human-in-the-Loop Curation Standard Operating Procedure (SOP)
          </h4>
        </div>
        <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 12 }}>
          Standard curation workflow for system operators to validate disaster data prior to Knowledge Graph publishing:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginBottom: 4 }}>1. Open Staging Queue</div>
            <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
              Select a flood disaster news article from the queue and review the original Thai source text alongside its neural translation.
            </div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginBottom: 4 }}>2. Validate Spatial Coordinates</div>
            <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
              Use the interactive Mini-Map Inspector to ensure resolved coordinates fall strictly within Thailand territorial bounds.
            </div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginBottom: 4 }}>3. Assign Semantic Roles</div>
            <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
              Verify accurate classification between inundated hazard zones (<code>FLOOD</code>) and relief shelter hubs (<code>EVACUATION</code>).
            </div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', marginBottom: 4 }}>4. Publish to Knowledge Graph</div>
            <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
              Authorized administrators trigger on-demand RDF Turtle triplification pushed directly into the Ontotext GraphDB repository.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
