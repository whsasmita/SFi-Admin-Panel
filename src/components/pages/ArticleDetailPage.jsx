import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ArticleMetaHeader from '../molecules/ArticleMetaHeader.jsx';
import LocationsReviewTable from '../organisms/LocationsReviewTable.jsx';
import MiniMapInspector from '../organisms/MiniMapInspector.jsx';
import ImpactsTable from '../organisms/ImpactsTable.jsx';
import TimesList from '../organisms/TimesList.jsx';
import Modal from '../atoms/Modal.jsx';
import Button from '../atoms/Button.jsx';
import ProgressBar from '../atoms/ProgressBar.jsx';
import StepProgress from '../molecules/StepProgress.jsx';
import {
  IconArrowLeft,
  IconSend,
  IconCheckCircle,
  IconAlertTriangle,
  IconRefresh,
  IconPlay,
} from '../atoms/Icons.jsx';

/**
 * Page: ArticleDetailPage
 * Executive Human-in-the-Loop Location Curation, Interactive Impacts/Times CRUD,
 * NLP Trigger & Knowledge Graph Publishing with Deep-Link URL Support
 */
export default function ArticleDetailPage({ articleId: propArticleId, onBack }) {
  const params = useParams();
  const navigate = useNavigate();
  const activeArticleId = propArticleId || params.id;

  const { role, canEdit, canPublish } = useAuth();

  const [article, setArticle] = useState(null);
  const [locations, setLocations] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [times, setTimes] = useState([]);

  // Translation Edit State
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [transEdit, setTransEdit] = useState({ title_en: '', content_en: '', content_summary_en: '' });
  const [isSavingTranslation, setIsSavingTranslation] = useState(false);

  // Quick Article Validation State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // NLP & Lifecycle Progress State
  const [nlpRunningStep, setNlpRunningStep] = useState(null); // 'translate' | 'extract' | 'full' | null
  const [stepPercent, setStepPercent] = useState(0);
  const [stepStatusText, setStepStatusText] = useState('');
  const [nlpFeedback, setNlpFeedback] = useState(null);

  // Active location for mini map preview
  const [selectedLocIndex, setSelectedLocIndex] = useState(0);

  // Row edit state: map of locationId -> { lat, lng, semantic_role, validation_status, saving, saved, error }
  const [editStates, setEditStates] = useState({});

  // Publish Modal & Processing State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/queue');
    }
  };

  const getCurrentStep = () => {
    if (!article) return 1;
    if (article.status === 'PUBLISHED_TO_KG') return 5;
    if (
      article.status === 'VALIDATED' ||
      locations.some((l) => (editStates[l.id]?.validation_status || l.validation_status) === 'APPROVED')
    ) {
      return 4;
    }
    if (locations.length > 0) return 3;
    if (article.title_en) return 2;
    return 1;
  };

  const syncEditStatesFromLocations = (locs) => {
    const initialEdits = {};
    locs.forEach((loc) => {
      initialEdits[loc.id] = {
        lat: loc.lat !== null && loc.lat !== undefined ? String(loc.lat) : '',
        lng: loc.lng !== null && loc.lng !== undefined ? String(loc.lng) : '',
        semantic_role: loc.semantic_role || 'FLOOD',
        validation_status: loc.validation_status || 'PENDING',
        saving: false,
        saved: false,
        error: null,
      };
    });
    setEditStates(initialEdits);
  };

  const fetchArticleDetail = async () => {
    if (!activeArticleId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getArticleById(activeArticleId);

      if (res.success && res.data) {
        const art = res.data;
        setArticle(art);
        setTransEdit({
          title_en: art.title_en || '',
          content_en: art.content_en || '',
          content_summary_en: art.content_summary_en || '',
        });

        const locs = art.locations || [];
        setLocations(locs);
        setImpacts(art.impacts || []);
        setTimes(art.times || []);
        syncEditStatesFromLocations(locs);
      }
    } catch (err) {
      console.error('Failed to load article detail:', err);
      setError(err.message || 'Failed to fetch article details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeArticleId) {
      fetchArticleDetail();
    }
  }, [activeArticleId]);

  // Handle NLP Step 1: Translation (with Full Sentence Chunking & Preprocessing)
  const handleTriggerTranslate = async () => {
    let timer = null;
    try {
      setNlpRunningStep('translate');
      setNlpFeedback(null);
      setStepPercent(20);
      setStepStatusText('Running Thai Preprocessing, Sentence Chunking & Meta NLLB-200 Translation...');

      timer = setInterval(() => {
        setStepPercent((prev) => Math.min(88, prev + 15));
      }, 700);

      const res = await apiClient.triggerTranslation(activeArticleId);

      if (timer) clearInterval(timer);
      setStepPercent(100);
      setStepStatusText('Translation complete (100%).');

      if (res.success) {
        setNlpFeedback({
          type: 'success',
          message: `NLLB-200 Full-Chunk Machine Translation completed (${res.data?.chunks_translated || 1} chunks translated).`,
        });
        await fetchArticleDetail();
      } else {
        setNlpFeedback({
          type: 'error',
          message: res.error || res.message || 'Translation returned an unsuccessful response.',
        });
      }
    } catch (err) {
      if (timer) clearInterval(timer);
      const errorMsg = err.data?.message || err.data?.error || err.message || 'Translation step failed.';
      setNlpFeedback({
        type: 'error',
        message: `Translation Error: ${errorMsg}`,
      });
    } finally {
      setNlpRunningStep(null);
    }
  };

  // Handle NLP Step 2: Extraction, Data Fusion & Geocoding
  const handleTriggerExtract = async () => {
    let timer = null;
    try {
      setNlpRunningStep('extract');
      setNlpFeedback(null);
      setStepPercent(20);
      setStepStatusText('Running Dual-Track BERT NER + Gazetteer + Data Fusion...');

      timer = setInterval(() => {
        setStepPercent((prev) => {
          if (prev > 45) {
            setStepStatusText('Resolving Spatial Coordinates & Thai Bounding Box Validation...');
          }
          return Math.min(88, prev + 12);
        });
      }, 700);

      const res = await apiClient.triggerExtraction(activeArticleId);

      if (timer) clearInterval(timer);
      setStepPercent(100);
      setStepStatusText('Entity extraction, Data Fusion, and geoparsing complete (100%).');

      if (res.success) {
        setNlpFeedback({
          type: 'success',
          message: `Dual-Track NER, Data Fusion & Geocoding completed: ${res.data?.locations_count || 0} locations, ${res.data?.impacts_count || 0} impacts, ${res.data?.times_count || 0} temporal mentions resolved.`,
        });
        await fetchArticleDetail();
      } else {
        setNlpFeedback({
          type: 'error',
          message: res.error || res.message || 'Extraction returned an unsuccessful response.',
        });
      }
    } catch (err) {
      if (timer) clearInterval(timer);
      const errorMsg = err.data?.message || err.data?.error || err.message || 'Extraction step failed.';
      setNlpFeedback({
        type: 'error',
        message: `Extraction Error: ${errorMsg}`,
      });
    } finally {
      setNlpRunningStep(null);
    }
  };

  // Handle Full NLP Pipeline (Step 1 + Step 2)
  const handleTriggerFullPipeline = async () => {
    let timer = null;
    try {
      setNlpRunningStep('full');
      setNlpFeedback(null);
      setStepPercent(15);
      setStepStatusText('Executing End-to-End Pipeline (Chunked NLLB Translation ➔ Dual-Track NER ➔ Data Fusion ➔ Geocoding)...');

      timer = setInterval(() => {
        setStepPercent((prev) => Math.min(90, prev + 10));
      }, 800);

      const res = await apiClient.triggerFullProcessing(activeArticleId);

      if (timer) clearInterval(timer);
      setStepPercent(100);
      setStepStatusText('End-to-End NLP Pipeline complete (100%).');

      if (res.success) {
        setNlpFeedback({
          type: 'success',
          message: 'Full NLP Pipeline (Translation + Dual-Track NER + Data Fusion + Geocoding) completed!',
        });
        await fetchArticleDetail();
      } else {
        setNlpFeedback({
          type: 'error',
          message: res.error || res.message || 'Full NLP pipeline returned an unsuccessful response.',
        });
      }
    } catch (err) {
      if (timer) clearInterval(timer);
      const errorMsg = err.data?.message || err.data?.error || err.message || 'Full NLP pipeline failed.';
      setNlpFeedback({
        type: 'error',
        message: `Pipeline Error: ${errorMsg}`,
      });
    } finally {
      setNlpRunningStep(null);
    }
  };

  // Handle Quick Status Change from ArticleMetaHeader
  const handleArticleStatusChange = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await apiClient.updateArticle(activeArticleId, { status: newStatus });
      if (res.success) {
        setArticle((prev) => ({ ...prev, status: newStatus }));
        setNlpFeedback({
          type: 'success',
          message: `Article #${activeArticleId} workflow status updated to ${newStatus}.`,
        });
      }
    } catch (err) {
      setNlpFeedback({
        type: 'error',
        message: err.message || 'Failed to update article status.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle 1-Click "Approve All & Mark Validated"
  const handleApproveArticleQuick = async () => {
    try {
      setIsUpdatingStatus(true);
      const res = await apiClient.approveAllArticleEntities(activeArticleId);
      if (res.success) {
        if (res.data) {
          setArticle(res.data);
          const locs = res.data.locations || [];
          setLocations(locs);
          syncEditStatesFromLocations(locs);
        } else {
          setArticle((prev) => ({ ...prev, status: 'VALIDATED' }));
        }
        setNlpFeedback({
          type: 'success',
          message: res.message || `All valid locations approved and Article #${activeArticleId} marked as VALIDATED!`,
        });
      }
    } catch (err) {
      setNlpFeedback({
        type: 'error',
        message: err.message || 'Failed to approve all entities.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Save Edited Translation
  const handleSaveTranslation = async () => {
    try {
      setIsSavingTranslation(true);
      await apiClient.updateArticle(activeArticleId, {
        title_en: transEdit.title_en,
        content_en: transEdit.content_en,
        content_summary_en: transEdit.content_summary_en,
      });
      setIsEditingTranslation(false);
      setArticle((prev) => ({
        ...prev,
        title_en: transEdit.title_en,
        content_en: transEdit.content_en,
        content_summary_en: transEdit.content_summary_en,
      }));
      setNlpFeedback({
        type: 'success',
        message: 'Translation updated and saved to MySQL successfully.',
      });
    } catch (err) {
      setNlpFeedback({
        type: 'error',
        message: err.message || 'Failed to save translation.',
      });
    } finally {
      setIsSavingTranslation(false);
    }
  };

  // Handle inline location input change
  const handleLocationFieldChange = (locId, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [locId]: {
        ...prev[locId],
        [field]: value,
        saved: false,
        error: null,
      },
    }));
  };

  // Save single location change
  const handleSaveLocation = async (loc, overrideStatus = null) => {
    const edit = editStates[loc.id];
    if (!edit) return;

    const targetStatus = overrideStatus || edit.validation_status;

    setEditStates((prev) => ({
      ...prev,
      [loc.id]: { ...prev[loc.id], validation_status: targetStatus, saving: true, error: null },
    }));

    try {
      const payload = {
        semantic_role: edit.semantic_role,
        validation_status: targetStatus,
        lat: edit.lat !== '' && edit.lat !== null ? parseFloat(edit.lat) : null,
        lng: edit.lng !== '' && edit.lng !== null ? parseFloat(edit.lng) : null,
      };

      const res = await apiClient.updateLocation(loc.id, payload);

      if (res.success) {
        setLocations((prev) =>
          prev.map((l) => (l.id === loc.id ? { ...l, ...payload } : l))
        );

        setEditStates((prev) => ({
          ...prev,
          [loc.id]: { ...prev[loc.id], validation_status: targetStatus, saving: false, saved: true, error: null },
        }));

        setTimeout(() => {
          setEditStates((prev) => ({
            ...prev,
            [loc.id]: prev[loc.id] ? { ...prev[loc.id], saved: false } : prev[loc.id],
          }));
        }, 3000);
      }
    } catch (err) {
      setEditStates((prev) => ({
        ...prev,
        [loc.id]: { ...prev[loc.id], saving: false, error: err.message || 'Save failed' },
      }));
    }
  };

  // Create new manual location
  const handleAddLocation = async (payload) => {
    try {
      const res = await apiClient.createLocation(activeArticleId, payload);
      if (res.success && res.data) {
        const newLoc = res.data;
        setLocations((prev) => [...prev, newLoc]);
        setEditStates((prev) => ({
          ...prev,
          [newLoc.id]: {
            lat: newLoc.lat !== null && newLoc.lat !== undefined ? String(newLoc.lat) : '',
            lng: newLoc.lng !== null && newLoc.lng !== undefined ? String(newLoc.lng) : '',
            semantic_role: newLoc.semantic_role || 'FLOOD',
            validation_status: newLoc.validation_status || 'APPROVED',
            saving: false,
            saved: true,
            error: null,
          },
        }));
        setSelectedLocIndex(locations.length);
      }
    } catch (err) {
      setNlpFeedback({ type: 'error', message: err.message || 'Failed to add location.' });
    }
  };

  // Delete location
  const handleDeleteLocation = async (locationId) => {
    try {
      const res = await apiClient.deleteLocation(locationId);
      if (res.success) {
        setLocations((prev) => prev.filter((l) => l.id !== locationId));
        setSelectedLocIndex(0);
      }
    } catch (err) {
      setNlpFeedback({ type: 'error', message: err.message || 'Failed to delete location.' });
    }
  };

  // Interactive Map Pin Drag / Click-to-Pin Coordinate Update
  const handleMapCoordinateChange = (newLat, newLng) => {
    const selectedLoc = locations[selectedLocIndex] || locations[0];
    if (!selectedLoc) return;
    setEditStates((prev) => ({
      ...prev,
      [selectedLoc.id]: {
        ...prev[selectedLoc.id],
        lat: String(newLat),
        lng: String(newLng),
        validation_status: 'APPROVED',
        saved: false,
        error: null,
      },
    }));
  };

  // Interactive Impacts CRUD Handlers
  const handleAddImpact = async (payload) => {
    const res = await apiClient.createImpact(activeArticleId, payload);
    if (res.success && res.data) {
      setImpacts((prev) => [...prev, res.data]);
    }
  };

  const handleUpdateImpact = async (impactId, payload) => {
    const res = await apiClient.updateImpact(impactId, payload);
    if (res.success && res.data) {
      setImpacts((prev) => prev.map((imp) => (imp.id === impactId ? res.data : imp)));
    }
  };

  const handleDeleteImpact = async (impactId) => {
    const res = await apiClient.deleteImpact(impactId);
    if (res.success) {
      setImpacts((prev) => prev.filter((imp) => imp.id !== impactId));
    }
  };

  // Interactive Times CRUD Handlers
  const handleAddTime = async (payload) => {
    const res = await apiClient.createTime(activeArticleId, payload);
    if (res.success && res.data) {
      setTimes((prev) => [...prev, res.data]);
    }
  };

  const handleUpdateTime = async (timeId, payload) => {
    const res = await apiClient.updateTime(timeId, payload);
    if (res.success && res.data) {
      setTimes((prev) => prev.map((t) => (t.id === timeId ? res.data : t)));
    }
  };

  const handleDeleteTime = async (timeId) => {
    const res = await apiClient.deleteTime(timeId);
    if (res.success) {
      setTimes((prev) => prev.filter((t) => t.id !== timeId));
    }
  };

  // Check if article has at least 1 APPROVED location
  const hasApprovedLocation = locations.some(
    (loc) => (editStates[loc.id]?.validation_status || loc.validation_status) === 'APPROVED'
  );

  // Publish to Knowledge Graph (Atomic Upsert)
  const handlePublishToKG = async () => {
    let timer = null;
    try {
      setIsPublishing(true);
      setPublishFeedback(null);
      setStepPercent(25);
      setStepStatusText('Running Atomic Pre-Delete SPARQL & Pushing Owl/RDF Triples to GraphDB...');

      timer = setInterval(() => {
        setStepPercent((prev) => Math.min(88, prev + 20));
      }, 500);

      const res = await apiClient.publishArticleToKG(activeArticleId);

      if (timer) clearInterval(timer);
      setStepPercent(100);
      setStepStatusText('Pushed to Ontotext GraphDB repository (100%).');

      if (res.success) {
        setArticle((prev) => ({ ...prev, status: 'PUBLISHED_TO_KG' }));
        setPublishFeedback({
          type: 'success',
          message: res.message || `Article #${activeArticleId} published to Ontotext GraphDB successfully!`,
          triples: res.triplesGenerated,
        });
        setIsPublishModalOpen(false);
      } else {
        setPublishFeedback({
          type: 'error',
          message: res.error || res.message || 'Failed to publish to GraphDB',
        });
        setIsPublishModalOpen(false);
      }
    } catch (err) {
      if (timer) clearInterval(timer);
      const errorMsg = err.data?.message || err.data?.error || err.message || 'Failed to publish to GraphDB';
      setPublishFeedback({
        type: 'error',
        message: errorMsg,
      });
      setIsPublishModalOpen(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedLoc = locations[selectedLocIndex] || locations[0] || null;
  const selectedLocEdit = selectedLoc ? editStates[selectedLoc.id] : null;
  const activeLat = selectedLocEdit?.lat !== undefined ? selectedLocEdit.lat : selectedLoc?.lat;
  const activeLng = selectedLocEdit?.lng !== undefined ? selectedLocEdit.lng : selectedLoc?.lng;
  const activeRole = selectedLocEdit?.semantic_role || selectedLoc?.semantic_role;

  // Parse track_stats if stored as JSON string or object
  let parsedTrackStats = null;
  if (article?.track_stats) {
    try {
      parsedTrackStats =
        typeof article.track_stats === 'string'
          ? JSON.parse(article.track_stats)
          : article.track_stats;
    } catch {
      parsedTrackStats = null;
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <IconRefresh size={18} className="animate-spin" />
          <span>Loading article #{activeArticleId} details from database...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ padding: '20px' }}>
        <Button variant="outline" size="sm" onClick={handleBackNavigation} icon={IconArrowLeft} style={{ marginBottom: 16 }}>
          Back to Staging Queue
        </Button>
        <div style={{ padding: '16px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', borderRadius: 6 }}>
          {error || 'Article not found.'}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <Button variant="outline" onClick={handleBackNavigation} icon={IconArrowLeft}>
          Back to Staging Queue
        </Button>

        {/* Pipeline Granular Triggers & Publish Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Run Full Pipeline (1+2) */}
          <Button
            variant="outline"
            onClick={handleTriggerFullPipeline}
            disabled={!canEdit || nlpRunningStep !== null || isPublishing}
            icon={IconPlay}
            title="Run Both Translation (NLLB) and Dual-Track NER + Data Fusion + Geocoding"
          >
            {nlpRunningStep === 'full' ? 'Running Pipeline...' : 'Run Full Pipeline (1+2)'}
          </Button>

          {/* Step 1: Translate Trigger */}
          <Button
            variant="outline"
            onClick={handleTriggerTranslate}
            disabled={!canEdit || nlpRunningStep !== null || isPublishing}
            icon={IconRefresh}
            title="Run NLLB-200 Neural Machine Translation with Full Sentence Chunking"
          >
            {nlpRunningStep === 'translate' ? 'Translating...' : article.title_en ? '1. Re-run Translation' : '1. Run Translation (NLLB)'}
          </Button>

          {/* Step 2: Extract & Geocode Trigger */}
          <Button
            variant="outline"
            onClick={handleTriggerExtract}
            disabled={!canEdit || nlpRunningStep !== null || isPublishing}
            icon={IconRefresh}
            title="Run Dual-Track NER, Data Fusion & OpenStreetMap Hierarchical Geocoding"
          >
            {nlpRunningStep === 'extract' ? 'Extracting...' : locations.length > 0 ? '2. Re-run Geoparser' : '2. Extract & Geocode'}
          </Button>

          {/* Step 3: Publish Action */}
          <Button
            variant="publish"
            onClick={() => setIsPublishModalOpen(true)}
            disabled={!canPublish || !hasApprovedLocation || isPublishing || nlpRunningStep !== null}
            icon={IconSend}
            title={
              !canPublish
                ? `Role ${role} is not permitted to publish to GraphDB`
                : !hasApprovedLocation
                ? 'At least 1 location must be APPROVED before publishing'
                : 'Atomic Upsert RDF triples to Ontotext GraphDB'
            }
          >
            {isPublishing
              ? 'Publishing Triples...'
              : article.status === 'PUBLISHED_TO_KG'
              ? '3. Re-Publish to GraphDB (Upsert)'
              : '3. Publish to Knowledge Graph'}
          </Button>
        </div>
      </div>

      {/* 5-Step Pipeline Lifecycle Bar */}
      <StepProgress currentStep={getCurrentStep()} />

      {/* Active Step Progress Indicator Bar */}
      {(nlpRunningStep || isPublishing) && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '14px 18px',
            marginBottom: 20,
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <ProgressBar
            value={stepPercent}
            showValue
            height={8}
            animated
            striped
            variant={isPublishing ? 'success' : 'primary'}
            label={stepStatusText}
            sublabel={`${stepPercent}%`}
          />
        </div>
      )}

      {/* NLP Feedback Banner */}
      {nlpFeedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 6,
            backgroundColor: nlpFeedback.type === 'success' ? '#f0fdf4' : '#fff1f2',
            border: `1px solid ${nlpFeedback.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
            color: nlpFeedback.type === 'success' ? '#166534' : '#9f1239',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {nlpFeedback.type === 'success' ? <IconCheckCircle size={18} /> : <IconAlertTriangle size={18} />}
          <div>{nlpFeedback.message}</div>
        </div>
      )}

      {/* Publish Feedback Banner */}
      {publishFeedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            borderRadius: 8,
            backgroundColor: publishFeedback.type === 'success' ? '#ecfdf5' : '#fff1f2',
            border: `1px solid ${publishFeedback.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
            color: publishFeedback.type === 'success' ? '#065f46' : '#9f1239',
            fontSize: 13,
            marginBottom: 20,
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          {publishFeedback.type === 'success' ? <IconCheckCircle size={20} /> : <IconAlertTriangle size={20} />}
          <div>
            <strong>{publishFeedback.type === 'success' ? 'Published Successfully:' : 'Publish Failed:'}</strong>{' '}
            {publishFeedback.message}
            {publishFeedback.triples && (
              <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                ({publishFeedback.triples} triples pushed to GraphDB)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Article Metadata Molecule with Quick Status & 1-Click Validation */}
      <ArticleMetaHeader
        article={article}
        canEdit={canEdit}
        isUpdatingStatus={isUpdatingStatus}
        onStatusChange={handleArticleStatusChange}
        onApproveArticleQuick={handleApproveArticleQuick}
      />

      {/* Dual-Track NER & Data Fusion Telemetry Bar (if available) */}
      {parsedTrackStats && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: '10px 16px',
            marginBottom: 20,
            fontSize: 12,
            color: '#475569',
          }}
        >
          <div style={{ fontWeight: 700, color: '#0f172a' }}>
            Dual-Track NER & Data Fusion Diagnostics:
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
            <span>
              Track A (Thai Gazetteer): <strong>{parsedTrackStats.track_a_thai_gazetteer ?? 0}</strong>
            </span>
            <span>
              Track B (English BERT): <strong>{parsedTrackStats.track_b_en_bert ?? 0}</strong>
            </span>
            <span>
              Fused Hierarchy Nodes: <strong style={{ color: '#0284c7' }}>{parsedTrackStats.fused_locations_count ?? locations.length}</strong>
            </span>
            {parsedTrackStats.chunks_translated && (
              <span>
                NLLB Chunks: <strong>{parsedTrackStats.chunks_translated}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Translation & Content Editor Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '18px 20px',
          marginBottom: 24,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Machine Translation & Human Review (Thai ➔ English)
          </div>
          {canEdit && (
            <div>
              {isEditingTranslation ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="primary" size="sm" onClick={handleSaveTranslation} disabled={isSavingTranslation}>
                    {isSavingTranslation ? 'Saving...' : 'Save Translation'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTranslation(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingTranslation(true)}>
                  Edit Translation
                </Button>
              )}
            </div>
          )}
        </div>

        {isEditingTranslation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                English Title (title_en)
              </label>
              <input
                type="text"
                value={transEdit.title_en}
                onChange={(e) => setTransEdit((p) => ({ ...p, title_en: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                English Full Content (content_en)
              </label>
              <textarea
                rows={5}
                value={transEdit.content_en}
                onChange={(e) => setTransEdit((p) => ({ ...p, content_en: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                Preprocessed Thai Content {article.content_th ? '(Cleaned)' : '(Raw)'}
              </div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, maxHeight: 180, overflowY: 'auto' }}>
                {article.content_th || article.content_raw || '—'}
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: 6 }}>
                Translated English Content (Full NLLB-200 Chunks)
              </div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, maxHeight: 180, overflowY: 'auto' }}>
                {article.content_en || (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    Not translated yet. Click '1. Run Translation (NLLB)' above.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Curation Workspace Grid: Locations Table (Left) + Spatial Mini Map (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(340px, 1fr)', gap: 24, marginBottom: 28 }}>
        <LocationsReviewTable
          locations={locations}
          editStates={editStates}
          selectedLocIndex={selectedLocIndex}
          canEdit={canEdit}
          onSelectLocation={setSelectedLocIndex}
          onLocationFieldChange={handleLocationFieldChange}
          onSaveLocation={(loc) => handleSaveLocation(loc)}
          onApproveAll={handleApproveArticleQuick}
          onAddLocation={handleAddLocation}
          onDeleteLocation={handleDeleteLocation}
        />

        <MiniMapInspector
          selectedLoc={selectedLoc}
          activeRole={activeRole}
          activeLat={activeLat}
          activeLng={activeLng}
          canEdit={canEdit}
          isSaving={selectedLoc ? editStates[selectedLoc.id]?.saving : false}
          onCoordinateChange={handleMapCoordinateChange}
          onQuickSaveAndApprove={
            selectedLoc ? () => handleSaveLocation(selectedLoc, 'APPROVED') : null
          }
        />
      </div>

      {/* Interactive Impacts & Times Organisms */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <ImpactsTable
          impacts={impacts}
          canEdit={canEdit}
          onAddImpact={handleAddImpact}
          onUpdateImpact={handleUpdateImpact}
          onDeleteImpact={handleDeleteImpact}
        />
        <TimesList
          times={times}
          canEdit={canEdit}
          onAddTime={handleAddTime}
          onUpdateTime={handleUpdateTime}
          onDeleteTime={handleDeleteTime}
        />
      </div>

      {/* Modal Confirmation Dialog */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublishToKG}
        title="Publish Article to Ontotext GraphDB (Atomic Upsert)?"
        message={`Are you sure you want to publish Article #${article.id} to the Knowledge Graph? Existing triples for res:event_${article.id} will be cleanly replaced before inserting the updated Turtle RDF graph.`}
        confirmText="Confirm & Publish to GraphDB"
        loading={isPublishing}
      >
        <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
          <div><strong>Article:</strong> {article.title_en || article.title}</div>
          <div style={{ marginTop: 6 }}>
            <strong>Approved Locations:</strong>{' '}
            <span style={{ color: '#059669', fontWeight: 700 }}>
              {locations.filter((l) => (editStates[l.id]?.validation_status || l.validation_status) === 'APPROVED').length}{' '}
              nodes
            </span>
          </div>
          <div style={{ marginTop: 4 }}>
            <strong>Impacts & Temporal Mentions:</strong>{' '}
            <span>{impacts.length} impacts, {times.length} time expressions</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
