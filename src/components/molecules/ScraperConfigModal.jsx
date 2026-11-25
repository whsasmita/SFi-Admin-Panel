import React, { useState, useEffect } from 'react';
import Modal from '../atoms/Modal.jsx';
import Button from '../atoms/Button.jsx';
import Select from '../atoms/Select.jsx';
import {
  IconRefresh,
  IconCheckCircle,
  IconAlertTriangle,
  IconPlay,
  IconZap,
  IconGlobe,
  IconCode,
  IconFileJson,
  IconPlus,
  IconTrash,
  IconSliders,
  IconCalendar,
  IconInfo,
  IconCheck,
} from '../atoms/Icons.jsx';
import {
  SUGGESTED_START_URLS,
  ALL_PORTALS,
  DEFAULT_CHEERIO_CONFIG,
  DEFAULT_WEBSCRAPER_CONFIG,
  generatePageFunctionCode,
} from '../../utils/scraperDefaults.js';

/**
 * Molecule: ScraperConfigModal
 * Professional configuration modal supporting:
 * 1. Standard Form (Presets, Start URLs, Cutoff Dates, Portal Checkboxes, Max Pages)
 * 2. Advanced pageFunction JS Editor
 * 3. Full Raw JSON Config Override Editor
 * Strict: Zero raw emojis, 100% SVG/React-based icons, responsive scrollable container.
 */
