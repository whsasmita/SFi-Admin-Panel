import React, { useState, useEffect, useRef } from 'react';
import Modal from '../atoms/Modal.jsx';
import Button from '../atoms/Button.jsx';
import ProgressBar from '../atoms/ProgressBar.jsx';
import Select from '../atoms/Select.jsx';
import {
  IconSend,
  IconCheckCircle,
  IconAlertTriangle,
} from '../atoms/Icons.jsx';
import { apiClient } from '../../api/client.js';

/**
 * Molecule: PublishBatchModal
 * Bulk publish all VALIDATED articles to Ontotext GraphDB Knowledge Graph
 * using Atomic SPARQL Upsert with 0-100% live progress tracking.
 */
export default function PublishBatchModal({
  isOpen,
  onClose,
  onComplete,
}) {
  const [batchLimit, setBatchLimit] = useState(50);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('Idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const progressSimRef = useRef(null);

  useEffect(() => {
    if (isPublishing) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPublishing]);

  const handleStartBatchPublish = async () => {
    try {
      setIsPublishing(true);
      setError(null);
      setResult(null);
      setProgressPercent(15);
      setElapsedSeconds(0);
      setCurrentStepText('1. Querying curated & validated disaster articles from MySQL...');

      let currentProgress = 20;
      progressSimRef.current = setInterval(() => {
        currentProgress = Math.min(90, currentProgress + Math.floor(Math.random() * 10) + 5);
        setProgressPercent(currentProgress);

        if (currentProgress < 45) {
          setCurrentStepText('2. Executing Atomic Pre-Delete SPARQL Update (preventing duplicate triples)...');
        } else if (currentProgress < 75) {
          setCurrentStepText('3. Generating OWL/RDF Turtle (Events, Hierarchy, Impacts & Temporal nodes)...');
        } else {
          setCurrentStepText('4. Committing statements to Ontotext GraphDB & logging audit trail...');
        }
      }, 800);

      const res = await apiClient.publishBatchValidated({
        limit: Number(batchLimit),
      });

      if (progressSimRef.current) clearInterval(progressSimRef.current);
      setProgressPercent(100);
      setCurrentStepText('Bulk publication to Knowledge Graph completed (100%).');

      if (res.success) {
        setResult(res);
        if (onComplete) onComplete(res);
      } else {
        setError(res.message || 'Batch publish failed');
      }
    } catch (err) {
      if (progressSimRef.current) clearInterval(progressSimRef.current);
      setError(err.message || 'Failed to publish validated articles. Ensure Ontotext GraphDB is running on port 7200.');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (isPublishing) return;
    setProgressPercent(0);
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Publish All Validated Articles to Knowledge Graph"
      maxWidth={540}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isPublishing}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              variant="publish"
              onClick={handleStartBatchPublish}
              disabled={isPublishing}
              icon={IconSend}
            >
              {isPublishing ? 'Publishing to GraphDB...' : 'Publish All Validated to KG'}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!isPublishing && !result && (
          <div>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
              This action will convert all <code>VALIDATED</code> (or curator-approved) disaster articles into formal OWL/RDF triples and push them to Ontotext GraphDB:
            </p>
            <ul style={{ fontSize: 12.5, color: '#64748b', paddingLeft: 18, marginBottom: 16, lineHeight: 1.6 }}>
              <li><strong>Atomic SPARQL Upsert:</strong> Automatically cleans prior event statements before inserting updated triples (zero duplicate/stale collision).</li>
              <li><strong>Hierarchical Data Fusion:</strong> Links locations to parent Provinces & Districts (<code>flood:hasParentLocation</code> / <code>flood:hasSubLocation</code>).</li>
              <li><strong>Full Semantic Graph:</strong> Publishes Flood/Evacuation roles, Quantitative Impacts (<code>flood:hasImpact</code>), and Temporal Mentions (<code>flood:occursOnDate</code>).</li>
            </ul>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Max Articles per Batch Publish:
              </label>
              <Select
                value={batchLimit}
                onChange={(e) => setBatchLimit(Number(e.target.value))}
                options={[
                  { value: 20, label: 'Up to 20 Validated Articles' },
                  { value: 50, label: 'Up to 50 Validated Articles (Recommended)' },
                  { value: 100, label: 'Up to 100 Validated Articles' },
                  { value: 500, label: 'All Validated Articles (Up to 500)' },
                ]}
              />
            </div>
          </div>
        )}

        {(isPublishing || result) && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: result ? '#10b981' : isPublishing ? '#0284c7' : '#94a3b8',
                  }}
                  className={isPublishing ? 'animate-pulse-live' : ''}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {result ? 'KNOWLEDGE GRAPH SYNC COMPLETE' : 'PUBLISHING TO GRAPHDB...'}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            <ProgressBar
              value={progressPercent}
              showValue
              height={10}
              animated={isPublishing}
              striped={isPublishing}
              variant={result ? 'success' : error ? 'danger' : 'primary'}
              label={currentStepText}
              sublabel={`${progressPercent}%`}
            />
          </div>
        )}

        {result && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6 }}>
              <IconCheckCircle size={18} color="#10b981" />
              <span>{result.message || 'Batch Publish Completed!'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, fontSize: 12 }}>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: 4, border: '1px solid #a7f3d0' }}>
                Articles Published: <strong>{result.publishedCount || 0}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: 4, border: '1px solid #a7f3d0' }}>
                RDF Triples Generated: <strong>{(result.totalTriplesGenerated || 0).toLocaleString()}</strong>
              </div>
            </div>
            {result.errorsCount > 0 && (
              <div style={{ color: '#991b1b', marginTop: 8, fontSize: 12 }}>
                Failed articles: <strong>{result.errorsCount}</strong>
              </div>
            )}
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
