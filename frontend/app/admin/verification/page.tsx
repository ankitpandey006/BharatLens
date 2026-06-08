"use client";

import { useEffect, useMemo, useState } from "react";
import AdminItemTable from "@/components/admin/AdminItemTable";
import VerificationDetailPanel from "@/components/admin/VerificationDetailPanel";
import { fetchAdminCollectedData, type BackendAdminContentItem } from "@/lib/api/admin";
import { mapBackendItemToAdminItem } from "@/lib/api/admin-utils";

export default function VerificationPage() {
  const [items, setItems] = useState<BackendAdminContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<BackendAdminContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchAdminCollectedData(1, 50, "pending");
      const mapped = (res.items || []).map((it: BackendAdminContentItem) => mapCollectedItem(it));
      setItems(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => {
      const needle = search.trim().toLowerCase();
      if (!needle) return true;
      return (
        String(item.title || "").toLowerCase().includes(needle) ||
        String(item.description || item.rawContent || "").toLowerCase().includes(needle) ||
        String(item.source_name || item.sourceName || "").toLowerCase().includes(needle)
      );
    }),
    [items, search],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">Data Verification</h1>
        <p className="mt-2 text-[#111827]/60">Review items awaiting verification from the backend.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, sources, or summary..."
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 sm:py-3"
          />
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1A3C6E] transition hover:bg-[#F5F3EE] sm:py-3"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/50 sm:h-12" />
          ))}
        </div>
      ) : (
        <>
          <AdminItemTable items={filteredItems} isLoading={false} onRowClick={(it) => setSelected(it)} />
          <VerificationDetailPanel
            item={selected ? mapBackendItemToAdminItem(selected) : null}
            isOpen={Boolean(selected)}
            onClose={() => setSelected(null)}
            onStatusChange={() => {
              void refresh();
            }}
            onActionComplete={() => {
              setSelected(null);
              void refresh();
            }}
          />
        </>
      )}
    </div>
  );
}

function mapCollectedItem(it: BackendAdminContentItem): BackendAdminContentItem {
  return {
    id: it.id,
    title: it.raw_title || it.title || "Untitled",
    rawContent: it.raw_content || "",
    rawUrl: it.raw_url || it.source_url || "",
    collectionMethod: it.collection_method || "",
    source_name: it.source_name || "",
    source_url: it.source_url || "",
    item_type: it.item_type || "scheme",
    category: it.category || "",
    processing_status: it.processing_status,
    verification_status: it.verification_status,
    admin_notes: it.admin_notes || "",
    published_at: it.published_at || null,
    created_at: it.created_at,
    updated_at: it.updated_at,
    description: it.description,
  } as BackendAdminContentItem;
}