export default function ScraperConfigModal({
  isOpen,
  onClose,
  onLaunch,
  loading = false,
}) {
  // Engine Selector: 'cheerio' | 'web_scraper'
  const [engine, setEngine] = useState('cheerio');

  // Active Tab: 'form' | 'code' | 'json'
  const [activeTab, setActiveTab] = useState('form');

  // Standard Form State
  const [startUrls, setStartUrls] = useState(DEFAULT_CHEERIO_CONFIG.startUrls);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [cutoffStart, setCutoffStart] = useState('2024-01-01');
  const [cutoffEnd, setCutoffEnd] = useState('2026-12-31');
  const [selectedPortals, setSelectedPortals] = useState(ALL_PORTALS.map((p) => p.id));
  const [maxPages, setMaxPages] = useState(200);
  const [maxDepth, setMaxDepth] = useState(10);

  // Advanced Code & JSON State
  const [customPageFunction, setCustomPageFunction] = useState(DEFAULT_CHEERIO_CONFIG.pageFunction);
  const [rawJsonString, setRawJsonString] = useState(JSON.stringify(DEFAULT_CHEERIO_CONFIG, null, 2));
  const [jsonError, setJsonError] = useState(null);

  // Sync state when engine changes
  useEffect(() => {
    const isWeb = engine === 'web_scraper';
    const baseConfig = isWeb ? DEFAULT_WEBSCRAPER_CONFIG : DEFAULT_CHEERIO_CONFIG;
    setStartUrls(baseConfig.startUrls);
    const code = generatePageFunctionCode({
      isWebScraper: isWeb,
      cutoffStart,
      cutoffEnd,
      selectedPortals,
    });
    setCustomPageFunction(code);
    const updatedConfig = { ...baseConfig, pageFunction: code, maxPagesPerCrawl: maxPages, maxCrawlingDepth: maxDepth };
    setRawJsonString(JSON.stringify(updatedConfig, null, 2));
  }, [engine]);

  // When standard form inputs change, auto-update pageFunction and raw JSON
  const handleFormChangeUpdate = (newUrls, newStart, newEnd, newPortals, newMaxPages, newMaxDepth) => {
    const isWeb = engine === 'web_scraper';
    const baseConfig = isWeb ? DEFAULT_WEBSCRAPER_CONFIG : DEFAULT_CHEERIO_CONFIG;
    const generatedCode = generatePageFunctionCode({
      isWebScraper: isWeb,
      cutoffStart: newStart,
      cutoffEnd: newEnd,
      selectedPortals: newPortals,
    });

    setCustomPageFunction(generatedCode);

    const mergedConfig = {
      ...baseConfig,
      startUrls: newUrls,
      maxPagesPerCrawl: Number(newMaxPages),
      maxCrawlingDepth: Number(newMaxDepth),
      pageFunction: generatedCode,
    };
    setRawJsonString(JSON.stringify(mergedConfig, null, 2));
    setJsonError(null);
  };

  // Add custom URL
  const handleAddCustomUrl = (e) => {
    e.preventDefault();
    const trimmed = newUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      alert('URL must begin with http:// or https://');
      return;
    }
    if (startUrls.some((u) => u.url === trimmed)) {
      alert('URL is already registered in the list');
      return;
    }
    const updated = [...startUrls, { url: trimmed }];
    setStartUrls(updated);
    setNewUrlInput('');
    handleFormChangeUpdate(updated, cutoffStart, cutoffEnd, selectedPortals, maxPages, maxDepth);
  };

  // Toggle Preset Suggestion
  const handleTogglePresetUrl = (presetUrl) => {
    const exists = startUrls.some((u) => u.url === presetUrl);
    let updated;
    if (exists) {
      updated = startUrls.filter((u) => u.url !== presetUrl);
    } else {
      updated = [...startUrls, { url: presetUrl }];
    }
    setStartUrls(updated);
    handleFormChangeUpdate(updated, cutoffStart, cutoffEnd, selectedPortals, maxPages, maxDepth);
  };

  // Remove URL from active list
  const handleRemoveUrl = (indexToRemove) => {
    const updated = startUrls.filter((_, i) => i !== indexToRemove);
    setStartUrls(updated);
    handleFormChangeUpdate(updated, cutoffStart, cutoffEnd, selectedPortals, maxPages, maxDepth);
  };

  // Toggle Portal Checkbox
  const handleTogglePortal = (portalId) => {
    let updated;
    if (selectedPortals.includes(portalId)) {
      updated = selectedPortals.filter((id) => id !== portalId);
    } else {
      updated = [...selectedPortals, portalId];
    }
    setSelectedPortals(updated);
    handleFormChangeUpdate(startUrls, cutoffStart, cutoffEnd, updated, maxPages, maxDepth);
  };

  // Select / Deselect All Portals
  const handleSelectAllPortals = (selectAll) => {
    const updated = selectAll ? ALL_PORTALS.map((p) => p.id) : [];
    setSelectedPortals(updated);
    handleFormChangeUpdate(startUrls, cutoffStart, cutoffEnd, updated, maxPages, maxDepth);
  };

  // Reset to Default
  const handleResetToDefaults = () => {
    const isWeb = engine === 'web_scraper';
    const baseConfig = isWeb ? DEFAULT_WEBSCRAPER_CONFIG : DEFAULT_CHEERIO_CONFIG;
    setStartUrls(baseConfig.startUrls);
    setCutoffStart('2024-01-01');
    setCutoffEnd('2026-12-31');
    setSelectedPortals(ALL_PORTALS.map((p) => p.id));
    setMaxPages(200);
    setMaxDepth(10);
    setCustomPageFunction(baseConfig.pageFunction);
    setRawJsonString(JSON.stringify(baseConfig, null, 2));
    setJsonError(null);
  };

  // Format and Validate Raw JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonString);
      setRawJsonString(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e) {
      setJsonError(`JSON Syntax Error: ${e.message}`);
    }
  };

  // Build Payload & Launch
  const handleLaunchScraper = () => {
    const taskId = engine === 'web_scraper' ? 'whsasmita/web-scraper-task' : 'whsasmita/cheerio-scraper-task';
    let inputPayload = {};

    if (activeTab === 'json') {
      try {
        inputPayload = JSON.parse(rawJsonString);
      } catch (e) {
        setJsonError(`Invalid JSON configuration: ${e.message}`);
        return;
      }
    } else if (activeTab === 'code') {
      const isWeb = engine === 'web_scraper';
      const baseConfig = isWeb ? DEFAULT_WEBSCRAPER_CONFIG : DEFAULT_CHEERIO_CONFIG;
      inputPayload = {
        ...baseConfig,
        startUrls,
        maxPagesPerCrawl: Number(maxPages),
        maxCrawlingDepth: Number(maxDepth),
        pageFunction: customPageFunction,
      };
    } else {
      // Standard Form Mode
      const isWeb = engine === 'web_scraper';
      const baseConfig = isWeb ? DEFAULT_WEBSCRAPER_CONFIG : DEFAULT_CHEERIO_CONFIG;
      inputPayload = {
        ...baseConfig,
        startUrls,
        maxPagesPerCrawl: Number(maxPages),
        maxCrawlingDepth: Number(maxDepth),
        pageFunction: customPageFunction,
        customData: {
          cutoffStart,
          cutoffEnd,
          selectedPortals,
        },
      };
    }

    onLaunch({
      taskId,
      inputOverrides: inputPayload,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Configure & Launch Disaster News Scraper"
      subtitle="Customize scraping target portals, seed URLs, date filters, or direct JavaScript extraction code."
      maxWidth={820}
      icon={<IconSliders size={18} />}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={loading}
            style={{
              fontSize: 12,
              color: '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
            }}
          >
            <IconRefresh size={13} />
            Reset to Recommended Defaults
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="publish"
              size="sm"
              onClick={handleLaunchScraper}
              disabled={loading || startUrls.length === 0}
              icon={IconPlay}
            >
              {loading ? 'Launching Actor...' : 'Launch Scraper & Open Live Monitor'}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Engine Type Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div
            onClick={() => setEngine('cheerio')}
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              border: `1.5px solid ${engine === 'cheerio' ? '#0284c7' : '#e2e8f0'}`,
              backgroundColor: engine === 'cheerio' ? '#f0f9ff' : '#ffffff',
              transition: 'all 0.15s ease',
              boxShadow: engine === 'cheerio' ? '0 1px 3px rgba(2, 132, 199, 0.1)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ color: engine === 'cheerio' ? '#0284c7' : '#64748b' }}>
                  <IconZap size={16} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: engine === 'cheerio' ? '#0369a1' : '#0f172a' }}>
                  Cheerio Scraper (Fast HTTP)
                </span>
              </div>
              {engine === 'cheerio' && <IconCheckCircle size={15} color="#0284c7" />}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
              High-speed raw HTML parsing via jQuery. Lowest compute cost and quota usage.
            </div>
          </div>

          <div
            onClick={() => setEngine('web_scraper')}
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              border: `1.5px solid ${engine === 'web_scraper' ? '#0284c7' : '#e2e8f0'}`,
              backgroundColor: engine === 'web_scraper' ? '#f0f9ff' : '#ffffff',
              transition: 'all 0.15s ease',
              boxShadow: engine === 'web_scraper' ? '0 1px 3px rgba(2, 132, 199, 0.1)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ color: engine === 'web_scraper' ? '#0284c7' : '#64748b' }}>
                  <IconGlobe size={16} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: engine === 'web_scraper' ? '#0369a1' : '#0f172a' }}>
                  Web Scraper (Headless Chrome)
                </span>
              </div>
              {engine === 'web_scraper' && <IconCheckCircle size={15} color="#0284c7" />}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
              Full browser automation. Handles dynamic client-side JS and infinite scroll.
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: 6 }}>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`filter-tab ${activeTab === 'form' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12.5 }}
          >
            <IconSliders size={14} />
            Standard Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`filter-tab ${activeTab === 'code' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12.5 }}
          >
            <IconCode size={14} />
            pageFunction Code Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`filter-tab ${activeTab === 'json' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12.5 }}
          >
            <IconFileJson size={14} />
            Raw Apify JSON Config
          </button>
        </div>

        {/* ── TAB 1: STANDARD FORM ── */}
        {activeTab === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 1. Start URLs & Presets */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                  Target Start URLs ({startUrls.length} Active)
                </label>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Click preset badges below or input custom URLs
                </span>
              </div>

              {/* Preset Suggestions Pills */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED_START_URLS.map((preset) => {
                    const isSelected = startUrls.some((u) => u.url === preset.url);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleTogglePresetUrl(preset.url)}
                        style={{
                          fontSize: 11,
                          padding: '4px 9px',
                          borderRadius: 4,
                          border: `1px solid ${isSelected ? '#bae6fd' : '#cbd5e1'}`,
                          backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                          color: isSelected ? '#0369a1' : '#334155',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected ? <IconCheck size={12} color="#0284c7" /> : <IconPlus size={11} color="#64748b" />}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active URLs List */}
              <div
                style={{
                  maxHeight: 130,
                  overflowY: 'auto',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '6px 8px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {startUrls.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', padding: '10px 8px', textAlign: 'center' }}>
                    No start URLs selected. Click presets above or add a new URL below.
                  </div>
                ) : (
                  startUrls.map((u, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 4,
                        fontSize: 11.5,
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '90%',
                        }}
                      >
                        {u.url}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUrl(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 2,
                        }}
                        title="Remove URL"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom URL Input Form */}
              <form onSubmit={handleAddCustomUrl} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  type="url"
                  placeholder="https://www.thairath.co.th/tags/..."
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: 5,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    backgroundColor: '#ffffff',
                  }}
                />
                <Button variant="outline" size="sm" type="submit" icon={IconPlus}>
                  Add URL
                </Button>
              </form>
            </div>

            {/* 2. Side-by-Side: Date Filter Card (Left) + Crawl Limits Card (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Card A: Date Filter */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <IconCalendar size={15} color="#0284c7" />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                    Article Publication Date Range
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Cutoff Start Date:
                    </label>
                    <input
                      type="date"
                      value={cutoffStart}
                      onChange={(e) => {
                        setCutoffStart(e.target.value);
                        handleFormChangeUpdate(startUrls, e.target.value, cutoffEnd, selectedPortals, maxPages, maxDepth);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Cutoff End Date:
                    </label>
                    <input
                      type="date"
                      value={cutoffEnd}
                      onChange={(e) => {
                        setCutoffEnd(e.target.value);
                        handleFormChangeUpdate(startUrls, cutoffStart, e.target.value, selectedPortals, maxPages, maxDepth);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card B: Crawl Limits */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <IconSliders size={15} color="#0284c7" />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                    Crawl Limits & Performance
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Max Crawl Pages:
                    </label>
                    <Select
                      value={maxPages}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMaxPages(val);
                        handleFormChangeUpdate(startUrls, cutoffStart, cutoffEnd, selectedPortals, val, maxDepth);
                      }}
                      options={[
                        { value: 50, label: '50 Pages (Quick Test)' },
                        { value: 200, label: '200 Pages (Standard)' },
                        { value: 500, label: '500 Pages (Deep Crawl)' },
                        { value: 2000, label: '2000 Pages (Full Archive)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                      Max Depth:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={maxDepth}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMaxDepth(val);
                        handleFormChangeUpdate(startUrls, cutoffStart, cutoffEnd, selectedPortals, maxPages, val);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Target Portals Filter Checkboxes */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                  Target News Portals Filter ({selectedPortals.length} Enabled)
                </span>
                <div style={{ display: 'flex', gap: 8, fontSize: 11.5 }}>
                  <button
                    type="button"
                    onClick={() => handleSelectAllPortals(true)}
                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Select All
                  </button>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAllPortals(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
                {ALL_PORTALS.map((portal) => {
                  const isChecked = selectedPortals.includes(portal.id);
                  return (
                    <label
                      key={portal.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: '#0f172a',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        backgroundColor: isChecked ? '#f0f9ff' : '#f8fafc',
                        borderRadius: 6,
                        border: `1px solid ${isChecked ? '#bae6fd' : '#e2e8f0'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePortal(portal.id)}
                      />
                      <span style={{ fontWeight: isChecked ? 700 : 500 }}>{portal.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ADVANCED CODE (pageFunction JS Editor) ── */}
        {activeTab === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                <IconInfo size={14} color="#0284c7" />
                <span>Extraction function executed on each crawled page (<code>async function pageFunction(context)</code>):</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const isWeb = engine === 'web_scraper';
                  const code = generatePageFunctionCode({ isWebScraper: isWeb, cutoffStart, cutoffEnd, selectedPortals });
                  setCustomPageFunction(code);
                }}
                style={{ fontSize: 11.5, color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <IconRefresh size={12} />
                Regenerate from Standard Form
              </button>
            </div>

            <textarea
              value={customPageFunction}
              onChange={(e) => setCustomPageFunction(e.target.value)}
              rows={15}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                lineHeight: 1.45,
                padding: '12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                backgroundColor: '#090d16',
                color: '#f8fafc',
                resize: 'vertical',
              }}
              spellCheck={false}
            />
          </div>
        )}

        {/* ── TAB 3: FULL RAW JSON CONFIG ── */}
        {activeTab === 'json' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                <IconInfo size={14} color="#0284c7" />
                <span>Complete Apify Actor Input JSON schema (overrides all saved task parameters):</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleFormatJson}>
                Validate & Format JSON
              </Button>
            </div>

            <textarea
              value={rawJsonString}
              onChange={(e) => {
                setRawJsonString(e.target.value);
                setJsonError(null);
              }}
              rows={15}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                lineHeight: 1.45,
                padding: '12px',
                borderRadius: 6,
                border: `1px solid ${jsonError ? '#ef4444' : '#cbd5e1'}`,
                backgroundColor: '#090d16',
                color: '#f8fafc',
                resize: 'vertical',
              }}
              spellCheck={false}
            />

            {jsonError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#fff1f2', borderRadius: 4, color: '#9f1239', fontSize: 12, border: '1px solid #fecdd3' }}>
                {jsonError}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
