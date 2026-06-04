"use client";

import { useEffect, useState } from "react";
import SavedItemCard from "@/components/cards/SavedItemCard";
import { fetchSavedItems, type SavedItem, unsaveItem } from "@/lib/api/content-api";

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchSavedItems({ page, limit: 12 });
        setSavedItems(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load saved items"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSavedItems();
  }, [page]);

  const handleRemove = async (item: SavedItem) => {
    setRemovingId(item.id);
    try {
      await unsaveItem(item.item_id, item.item_type);
      setSavedItems((prev) => prev.filter((savedItem) => savedItem.id !== item.id));
    } catch (error) {
      console.error("Failed to remove saved item:", error);
      setError(error instanceof Error ? error.message : "Unable to remove saved item");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">
                BharatLens Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">
                Saved Items
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">
                Review your saved schemes, scholarships, jobs, and exams in one place.
              </p>
            </div>
            <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#1A3C6E]">
              {savedItems.length} saved
            </span>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-red-50 p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-red-600">{error}</p>
          </div>
        ) : savedItems.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No saved items yet</p>
            <p className="mt-1 text-sm text-[#111827]/70">
              Save listings from BharatLens to access them quickly here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 xl:grid-cols-2">
              {savedItems.map((item) => {
                // Map API status to ListingStatus
                let status: "Open" | "Closing Soon" | "Closed" | "Upcoming" = "Open";
                if (
                  "item_data" in item &&
                  item.item_data &&
                  "status" in item.item_data
                ) {
                  const apiStatus = item.item_data.status?.toLowerCase();
                  if (apiStatus === "active") status = "Open";
                  else if (apiStatus === "closing soon") status = "Closing Soon";
                  else if (apiStatus === "closed") status = "Closed";
                  else if (apiStatus === "upcoming") status = "Upcoming";
                }

                return (
                  <SavedItemCard
                    key={item.id}
                    item={{
                      id: item.id,
                      title: item.item_data?.title || "Unknown",
                      description:
                        "item_data" in item && item.item_data
                          ? item.item_data.description || ""
                          : "",
                      deadline:
                        "item_data" in item && item.item_data && "deadline" in item.item_data
                          ? item.item_data.deadline || ""
                          : "",
                      status,
                      provider:
                        "item_data" in item && item.item_data && "provider" in item.item_data
                          ? item.item_data.provider || ""
                          : "",
                      type: item.item_type as "Scheme" | "Scholarship" | "Job" | "Exam",
                    }}
                    onRemove={() => handleRemove(item)}
                    removing={removingId === item.id}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2 text-[#1A3C6E] disabled:opacity-50 hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <span className="flex items-center px-4 text-[#111827]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2 text-[#1A3C6E] disabled:opacity-50 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
