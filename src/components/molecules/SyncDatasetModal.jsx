import React, { useState } from 'react';
import Modal from '../atoms/Modal.jsx';
import Button from '../atoms/Button.jsx';
import ProgressBar from '../atoms/ProgressBar.jsx';
import {
  IconRefresh,
  IconCheckCircle,
  IconAlertTriangle,
} from '../atoms/Icons.jsx';
import { apiClient } from '../../api/client.js';

/**
 * Molecule: SyncDatasetModal
 * Interactive modal for syncing scraped disaster news dataset from Apify to MySQL staging database.
 */
export default function SyncDatasetModal({
  isOpen,
  onClose,
  onComplete,
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Idle');
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  const handleStartSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      setSyncResult(null);
      setProgress(20);
      setCurrentStep('1. Connecting to Apify Dataset Cloud Storage...');

      setTimeout(() => {
        setProgress(50);
        setCurrentStep('2. Downloading scraped items & validating schema...');
      }, 400);

      setTimeout(() => {
        setProgress(75);
        setCurrentStep('3. Performing URL deduplication & staging into MySQL...');
      }, 900);

      const res = await apiClient.syncCrawlerDataset();

      setProgress(100);
      setCurrentStep('Synchronization complete.');

      if (res.success) {
        setSyncResult(res.data);
        if (onComplete) onComplete(res.data);
      } else {
        setError(res.message || 'Sync failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to sync Apify dataset to MySQL.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClose = () => {
    if (isSyncing) return;
    setProgress(0);
    setSyncResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sync Apify Dataset into MySQL Staging Queue"
      maxWidth={520}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSyncing}>
            {syncResult ? 'Done' : 'Cancel'}
          </Button>
          {!syncResult && (
            <Button
              variant="publish"
              onClick={handleStartSync}
              disabled={isSyncing}
              icon={IconRefresh}
            >
              {isSyncing ? 'Synchronizing...' : 'Start Dataset Ingestion (0-100%)'}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!isSyncing && !syncResult && (
          <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>
            This process reads the latest dataset extracted by Apify scraper, checks for existing URLs in the database to prevent duplicate articles, and stages new natural disaster news into MySQL.
          </p>
        )}

        {(isSyncing || syncResult) && (
          <div>
            <ProgressBar
              value={progress}
              showValue
              height={10}
              animated={isSyncing}
              striped={isSyncing}
              variant={syncResult ? 'success' : error ? 'danger' : 'primary'}
              label={currentStep}
              sublabel={`${progress}%`}
            />
          </div>
        )}

        {syncResult && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 6,
              fontSize: 13,
              color: '#065f46',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 8 }}>
              <IconCheckCircle size={18} color="#10b981" />
              <span>Dataset Synchronized Successfully!</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
              <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: 4, textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Scanned</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                  {syncResult.total || 0}
                </div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: 4, textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11, color: '#059669' }}>New Inserted</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                  {syncResult.inserted || 0}
                </div>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: 4, textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11, color: '#d97706' }}>Skipped Dups</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                  {syncResult.skipped || 0}
                </div>
              </div>
            </div>
          </div>
        )}

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
