"use client";

import { useState } from "react";
import ScholarshipCard from "@/components/cards/ScholarshipCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import { saveItem, unsaveItem } from "@/lib/api/content-api";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";
import { useScholarships, useSavedItemsMap } from "@/hooks/useApi";

export default function ScholarshipsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  const { data: result, error, isLoading } = useScholarships({
    page,
    limit: 12,
    ...(search ? { search } : {}),
    ...(category && category !== "All" ? { category } : {}),
  });

  const { savedMap, mutate: mutateSaved } = useSavedItemsMap("scholarship");

  // Extract unique categories from results
  if (result?.items && categories.length === 1 && result.items.length > 0) {
    const uniqueCategories = new Set(result.items.map((s) => s.category));
    setCategories(["All", ...Array.from(uniqueCategories)]);
  }

  const toggleSaved = async (scholarshipId: string) => {
    setSavingMap((prev) => ({ ...prev, [scholarshipId]: true }));
    try {
      const currentlySaved = Boolean(savedMap[scholarshipId]);
      if (currentlySaved) {
        await unsaveItem(scholarshipId, "scholarship");
      } else {
        await saveItem(scholarshipId, "scholarship");
      }
      mutateSaved();
    } catch (error) {
      console.error("Save toggle failed:", error);
    } finally {
      setSavingMap((prev) => ({ ...prev, [scholarshipId]: false }));
    }
  };

  const handleNextPage = () => {
    if (page < (result?.totalPages || 1)) {
      setPage((p) => p + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const scholarships = result?.items ?? [];

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">BharatLens Listings</p>
          <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">Scholarships</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">
            Find active scholarships by category, provider, and eligibility criteria.
          </p>
        </div>

        <div className="mt-6">
          <ListingSearchFilter
            searchValue={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search scholarships by title, details, or eligibility"
            selectedFilter={category}
            onFilterChange={(val) => { setCategory(val); setPage(1); }}
            filterLabel="Scholarship category"
            filterOptions={categories}
            resultCount={result?.total ?? 0}
          />
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">
              {error instanceof Error ? error.message : "Failed to load scholarships. Please try again."}
            </p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No scholarships found</p>
            <p className="mt-1 text-sm text-[#111827]/70">Try changing your search or category filter.</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 xl:grid-cols-2">
              {scholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  isSaved={Boolean(savedMap[scholarship.id])}
                  saving={Boolean(savingMap[scholarship.id])}
                  onToggleSaved={() => toggleSaved(scholarship.id)}
                />
              ))}
            </div>

            {(result?.totalPages ?? 1) > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F5F3EE] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
                >
                  Previous
                </button>
                <p className="px-2 text-sm font-medium text-[#111827]/70">
                  Page {page} of {result?.totalPages ?? 1}
                </p>
                <button
                  onClick={handleNextPage}
                  disabled={page === (result?.totalPages ?? 1)}
                  className="min-h-[44px] rounded-xl bg-[#1A3C6E] px-4 text-sm font-semibold text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:bg-[#9BB6E5] sm:px-6"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
