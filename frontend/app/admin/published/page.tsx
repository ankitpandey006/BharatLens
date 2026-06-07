"use client";

import { useEffect, useMemo, useState } from "react";
import AdminItemTable from "@/components/admin/AdminItemTable";
import VerificationDetailPanel from "@/components/admin/VerificationDetailPanel";
import {
  fetchAdminItemsByStatus,
  type BackendAdminContentItem,
} from "@/lib/api/admin";

export default function PublishedPage() {
  const [items, setItems] = useState<BackendAdminContentItem[]>([]);
  const [selected, setSelected] = useState<BackendAdminContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fresh = await fetchAdminItemsByStatus("published");
      setItems(fresh);
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
        item.title?.toLowerCase().includes(needle) ||
        item.description?.toString().toLowerCase().includes(needle) ||
        item.source_name?.toString().toLowerCase().includes(needle)
      );
    }),
    [items, search],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Published Content</h1>
        <p className="mt-2 text-[#111827]/60">Monitor content that is currently published in BharatLens.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search published items..."
          className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
        />
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
          <AdminItemTable items={filteredItems} isLoading={isLoading} onRowClick={(item) => setSelected(item)} />
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

function mapToAdminItem(it: BackendAdminContentItem) {
  const statusMap: Record<string, string> = {
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
    collected_data_id: it.id,
    title: it.title || it.raw_title || "Untitled",
    type: (it.item_type === "scheme" || it.item_type === "scholarship" || it.item_type === "job" || it.item_type === "exam") ? it.item_type : "update",
    category: it.category || "general",
    sourceName: it.source_name || "",
    sourceUrl: it.source_url || it.raw_url || "",
    summary: (it.description as string) || (it.raw_content as string) || "",
    eligibility: it.eligibility || "",
    benefits: it.benefits || "",
    deadline: it.deadline || null,
    state: it.state || "",
    status,
    aiConfidenceScore: Number((it as any).metadata?.ai_confidence ?? (it as any).confidence ?? 0),
    sourceTrustScore: Number((it as any).metadata?.source_trust ?? 0),
    aiNotes: String((it as any).metadata?.ai_notes ?? it.admin_notes ?? ""),
    adminNotes: it.admin_notes || "",
    lastUpdated: (it.updated_at || it.created_at) as string,
    publishedAt: it.published_at || null,
    tags: [],
    rawUrl: it.raw_url || "",
    rawContent: it.raw_content || "",
    collectionMethod: it.collection_method || "",
  } as any;
}
