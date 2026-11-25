import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ArticlesTable from '../organisms/ArticlesTable.jsx';
import Button from '../atoms/Button.jsx';
import ScraperConfigModal from '../molecules/ScraperConfigModal.jsx';
import CrawlerProgressModal from '../molecules/CrawlerProgressModal.jsx';
import BatchNlpModal from '../molecules/BatchNlpModal.jsx';
import SyncDatasetModal from '../molecules/SyncDatasetModal.jsx';
import PublishBatchModal from '../molecules/PublishBatchModal.jsx';
import {
  IconRefresh,
  IconCheckCircle,
  IconAlertTriangle,
  IconPlay,
  IconSend,
} from '../atoms/Icons.jsx';

/**
 * Page: StagingQueuePage
 * Ingestion Toolbar with 0-100% Progress Tracking (Apify Scraper Monitor, Dataset Ingestion,
 * Batch NLP Pipeline, and Bulk Publish All Validated to GraphDB) + Articles Table with URL Filter Persistence
 */
export default function StagingQueuePage({ onSelectArticle }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { canPublish } = useAuth();

  const initialStatus = searchParams.get('status') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialSearch = searchParams.get('search') || '';

  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: initialPage, limit: 15, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Crawler Trigger & Live Monitor Modal States
  const [isCrawlerSelectOpen, setIsCrawlerSelectOpen] = useState(false);
  const [crawlerTaskId, setCrawlerTaskId] = useState('whsasmita/cheerio-scraper-task');
  const [isTriggeringCrawler, setIsTriggeringCrawler] = useState(false);
  const [activeRunId, setActiveRunId] = useState(null);
  const [isCrawlerProgressOpen, setIsCrawlerProgressOpen] = useState(false);

  // Dataset Sync Modal State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Batch NLP Modal State
  const [isBatchNlpOpen, setIsBatchNlpOpen] = useState(false);

  // Bulk Publish All Validated to KG Modal State
  const [isPublishBatchOpen, setIsPublishBatchOpen] = useState(false);

  const [toolbarFeedback, setToolbarFeedback] = useState(null);

  const updateUrlParams = (pageVal, statusVal, searchVal) => {
    const nextParams = {};
    if (statusVal) nextParams.status = statusVal;
    if (pageVal && pageVal > 1) nextParams.page = String(pageVal);
    if (searchVal) nextParams.search = searchVal;
    setSearchParams(nextParams, { replace: true });
  };

  const fetchArticles = async (page = 1, status = statusFilter, search = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getArticles({
        page,
        limit: pagination.limit,
        status,
        search,
      });

      if (res.success && res.data) {
        setArticles(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError(err.message || 'Failed to fetch articles from staging queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(initialPage, statusFilter, searchQuery);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams(1, statusFilter, searchQuery);
    fetchArticles(1, statusFilter, searchQuery);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      updateUrlParams(newPage, statusFilter, searchQuery);
      fetchArticles(newPage, statusFilter, searchQuery);
    }
  };

  const handleSelectArticleRow = (articleId) => {
    if (onSelectArticle) {
      onSelectArticle(articleId);
    } else {
      navigate(`/queue/${articleId}`);
    }
  };

  // Handle Multi-Select Batch Status Update
  const handleBatchStatusChange = async (selectedIds, newStatus) => {
    try {
      setToolbarFeedback(null);
      const res = await apiClient.batchUpdateArticleStatus(selectedIds, newStatus);
      if (res.success) {
        setToolbarFeedback({
          type: 'success',
          message: `Batch Update: Successfully changed status of ${selectedIds.length} article(s) to ${newStatus}.`,
        });
        // Optimistically update list or refetch
        setArticles((prev) =>
          prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status: newStatus } : a))
        );
      } else {
        setToolbarFeedback({
          type: 'error',
          message: res.message || 'Failed to update selected articles.',
        });
      }
    } catch (err) {
      setToolbarFeedback({
        type: 'error',
        message: err.message || 'Failed to execute batch status update.',
      });
    }
  };

  // Handle Inline Quick Status Change per row
  const handleQuickStatusChange = async (articleId, newStatus) => {
    try {
      const res = await apiClient.updateArticle(articleId, { status: newStatus });
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, status: newStatus } : a))
        );
        setToolbarFeedback({
          type: 'success',
          message: `Article #${articleId} status updated to ${newStatus}.`,
        });
      } else {
        setToolbarFeedback({
          type: 'error',
          message: res.message || 'Failed to update article status.',
        });
      }
    } catch (err) {
      setToolbarFeedback({
        type: 'error',
        message: err.message || 'Failed to update article status.',
      });
    }
  };

  // Trigger Apify Task with Custom Config (Standard Form or Advanced Code)
  const handleLaunchScraperWithConfig = async ({ taskId, inputOverrides }) => {
    try {
      setIsTriggeringCrawler(true);
      setToolbarFeedback(null);
      setCrawlerTaskId(taskId);
      const res = await apiClient.triggerCrawler({ taskId, inputOverrides });

      if (res.success && res.data?.run_id) {
        setIsCrawlerSelectOpen(false);
        setActiveRunId(res.data.run_id);
        setIsCrawlerProgressOpen(true);
      } else {
        setToolbarFeedback({
          type: 'error',
          message: res.message || 'Failed to trigger Apify scraper run.',
        });
      }
    } catch (err) {
      setToolbarFeedback({
        type: 'error',
        message: err.message || 'Failed to trigger Apify scraper task.',
      });
    } finally {
      setIsTriggeringCrawler(false);
    }
  };

  return (
    <div>
      {/* Top Header & Actions Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
            Staging Queue (Disaster News Articles)
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Natural disaster news articles queue for scraping ingestion, NLP translation, NER geoparsing, human curation, and Knowledge Graph publishing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Trigger Apify Scraper */}
          <Button
            variant="outline"
            onClick={() => setIsCrawlerSelectOpen(true)}
            disabled={loading}
            icon={IconPlay}
          >
            Run Apify Scraper
          </Button>

          {/* Sync Apify Dataset to MySQL */}
          <Button
            variant="outline"
            onClick={() => setIsSyncModalOpen(true)}
            disabled={loading}
          >
            Sync Dataset (0-100%)
          </Button>

          {/* Batch NLP Processing */}
          <Button
            variant="primary"
            onClick={() => setIsBatchNlpOpen(true)}
            disabled={loading}
            title="Batch run translation and geoparsing on pending SCRAPED articles"
          >
            Batch NLP Pipeline (0-100%)
          </Button>

          {/* Bulk Publish All Validated to GraphDB */}
          <Button
            variant="publish"
            onClick={() => setIsPublishBatchOpen(true)}
            disabled={loading || !canPublish}
            icon={IconSend}
            title="Publish all VALIDATED articles with approved locations to Ontotext GraphDB"
          >
            Publish All Validated to KG
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            onClick={() => fetchArticles(pagination.page, statusFilter, searchQuery)}
            disabled={loading}
            icon={IconRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar Feedback Banner */}
      {toolbarFeedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 6,
            backgroundColor: toolbarFeedback.type === 'success' ? '#f0fdf4' : '#fff1f2',
            border: `1px solid ${toolbarFeedback.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
            color: toolbarFeedback.type === 'success' ? '#166534' : '#9f1239',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {toolbarFeedback.type === 'success' ? <IconCheckCircle size={18} /> : <IconAlertTriangle size={18} />}
          <div>{toolbarFeedback.message}</div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 4,
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#9f1239',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Articles Table Organism */}
      <ArticlesTable
        articles={articles}
        pagination={pagination}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        loading={loading}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onSearchClear={() => {
          setSearchQuery('');
          updateUrlParams(1, statusFilter, '');
          fetchArticles(1, statusFilter, '');
        }}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          updateUrlParams(1, status, searchQuery);
        }}
        onPageChange={handlePageChange}
        onSelectArticle={handleSelectArticleRow}
        onBatchStatusChange={handleBatchStatusChange}
        onQuickStatusChange={handleQuickStatusChange}
      />

      {/* 1. Apify Custom Scraper Configuration & Trigger Modal (Standard Form + Advanced Code/JSON) */}
      <ScraperConfigModal
        isOpen={isCrawlerSelectOpen}
        onClose={() => setIsCrawlerSelectOpen(false)}
        onLaunch={handleLaunchScraperWithConfig}
        loading={isTriggeringCrawler}
      />

      {/* 2. Live Apify Crawler Progress Modal (0-100% progress, live timer, items count, 1-click sync) */}
      <CrawlerProgressModal
        isOpen={isCrawlerProgressOpen}
        onClose={() => {
          setIsCrawlerProgressOpen(false);
          fetchArticles(1, statusFilter, searchQuery);
        }}
        runId={activeRunId}
        taskId={crawlerTaskId}
        onSyncComplete={(res) => {
          fetchArticles(1, statusFilter, searchQuery);
          setToolbarFeedback({
            type: 'success',
            message: `Ingestion complete! ${res.inserted || 0} new articles added to staging queue.`,
          });
        }}
      />

      {/* 3. Sync Dataset to MySQL Modal (0-100% progress) */}
      <SyncDatasetModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onComplete={(res) => {
          fetchArticles(1, statusFilter, searchQuery);
          setToolbarFeedback({
            type: 'success',
            message: `Dataset synchronized successfully: ${res.inserted || 0} inserted, ${res.skipped || 0} duplicates skipped.`,
          });
        }}
      />

      {/* 4. Batch NLP Processing Modal (0-100% progress) */}
      <BatchNlpModal
        isOpen={isBatchNlpOpen}
        onClose={() => setIsBatchNlpOpen(false)}
        onComplete={(res) => {
          fetchArticles(1, statusFilter, searchQuery);
          setToolbarFeedback({
            type: 'success',
            message: `Batch NLP pipeline completed: ${res.processed_count || 0} articles translated & geoparsed.`,
          });
        }}
      />

      {/* 5. Bulk Publish All Validated to GraphDB Modal (0-100% progress) */}
      <PublishBatchModal
        isOpen={isPublishBatchOpen}
        onClose={() => setIsPublishBatchOpen(false)}
        onComplete={(res) => {
          fetchArticles(pagination.page, statusFilter, searchQuery);
          setToolbarFeedback({
            type: 'success',
            message:
              res.message ||
              `Bulk GraphDB Publish complete: ${res.published_count || 0} validated articles published (${res.total_triples || 0} triples).`,
          });
        }}
      />
    </div>
  );
}
