import React, { useState, useEffect, useRef } from 'react';
import Modal from '../atoms/Modal.jsx';
import Button from '../atoms/Button.jsx';
import ProgressBar from '../atoms/ProgressBar.jsx';
import StatusBadge from '../atoms/StatusBadge.jsx';
import {
  IconRefresh,
  IconCheckCircle,
  IconAlertTriangle,
  IconExternalLink,
} from '../atoms/Icons.jsx';
import { apiClient } from '../../api/client.js';

/**
 * Molecule: CrawlerProgressModal
 * Real-time Apify scraping execution monitor with live polling, duration timer,
 * dataset count accumulator, 0-100% progress tracking, and direct 1-click MySQL ingestion.
 */
export default function CrawlerProgressModal({
  isOpen,
  onClose,
  runId,
  taskId = 'whsasmita/cheerio-scraper-task',
  onSyncComplete,
}) {
  const [status, setStatus] = useState('RUNNING'); // 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED'
  const [itemCount, setItemCount] = useState(0);
  const [costUsd, setCostUsd] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [datasetId, setDatasetId] = useState(null);
  const [error, setError] = useState(null);

  // Ingestion after scraper finishes
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const pollIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Timer counter
  useEffect(() => {
    if (!isOpen || !runId || status === 'SUCCEEDED' || status === 'FAILED' || status === 'ABORTED') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, runId, status]);

  // Polling function for Apify run status
  useEffect(() => {
    if (!isOpen || !runId) return;

    // Reset initial states
    setStatus('RUNNING');
    setItemCount(0);
    setElapsedSeconds(0);
    setProgressPercent(20);
    setError(null);
    setSyncResult(null);
    setSyncError(null);

    const checkStatus = async () => {
      try {
        const res = await apiClient.getCrawlerStatus(runId);
        if (res.success && res.data) {
          const d = res.data;
          setStatus(d.status);
          setItemCount(d.item_count || 0);
          setCostUsd(d.usage_total_usd || 0);
          if (d.dataset_id) setDatasetId(d.dataset_id);

          if (d.status === 'RUNNING') {
            // Smooth dynamic progress estimate based on items and time
            setProgressPercent((prev) => {
              if (d.item_count > 0) {
                return Math.min(88, Math.max(prev, 35 + d.item_count * 5));
              }
              return Math.min(80, prev + 5);
            });
          } else if (d.status === 'SUCCEEDED') {
            setProgressPercent(100);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          } else if (d.status === 'FAILED' || d.status === 'ABORTED') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setError(`Scraper finished with status: ${d.status}`);
          }
        }
      } catch (err) {
        console.warn('Crawler status poll error:', err);
      }
    };

    // Immediate check
    checkStatus();

    // Poll every 2.5s
    pollIntervalRef.current = setInterval(checkStatus, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, runId]);

  // Direct sync action
  const handleSyncToMySQL = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncProgress(30);

      // Simulate step 1
      setTimeout(() => setSyncProgress(65), 400);

      const res = await apiClient.syncCrawlerDataset(datasetId ? { datasetId } : { taskId });

      setSyncProgress(100);
      if (res.success) {
        setSyncResult(res.data);
        if (onSyncComplete) onSyncComplete(res.data);
      } else {
        setSyncError(res.message || 'Sync failed');
      }
    } catch (err) {
      setSyncError(err.message || 'Failed to sync dataset to MySQL');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={status === 'RUNNING' && !error ? () => {} : onClose}
      title="Apify Web Scraper Live Execution Monitor"
      maxWidth={560}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            Run ID: <code style={{ color: '#0284c7' }}>{runId || 'N/A'}</code>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSyncing}
          >
            {status === 'SUCCEEDED' ? 'Done & Close' : 'Close Monitor'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status Header Badge & Elapsed Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor:
                  status === 'SUCCEEDED'
                    ? '#10b981'
                    : status === 'RUNNING'
                    ? '#0284c7'
                    : '#ef4444',
              }}
              className={status === 'RUNNING' ? 'animate-pulse-live' : ''}
            />
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TASK STATUS</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                {status === 'RUNNING'
                  ? 'SCRAPING DISASTER ARTICLES IN PROGRESS...'
                  : status === 'SUCCEEDED'
                  ? 'SCRAPING COMPLETED SUCCESSFULLY'
                  : `STATUS: ${status}`}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ELAPSED TIME</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {formatTimer(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Dynamic 0-100% Progress Bar */}
        <div>
          <ProgressBar
            value={progressPercent}
            showValue
            height={10}
            animated={status === 'RUNNING'}
            striped={status === 'RUNNING'}
            variant={status === 'SUCCEEDED' ? 'success' : status === 'FAILED' ? 'danger' : 'primary'}
            label="Crawler Execution Pipeline"
            sublabel={`${progressPercent}% Completed`}
          />
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Items Scraped</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: itemCount > 0 ? '#059669' : '#0f172a',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {itemCount}
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Compute Cost</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
              ${(costUsd || 0).toFixed(4)}
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Target Actor</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#0284c7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {taskId.split('/')[1] || taskId}
            </div>
          </div>
        </div>

        {/* Real-time Checklist Stages */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 700, color: '#334155', marginBottom: 2 }}>Execution Milestones:</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534' }}>
            <IconCheckCircle size={15} color="#10b981" />
            <span>1. Apify Cloud Actor provisioned and started</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: status === 'RUNNING' && itemCount === 0 ? '#0284c7' : itemCount > 0 || status === 'SUCCEEDED' ? '#166534' : '#64748b',
            }}
          >
            {itemCount > 0 || status === 'SUCCEEDED' ? (
              <IconCheckCircle size={15} color="#10b981" />
            ) : (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #0284c7', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            )}
            <span>2. Crawling portal and parsing Thai flood disaster news</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: status === 'SUCCEEDED' ? '#166534' : itemCount > 0 ? '#0284c7' : '#94a3b8',
            }}
          >
            {status === 'SUCCEEDED' ? (
              <IconCheckCircle size={15} color="#10b981" />
            ) : itemCount > 0 ? (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #0284c7', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            ) : (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />
            )}
            <span>3. Storing extracted articles into Apify cloud dataset ({itemCount} items)</span>
          </div>
        </div>

        {/* Succeeded Action: 1-Click Sync to MySQL */}
        {status === 'SUCCEEDED' && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065f46', fontSize: 13, fontWeight: 700 }}>
              <IconCheckCircle size={18} color="#10b981" />
              <span>Scraper successfully extracted {itemCount} disaster articles!</span>
            </div>

            <p style={{ fontSize: 12, color: '#047857', margin: 0 }}>
              Transfer the newly scraped articles directly into the MySQL staging database for NLP translation and curation.
            </p>

            {isSyncing && (
              <ProgressBar
                value={syncProgress}
                showValue
                height={6}
                animated
                striped
                variant="success"
                label="Syncing items from Apify Dataset to MySQL Database..."
              />
            )}

            {syncResult && (
              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: 4, fontSize: 12, border: '1px solid #bbf7d0', color: '#166534' }}>
                <strong>Ingestion Complete:</strong> {syncResult.inserted || 0} new articles inserted, {syncResult.skipped || 0} duplicate articles skipped.
              </div>
            )}

            {syncError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#fff1f2', borderRadius: 4, fontSize: 12, border: '1px solid #fecdd3', color: '#9f1239' }}>
                <strong>Sync Error:</strong> {syncError}
              </div>
            )}

            {!syncResult && (
              <Button
                variant="publish"
                onClick={handleSyncToMySQL}
                disabled={isSyncing}
                icon={IconRefresh}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSyncing ? 'Ingesting Dataset into MySQL...' : `Sync & Ingest ${itemCount} Items to MySQL Now (100%)`}
              </Button>
            )}
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 6,
              color: '#9f1239',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IconAlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
