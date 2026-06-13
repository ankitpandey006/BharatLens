"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ModerationTable from "@/components/admin/ModerationTable";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SlidePanel from "@/components/admin/SlidePanel";
import { fetchAdminCollectedData, approveCollectedData, rejectCollectedData, publishCollectedData, unpublishCollectedData, deleteCollectedData, editCollectedData, processPendingItemsWithAi, bulkApproveCollectedData, bulkRejectCollectedData, bulkDeleteCollectedData, bulkProcessAiCollectedData, type BulkActionResult } from "@/lib/api/admin";
import { mapBackendItemToAdminItem } from "@/lib/api/admin-utils";
import { apiClient } from "@/lib/api/client";
import { Bot, RefreshCw, Play, Search } from "lucide-react";
import type { BackendAdminContentItem } from "@/lib/api/admin";

export default function VerificationQueuePage() {
  const [items, setItems] = useState<BackendAdminContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [selected, setSelected] = useState<BackendAdminContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [isCollecting, setIsCollecting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkActionResult | null>(null);
  const [rowActionLoading, setRowActionLoading] = useState<Record<string, string | null>>({});

  const STATUS_TABS = [
    { key: "pending", label: "Pending" },
    { key: "verified_ready", label: "Ready" },
    { key: "duplicate", label: "Duplicates" },
    { key: "failed", label: "Failed" },
  ];

  const refresh = useCallback(async (status?: string) => {
    const s = status || activeTab;

    if (hasLoadedOnce.current) {
      // Background refresh — keep old data visible, no skeleton
      try {
        const res = await fetchAdminCollectedData(1, 100, s);
        setItems(res.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminCollectedData(1, 100, s);
      setItems(res.items || []);
      hasLoadedOnce.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
    setBulkResult(null);
    // Tab change is a real navigation — show skeleton
    setIsLoading(true);
    hasLoadedOnce.current = false;
    fetchAdminCollectedData(1, 100, tab)
      .then((res) => {
        setItems(res.items || []);
        hasLoadedOnce.current = true;
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRunCollectors = useCallback(async () => {
    setIsCollecting(true);
    try {
      await apiClient("/collectors/run-all", { method: "POST" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Collection failed");
    } finally {
      setIsCollecting(false);
    }
  }, [refresh]);

  const handleProcessAi = useCallback(async () => {
    setIsAiProcessing(true);
    try {
      await processPendingItemsWithAi(10);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI processing failed");
    } finally {
      setIsAiProcessing(false);
    }
  }, [refresh]);

  useEffect(() => {
    const t = setTimeout(() => refresh(), 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const filteredItems = search.trim()
    ? items.filter((it) => {
        const q = search.toLowerCase();
        const r = it as Record<string, unknown>;
        return String(r.title || r.raw_title || "").toLowerCase().includes(q)
          || String(r.source_name || "").toLowerCase().includes(q);
      })
    : items;

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setBulkResult(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
    setBulkResult(null);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkResult(null);
  };

  // Bulk action handlers
  const handleBulkApprove = async () => {
    setBulkActionLoading("approve");
    try {
      const result = await bulkApproveCollectedData(Array.from(selectedIds));
      setBulkResult(result);
      clearSelection();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk approve failed");
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkReject = async () => {
    setBulkActionLoading("reject");
    try {
      const reason = prompt("Rejection reason (optional):") || undefined;
      const result = await bulkRejectCollectedData(Array.from(selectedIds), reason);
      setBulkResult(result);
      clearSelection();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk reject failed");
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    setBulkActionLoading("delete");
    try {
      const result = await bulkDeleteCollectedData(Array.from(selectedIds));
      setBulkResult(result);
      clearSelection();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkProcessAi = async () => {
    setBulkActionLoading("process-with-ai");
    try {
      const result = await bulkProcessAiCollectedData(Array.from(selectedIds));
      setBulkResult(result);
      clearSelection();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk AI processing failed");
    } finally {
      setBulkActionLoading(null);
    }
  };

  // Single action handlers
  const handleApprove = async (id: string, notes?: string, edits?: Record<string, unknown>) => {
    setRowActionLoading((prev) => ({ ...prev, [id]: "approve" }));
    try {
      await approveCollectedData(id, notes, edits);
      await refresh();
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id: string, reason: string, notes?: string) => {
    setRowActionLoading((prev) => ({ ...prev, [id]: "reject" }));
    try {
      await rejectCollectedData(id, reason, notes);
      await refresh();
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handlePublish = async (id: string) => {
    setRowActionLoading((prev) => ({ ...prev, [id]: "publish" }));
    try {
      const item = items.find((i) => i.id === id || (i as Record<string, unknown>).collected_data_id === id);
      const itemType = String((item as Record<string, unknown>)?.item_type || "scheme");
      await publishCollectedData(id, itemType, {});
      await refresh();
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleUnpublish = async (id: string) => {
    setRowActionLoading((prev) => ({ ...prev, [id]: "unpublish" }));
    try {
      await unpublishCollectedData(id);
      await refresh();
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleDelete = async (id: string) => {
    setRowActionLoading((prev) => ({ ...prev, [id]: "delete" }));
    try {
      await deleteCollectedData(id);
      await refresh();
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSave = async (id: string, updates: Record<string, unknown>) => {
    setRowActionLoading((prev) => ({ ...prev, [id]: "edit" }));
    try {
      await editCollectedData(id, updates);
      await refresh();
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">Verification Queue</h1>
          <p className="mt-1 text-sm text-[#111827]/60">
            Review, approve, or reject items processed by the AI pipeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleRunCollectors} disabled={isCollecting}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1A3C6E] hover:bg-[#F5F3EE] transition disabled:opacity-60"
          >
            <Play size={16} /> {isCollecting ? "Running..." : "Run Collectors"}
          </button>
          <button onClick={handleProcessAi} disabled={isAiProcessing}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-100 transition disabled:opacity-60"
          >
            <Bot size={16} /> {isAiProcessing ? "Processing..." : "Process with AI"}
          </button>
          <button onClick={() => refresh()} disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1A3C6E] hover:bg-[#F5F3EE] transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#111827]/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or source..."
          className="w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#E5E7EB] pb-3">
        {STATUS_TABS.map((tab) => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === tab.key
                ? "bg-[#1A3C6E] text-white"
                : "text-[#111827]/60 hover:text-[#111827] hover:bg-[#F5F3EE]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[#FECACA] bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        activeAction={bulkActionLoading}
        result={bulkResult}
        pageLabel="items selected"
        actions={[
          { label: "Approve", action: handleBulkApprove, variant: "primary" },
          { label: "Reject", action: handleBulkReject, variant: "warning" },
          ...(activeTab === "failed" || activeTab === "duplicate" ? [{ label: "Delete", action: handleBulkDelete, variant: "danger" as const, requiresConfirmation: true }] : []),
          { label: "Process with AI", action: handleBulkProcessAi, variant: "default" },
        ]}
      />

      {/* Table */}
      <ModerationTable
        items={filteredItems}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onPreview={(it) => setSelected(it)}
        onEdit={(it) => setSelected(it)}
        onApprove={(it) => {
          handleApprove(it.id).then(() => setSelected(null));
        }}
        onReject={(it) => {
          const reason = prompt("Rejection reason:") || "Rejected by admin";
          handleReject(it.id, reason).then(() => setSelected(null));
        }}
        showActions={["preview", "edit", "approve", "reject"]}
        rowActionLoading={rowActionLoading}
      />

      {/* Slide Panel */}
      <SlidePanel
        item={selected ? mapBackendItemToAdminItem(selected) : null}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onRestore={handleDelete}
        onDelete={handleDelete}
        onSave={handleSave}
        onRefresh={() => refresh()}
      />
    </div>
  );
}
