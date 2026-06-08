"use client";

import { useEffect, useState } from "react";
import SchemeCard from "@/components/cards/SchemeCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import { fetchSavedItems, fetchSchemes, saveItem, unsaveItem } from "@/lib/api/content-api";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";
import type { Scheme } from "@/lib/api/content-api";

interface SchemesPageState {
  schemes: Scheme[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
}

export default function SchemesPage() {
  const [state, setState] = useState<SchemesPageState>({
    schemes: [],
    loading: true,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadSchemes() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const params: Record<string, unknown> = {
          page: state.page,
          limit: 12,
        };

        if (search) params.search = search;
        if (category && category !== "All") params.category = category;

        const result = await fetchSchemes(params);

        setState((prev) => ({
          ...prev,
          schemes: result.items,
          totalPages: result.totalPages,
          total: result.total,
          loading: false,
        }));

        // Extract unique categories from results
        if (result.items.length > 0 && categories.length === 1) {
          const uniqueCategories = new Set(result.items.map((s) => s.category));
          setCategories(["All", ...Array.from(uniqueCategories)]);
        }
      } catch (error) {
        console.error("Failed to load schemes:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load schemes. Please try again.",
        }));
      }
    }

    loadSchemes();
  }, [search, category, state.page, categories.length]);

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedResult = await fetchSavedItems({ limit: 200 });
        const map = savedResult.items.reduce<Record<string, boolean>>((acc, item) => {
          if (item.item_type === "scheme") {
            acc[item.item_id] = true;
          }
          return acc;
        }, {});
        setSavedMap(map);
      } catch (error) {
        console.error("Unable to load saved scheme state:", error);
      }
    };

    loadSavedState();
  }, []);

  const toggleSaved = async (schemeId: string) => {
    setSavingMap((prev) => ({ ...prev, [schemeId]: true }));
    try {
      const currentlySaved = Boolean(savedMap[schemeId]);
      if (currentlySaved) {
        await unsaveItem(schemeId, "scheme");
        setSavedMap((prev) => ({ ...prev, [schemeId]: false }));
      } else {
        await saveItem(schemeId, "scheme");
        setSavedMap((prev) => ({ ...prev, [schemeId]: true }));
      }
    } catch (error) {
      console.error("Save toggle failed:", error);
    } finally {
      setSavingMap((prev) => ({ ...prev, [schemeId]: false }));
    }
  };

  const handleNextPage = () => {
    if (state.page < state.totalPages) {
      setState((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePreviousPage = () => {
    if (state.page > 1) {
      setState((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">BharatLens Listings</p>
          <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">Schemes</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">
            Discover government schemes aligned with your profile, eligibility, and timeline.
          </p>
        </div>

        <div className="mt-6">
          <ListingSearchFilter
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search schemes by title, details, or eligibility"
            selectedFilter={category}
            onFilterChange={setCategory}
            filterLabel="Scheme category"
            filterOptions={categories}
            resultCount={state.total}
          />
        </div>

        {state.loading ? (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : state.error ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">{state.error}</p>
          </div>
        ) : state.schemes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No schemes found</p>
            <p className="mt-1 text-sm text-[#111827]/70">Try changing your search or category filter.</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 xl:grid-cols-2">
              {state.schemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  isSaved={Boolean(savedMap[scheme.id])}
                  saving={Boolean(savingMap[scheme.id])}
                  onToggleSaved={() => toggleSaved(scheme.id)}
                />
              ))}
            </div>

            {state.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={state.page === 1}
                  className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F5F3EE] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
                >
                  Previous
                </button>
                <p className="px-2 text-sm font-medium text-[#111827]/70">
                  Page {state.page} of {state.totalPages}
                </p>
                <button
                  onClick={handleNextPage}
                  disabled={state.page === state.totalPages}
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