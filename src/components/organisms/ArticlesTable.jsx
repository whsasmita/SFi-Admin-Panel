import React, { useState, useEffect, useRef } from "react";
import StatusBadge from "../atoms/StatusBadge.jsx";
import Button from "../atoms/Button.jsx";
import SearchBar from "../molecules/SearchBar.jsx";
import PaginationControls from "../molecules/PaginationControls.jsx";
import {
  IconEye,
  IconRefresh,
  IconExternalLink,
  IconCheckCircle,
  IconAlertTriangle,
  IconXCircle,
} from "../atoms/Icons.jsx";

/**
 * Organism: ArticlesTable
 * Filterable, paginated, high-density disaster news article queue
 * with multi-select checkboxes, batch status actions, and inline status updates.
 */
export default function ArticlesTable({
  articles = [],
  pagination = {},
  statusFilter = "",
  searchQuery = "",
  loading = false,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onStatusFilterChange,
  onPageChange,
  onSelectArticle,
  onBatchStatusChange,
  onQuickStatusChange,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchStatus, setBatchStatus] = useState("VALIDATED");
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);
  const [inlineUpdatingId, setInlineUpdatingId] = useState(null);

  const selectAllRef = useRef(null);

  const statusTabs = [
    { key: "", label: "All Articles" },
    { key: "SCRAPED", label: "Scraped" },
    { key: "PROCESSING", label: "Processing" },
    { key: "VALIDATED", label: "Validated" },
    { key: "PUBLISHED_TO_KG", label: "Published to KG" },
    { key: "REJECTED", label: "Rejected" },
  ];

  const statusOptions = [
    { value: "SCRAPED", label: "SCRAPED (Raw)" },
    { value: "PROCESSING", label: "PROCESSING (In Flight)" },
    { value: "VALIDATED", label: "VALIDATED (Curated)" },
    { value: "PUBLISHED_TO_KG", label: "PUBLISHED_TO_KG" },
    { value: "REJECTED", label: "REJECTED (Invalid)" },
  ];

  // Reset selection when page or status filter changes
  useEffect(() => {
    setSelectedIds([]);
  }, [pagination.page, statusFilter]);

  // Handle indeterminate state for header checkbox
  const isAllSelected =
    articles.length > 0 && selectedIds.length === articles.length;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < articles.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a.id));
    }
  };

  const handleToggleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBatchStatus = async (statusToApply) => {
    const targetStatus = statusToApply || batchStatus;
    if (!targetStatus || selectedIds.length === 0) return;

    if (onBatchStatusChange) {
      try {
        setIsApplyingBatch(true);
        await onBatchStatusChange(selectedIds, targetStatus);
        setSelectedIds([]);
      } finally {
        setIsApplyingBatch(false);
      }
    }
  };

  const handleRowStatusChange = async (articleId, newStatus, e) => {
    e.stopPropagation();
    if (onQuickStatusChange) {
      try {
        setInlineUpdatingId(articleId);
        await onQuickStatusChange(articleId, newStatus);
      } finally {
        setInlineUpdatingId(null);
      }
    }
  };

  return (
    <div>
      {/* Quick Filter Tab Chips + Search Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "16px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          marginBottom: 16,
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Status Tab Chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: 12,
          }}
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`filter-tab ${statusFilter === tab.key ? "active" : ""}`}
              onClick={() => onStatusFilterChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Toolbar & Row Counter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <SearchBar
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onSubmit={onSearchSubmit}
            onClear={onSearchClear}
            loading={loading}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            {selectedIds.length > 0 && (
              <span
                style={{
                  color: "#0284c7",
                  fontWeight: 600,
                  backgroundColor: "#f0f9ff",
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #bae6fd",
                }}
              >
                {selectedIds.length} article(s) selected
              </span>
            )}
            <div>
              Total in queue:{" "}
              <strong
                style={{ color: "#0f172a", fontFamily: "var(--font-mono)" }}
              >
                {pagination.total || 0}
              </strong>{" "}
              records
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Batch Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "12px 18px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            borderRadius: 8,
            marginBottom: 16,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 700,
                fontSize: 13,
                color: "#38bdf8",
              }}
            >
              <IconCheckCircle size={16} />
              <span>{selectedIds.length} article(s) selected</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Deselect All
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "#cbd5e1" }}>
              Batch Action:
            </span>

            {/* Quick Status Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExecuteBatchStatus("VALIDATED")}
              disabled={isApplyingBatch}
              style={{
                backgroundColor: "#059669",
                color: "#ffffff",
                borderColor: "#059669",
                fontSize: 12,
              }}
            >
              Mark Validated
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExecuteBatchStatus("REJECTED")}
              disabled={isApplyingBatch}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                borderColor: "#dc2626",
                fontSize: 12,
              }}
            >
              Mark Rejected
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExecuteBatchStatus("SCRAPED")}
              disabled={isApplyingBatch}
              style={{
                backgroundColor: "#475569",
                color: "#ffffff",
                borderColor: "#475569",
                fontSize: 12,
              }}
            >
              Reset Scraped
            </Button>

            {/* Custom Status Dropdown & Apply */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <select
                value={batchStatus}
                onChange={(e) => setBatchStatus(e.target.value)}
                style={{
                  backgroundColor: "#1e293b",
                  color: "#ffffff",
                  border: "1px solid #334155",
                  borderRadius: 4,
                  padding: "5px 10px",
                  fontSize: 12,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleExecuteBatchStatus(batchStatus)}
                disabled={isApplyingBatch}
              >
                {isApplyingBatch ? "Applying..." : "Apply"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  aria-label="Select all articles on this page"
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={{ width: "65px" }}>ID</th>
              <th>Disaster News Article Details</th>
              <th style={{ width: "115px" }}>Coverage</th>
              <th style={{ width: "125px" }}>Publish Date</th>
              <th style={{ width: "110px" }}>Source</th>
              <th style={{ width: "165px" }}>Lifecycle Status</th>
              <th style={{ width: "90px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <IconRefresh size={16} className="animate-spin" />
                    <span>Loading articles from staging database...</span>
                  </div>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    color: "#64748b",
                  }}
                >
                  No disaster articles found matching the current search or
                  status filter.
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const isSelected = selectedIds.includes(article.id);
                return (
                  <tr
                    key={article.id}
                    className={isSelected ? "row-selected" : ""}
                    onClick={() => onSelectArticle(article.id)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#f0f9ff" : undefined,
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* Checkbox Column */}
                    <td
                      style={{ textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelectRow(article.id, e)}
                        style={{ cursor: "pointer" }}
                        aria-label={`Select article #${article.id}`}
                      />
                    </td>

                    {/* ID */}
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "#0284c7",
                      }}
                    >
                      #{article.id}
                    </td>

                    {/* Title & Metadata */}
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                          marginBottom: 3,
                          fontSize: 13,
                          lineHeight: 1.35,
                        }}
                      >
                        {article.title_en || article.title}
                      </div>
                      {article.title_th &&
                        article.title_th !== article.title_en && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "#64748b",
                              marginBottom: 4,
                            }}
                          >
                            {article.title_th}
                          </div>
                        )}
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            color: "#0284c7",
                            textDecoration: "none",
                          }}
                          title="Open original news source"
                        >
                          <IconExternalLink size={11} />
                          <span>View Source</span>
                        </a>
                      )}
                    </td>

                    {/* Coverage */}
                    <td>
                      {article.is_foreign ? (
                        <span
                          className="badge badge-rejected"
                          style={{ fontSize: "10px" }}
                        >
                          International
                        </span>
                      ) : (
                        <span
                          className="badge badge-approved"
                          style={{ fontSize: "10px" }}
                        >
                          Domestic TH
                        </span>
                      )}
                    </td>

                    {/* Publish Date */}
                    <td
                      style={{
                        fontSize: 12,
                        color: "#475569",
                        whiteSpace: "nowrap",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {article.publish_date || "—"}
                    </td>

                    {/* Source */}
                    <td style={{ fontSize: 12, color: "#64748b" }}>
                      {article.source || "Cheerio"}
                    </td>

                    {/* Lifecycle Status & Inline Changer */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <StatusBadge status={article.status} />
                        <select
                          value={article.status}
                          disabled={inlineUpdatingId === article.id}
                          onChange={(e) =>
                            handleRowStatusChange(
                              article.id,
                              e.target.value,
                              e
                            )
                          }
                          style={{
                            fontSize: 11,
                            padding: "2px 4px",
                            borderRadius: 4,
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#334155",
                            cursor: "pointer",
                            outline: "none",
                          }}
                          title="Quick update status without leaving page"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              Change: {opt.value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: "right" }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={IconEye}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectArticle(article.id);
                        }}
                        title="Inspect locations & metadata"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls Molecule */}
        <PaginationControls
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || 0}
          limit={pagination.limit || 15}
          currentCount={articles.length}
          onPageChange={onPageChange}
          loading={loading}
        />
      </div>
    </div>
  );
}
