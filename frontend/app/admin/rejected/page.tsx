"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ModerationTable from "@/components/admin/ModerationTable";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SlidePanel from "@/components/admin/SlidePanel";
import { fetchAdminCollectedData, approveCollectedData, deleteCollectedData, editCollectedData, bulkRestoreCollectedData, bulkDeleteCollectedData, type BulkActionResult } from "@/lib/api/admin";
import { mapBackendItemToAdminItem } from "@/lib/api/admin-utils";
import { RefreshCw, Search } from "lucide-react";
import type { BackendAdminContentItem } from "@/lib/api/admin";

export default function RejectedPage() {
  const [items, setItems] = useState<BackendAdminContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [selected, setSelected] = useState<BackendAdminContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkActionResult | null>(null);
  const [rowActionLoading, setRowActionLoading] = useState<Record<string, string | null>>({});

  const refresh = useCallback(async () => {
    if (hasLoadedOnce.current) {
      // Background refresh — keep old data visible, no skeleton
      try {
        const res = await fetchAdminCollectedData(1, 100, "rejected");
        setItems(res.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminCollectedData(1, 100, "rejected");
      setItems(res.items || []);
      hasLoadedOnce.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filteredItems = search.trim()
    ? items.filter((it) => {
        const q = search.toLowerCase();
        const r = it as Record<string, unknown>;
        return String(r.title || r.raw_title || "").toLowerCase().includes(q);
      })
    : items;

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

  const handleBulkRestore = async () => {
    setBulkActionLoading("restore");
    try {
      const result = await bulkRestoreCollectedData(Array.from(selectedIds));
      setBulkResult(result);
      clearSelection();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk restore failed");
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently delete ${selectedIds.size} rejected items? This cannot be undone.`)) return;
    setBulkActionLoading("delete-permanently");
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

  const handleRestore = async (id: string) => {
    setRowActionLoading((prev) => ({ ...prev, [id]: "restore" }));
    try {
      await approveCollectedData(id, "Restored from rejected");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this item permanently? This cannot be undone.")) return;
    setRowActionLoading((prev) => ({ ...prev, [id]: "delete" }));
    try {
      await deleteCollectedData(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setRowActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSave = async (id: string, updates: Record<string, unknown>) => {
    await editCollectedData(id, updates);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">Rejected Items</h1>
          <p className="mt-1 text-sm text-[#111827]/60">Rejected items. You can restore or permanently delete them.</p>
        </div>
        <button onClick={refresh} disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1A3C6E] hover:bg-[#F5F3EE] transition disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#111827]/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
        />
      </div>

      {error && <div className="rounded-xl border border-[#FECACA] bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <BulkActionBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        activeAction={bulkActionLoading}
        result={bulkResult}
        pageLabel="items rejected"
        actions={[
          { label: "Restore", action: handleBulkRestore, variant: "primary" },
          { label: "Delete Permanently", action: handleBulkDelete, variant: "danger", requiresConfirmation: true },
        ]}
      />

      <ModerationTable
        items={filteredItems} isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onPreview={(it) => setSelected(it)}
        onEdit={(it) => setSelected(it)}
        onRestore={(it) => handleRestore(it.id)}
        onDelete={(it) => handleDelete(it.id)}
        showActions={["preview", "edit", "restore", "delete"]}
        rowActionLoading={rowActionLoading}
      />

      <SlidePanel
        item={selected ? mapBackendItemToAdminItem(selected) : null}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        onApprove={handleRestore}
        onReject={handleDelete as any}
        onPublish={handleRestore}
        onUnpublish={handleDelete as any}
        onRestore={handleRestore}
        onDelete={handleDelete}
        onSave={handleSave}
        onRefresh={refresh}
      />
    </div>
  );
}
