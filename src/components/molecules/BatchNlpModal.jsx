import React, { useState, useEffect, useRef } from 'react';
import Modal from '../atoms/Modal.jsx';
import Button from '../atoms/Button.jsx';
import ProgressBar from '../atoms/ProgressBar.jsx';
import Select from '../atoms/Select.jsx';
import {
  IconRefresh,
  IconCheckCircle,
  IconAlertTriangle,
} from '../atoms/Icons.jsx';
import { apiClient } from '../../api/client.js';

/**
 * Molecule: BatchNlpModal
 * Interactive Batch Natural Language Processing modal with live progress (0-100%),
 * sub-step stage breakdown (NLLB translation + BERT NER + OSM Geocoding),
 * and processing summary report.
 */
export default function BatchNlpModal({
  isOpen,
  onClose,
  onComplete,
}) {
  const [batchLimit, setBatchLimit] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('Idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const progressSimRef = useRef(null);

  // Timer
  useEffect(() => {
    if (isProcessing) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isProcessing]);

  const handleStartBatchNlp = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);
      setProgressPercent(10);
      setElapsedSeconds(0);
      setCurrentStepText('1. Initializing NLP Models (Meta NLLB-200 & BERT-NER)...');

      // Progressive simulated milestone advancement while the backend runs
      let currentProgress = 15;
      progressSimRef.current = setInterval(() => {
        currentProgress = Math.min(88, currentProgress + Math.floor(Math.random() * 8) + 3);
        setProgressPercent(currentProgress);

        if (currentProgress < 25) {
          setCurrentStepText('2. Preprocessing & Abbreviation Shielding (PyThaiNLP)...');
        } else if (currentProgress < 45) {
          setCurrentStepText('3. Neural Machine Translation (Thai ➔ English via Meta NLLB-200)...');
        } else if (currentProgress < 65) {
          setCurrentStepText('4. Dual-Track NER (Thai Gazetteer + English BERT-NER)...');
        } else if (currentProgress < 78) {
          setCurrentStepText('5. Post-Processing: Anchor Date TIME & Semantic IMPACT Cleaner...');
        } else if (currentProgress < 86) {
          setCurrentStepText('6. 5-Tier Hierarchical Geocoding & Hard WGS84 Geofencing (16,736 Cache)...');
        } else {
          setCurrentStepText('7. Relational Persistence to MySQL Staging Queue...');
        }
      }, 1200);

      const res = await apiClient.triggerBatchNlp({
        process_all_scraped: true,
        limit: Number(batchLimit),
      });

      if (progressSimRef.current) clearInterval(progressSimRef.current);
      setProgressPercent(100);
      setCurrentStepText('Completed batch NLP pipeline successfully.');

      if (res.success) {
        setResult(res);
        if (onComplete) onComplete(res);
      } else {
        setError(res.message || 'Batch NLP failed');
      }
    } catch (err) {
      if (progressSimRef.current) clearInterval(progressSimRef.current);
      setError(err.message || 'Batch NLP processing encountered an error. Verify Python NLP service on port 8000.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (isProcessing) return;
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
      title="Automated NLP & Geoparsing Batch Pipeline"
      maxWidth={540}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              variant="primary"
              onClick={handleStartBatchNlp}
              disabled={isProcessing}
              icon={IconRefresh}
            >
              {isProcessing ? 'Processing NLP Pipeline...' : 'Run Batch Pipeline (0-100%)'}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!isProcessing && !result && (
          <div>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 14 }}>
              This pipeline will execute the complete 7-stage NLP & Geoparsing pipeline on pending <code>SCRAPED</code> articles:
            </p>
            <ul style={{ fontSize: 12, color: '#64748b', paddingLeft: 18, marginBottom: 16, lineHeight: 1.6 }}>
              <li><strong>Stage 1:</strong> Preprocessing & Sentence Splitting (with abbreviation shielding)</li>
              <li><strong>Stage 2:</strong> Neural Machine Translation (<code>facebook/nllb-200-distilled-1.3B</code>)</li>
              <li><strong>Stage 3:</strong> Dual-Track NER (<code>dslim/bert-base-NER</code> + 77-Province Thai Gazetteer)</li>
              <li><strong>Stage 4:</strong> Semantic Post-Processing (Anchor-based TIME & Ontology IMPACT Cleaner)</li>
              <li><strong>Stage 5:</strong> Hierarchical Toponym Fusion & Deduplication</li>
              <li><strong>Stage 6:</strong> 5-Tier Hierarchical Geocoding & Hard WGS84 Geofencing (16,736 Cache + 77 Centroids)</li>
              <li><strong>Stage 7:</strong> Cascade Relational DB Update to MySQL (Ready for RDF Knowledge Graph)</li>
            </ul>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Batch Processing Limit:
              </label>
              <Select
                value={batchLimit}
                onChange={(e) => setBatchLimit(Number(e.target.value))}
                options={[
                  { value: 5, label: '5 Articles (Fast ~15-25s)' },
                  { value: 10, label: '10 Articles (Standard ~30-50s)' },
                  { value: 20, label: '20 Articles (Extended ~60-90s)' },
                  { value: 50, label: '50 Articles (Deep Batch)' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Live Progress Bar & Sub-step Info */}
        {(isProcessing || result) && (
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
                    backgroundColor: result ? '#10b981' : isProcessing ? '#0284c7' : '#94a3b8',
                  }}
                  className={isProcessing ? 'animate-pulse-live' : ''}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {result ? 'BATCH PROCESSING FINISHED' : 'EXECUTING AI PIPELINE...'}
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
              animated={isProcessing}
              striped={isProcessing}
              variant={result ? 'success' : error ? 'danger' : 'primary'}
              label={currentStepText}
              sublabel={`${progressPercent}%`}
            />
          </div>
        )}

        {/* Results Summary */}
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
              <span>Batch Pipeline Completed!</span>
            </div>
            <div>
              Processed: <strong>{result.processed_count || 0} articles</strong>
            </div>
            {result.errors_count > 0 && (
              <div style={{ color: '#991b1b', marginTop: 4 }}>
                Errors encountered: <strong>{result.errors_count} articles</strong>
              </div>
            )}
          </div>
        )}

        {/* Error notification */}
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
