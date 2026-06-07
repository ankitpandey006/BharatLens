"use client";

import { useEffect, useMemo, useState } from "react";
import AdminItemTable from "@/components/admin/AdminItemTable";
import VerificationDetailPanel from "@/components/admin/VerificationDetailPanel";
import { fetchAdminCollectedData, type BackendAdminContentItem } from "@/lib/api/admin";
import type { AdminItem } from "@/types/admin";

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
      const mapped = (res.items || []).map((it: any) => mapCollectedItem(it));
      setItems(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => {
      const needle = search.trim().toLowerCase();
      if (!needle) return true;
      return (
        String(item.title || "").toLowerCase().includes(needle) ||
        String(item.summary || "").toLowerCase().includes(needle) ||
        String(item.sourceName || item.source_name || "").toLowerCase().includes(needle)
      );
    }),
    [items, search],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Data Verification</h1>
        <p className="mt-2 text-[#111827]/60">Review items awaiting verification from the backend.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, sources, or summary..."
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
          />
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#1A3C6E] hover:bg-[#F5F3EE]"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <AdminItemTable items={filteredItems} isLoading={isLoading} onRowClick={(it) => setSelected(it)} />
          <VerificationDetailPanel
            item={selected ? mapToAdminItem(selected) : null}
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

function mapCollectedItem(it: any): BackendAdminContentItem {
  return {
    id: it.id,
    collected_data_id: it.id,
    title: it.raw_title || it.title || "Untitled",
    rawContent: it.raw_content || "",
    rawUrl: it.raw_url || it.source_url || "",
    collectionMethod: it.collection_method || "",
    source_name: (it.sources && it.sources.source_name) || it.source_name || "",
    source_url: (it.sources && it.sources.source_url) || it.source_url || "",
    item_type: it.item_type || it.item_type || "scheme",
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

function mapToAdminItem(it: BackendAdminContentItem) {
  const statusMap: Record<string, any> = {
    collected: "pending_verification",
    processed: "published",
    processing: "approved",
    failed: "rejected",
    pending: "pending_verification",
    pending_verification: "pending_verification",
    approved: "approved",
    rejected: "rejected",
    published: "published",
  };

  const rawStatus = ((it.verification_status as string) || (it.processing_status as string) || (it.status as string) || "").toLowerCase();
  const status = statusMap[rawStatus] || "ai_processed";

  return {
    id: it.id,
    title: it.title || it.id,
    type: (it.item_type === "scheme" || it.item_type === "scholarship" || it.item_type === "job" || it.item_type === "exam") ? it.item_type : "update",
    category: it.category || "general",
    sourceName: it.source_name || "",
    sourceUrl: it.source_url || it.rawUrl || "",
    summary: (it.description as string) || (it.rawContent as string) || "",
    eligibility: "",
    benefits: "",
    deadline: null,
    state: "",
    status,
    aiConfidenceScore: Number((it as any).metadata?.ai_confidence ?? (it as any).confidence ?? 0),
    sourceTrustScore: Number((it as any).metadata?.source_trust ?? 0),
    aiNotes: String((it as any).metadata?.ai_notes ?? (it as any).admin_notes ?? ""),
    adminNotes: it.admin_notes || "",
    lastUpdated: (it.updated_at || it.created_at) as string,
    publishedAt: it.published_at || null,
    tags: [],
    rawUrl: it.rawUrl,
    rawContent: it.rawContent,
    collectionMethod: it.collectionMethod,
  } as AdminItem;
}
