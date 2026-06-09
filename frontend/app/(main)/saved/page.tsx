"use client";

import { useState } from "react";
import SavedItemCard from "@/components/cards/SavedItemCard";
import type { SavedItemCardData } from "@/components/cards/SavedItemCard";
import { unsaveItem } from "@/lib/api/content-api";
import type { SavedItem } from "@/lib/api/content-api";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";
import { useSavedItems } from "@/hooks/useApi";

/** Safely extract a string field from item_data, checking multiple key variations */
function getField(data: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
  if (!data) return undefined;
  for (const key of keys) {
    const val = data[key];
    if (typeof val === "string" && val.length > 0) return val;
  }
  return undefined;
}

/** Map a saved item from the API into a SavedItemCardData for the card component */
function toCardData(item: SavedItem): SavedItemCardData {
  const d = item.item_data as Record<string, unknown> | undefined;
  let status: SavedItemCardData["status"] = "Open";
  const apiStatus = getField(d, "status")?.toLowerCase();
  if (apiStatus === "active") status = "Open";
  else if (apiStatus === "closing soon") status = "Closing Soon";
  else if (apiStatus === "closed") status = "Closed";
  else if (apiStatus === "upcoming") status = "Upcoming";
  const title = getField(d, "title", "name") ?? "Untitled";
  const provider = getField(d, "provider", "organization", "department", "conductingBody", "examBody", "conducting_body", "exam_body") ?? "";
  const description = getField(d, "description") ?? "";
  const deadline = getField(d, "deadline", "applicationDeadline", "application_deadline", "application_end_date", "examDate", "exam_date", "applicationWindow", "application_window") ?? "";
  const applyUrl = getField(d, "apply_url", "official_url", "source_url");
  const typePath = item.item_type === "scheme" ? "schemes"
    : item.item_type === "scholarship" ? "scholarships"
    : item.item_type === "job" ? "jobs"
    : "exams";
  const detailUrl = `/${typePath}/${item.item_id}`;
  return {
    id: item.id,
    type: (item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)) as SavedItemCardData["type"],
    title,
    provider,
    description,
    deadline,
    status,
    applyUrl,
    detailUrl,
  };
}

export default function SavedPage() {
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: result, error, isLoading, mutate } = useSavedItems({ page, limit: 12 });

  const handleRemove = async (item: SavedItem) => {
    setRemovingId(item.id);
    try {
      await unsaveItem(item.item_id, item.item_type);
      mutate();
    } catch (err) {
      console.error("Failed to remove saved item:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const savedItems = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">BharatLens Library</p>
              <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">Saved Items</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">Review your saved schemes, scholarships, jobs, and exams in one place.</p>
            </div>
            <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#1A3C6E]">
              {isLoading ? "—" : `${savedItems.length} saved`}
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-red-50 p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-red-600">{error instanceof Error ? error.message : "Failed to load saved items"}</p>
            <button onClick={() => mutate()} className="mt-3 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700">Retry</button>
          </div>
        )}

        {!isLoading && !error && savedItems.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No saved items yet</p>
            <p className="mt-1 text-sm text-[#111827]/70">Save listings from BharatLens to access them quickly here.</p>
          </div>
        )}

        {!isLoading && !error && savedItems.length > 0 && (
          <>
            <div className="mt-8 grid gap-5 xl:grid-cols-2">
              {savedItems.map((item) => (
                <SavedItemCard
                  key={item.id}
                  item={toCardData(item)}
                  onRemove={() => handleRemove(item)}
                  removing={removingId === item.id}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-4">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2 text-[#1A3C6E] disabled:opacity-50 hover:bg-gray-50">← Previous</button>
                <span className="flex items-center px-4 text-[#111827]">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2 text-[#1A3C6E] disabled:opacity-50 hover:bg-gray-50">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
