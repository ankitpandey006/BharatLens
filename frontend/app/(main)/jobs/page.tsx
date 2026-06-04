"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/cards/JobCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import { fetchJobs, fetchSavedItems, saveItem, unsaveItem } from "@/lib/api/content-api";
import type { Job } from "@/lib/api/content-api";

interface JobsPageState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
}

export default function JobsPage() {
  const [state, setState] = useState<JobsPageState>({
    jobs: [],
    loading: true,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [locations, setLocations] = useState<string[]>(["All"]);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadJobs() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const params: Record<string, unknown> = {
          page: state.page,
          limit: 12,
        };

        if (search) params.search = search;
        if (location && location !== "All") params.state = location;

        const result = await fetchJobs(params);

        setState((prev) => ({
          ...prev,
          jobs: result.items,
          totalPages: result.totalPages,
          total: result.total,
          loading: false,
        }));

        // Extract unique locations from results
        if (result.items.length > 0 && locations.length === 1) {
          const uniqueLocations = new Set(
            result.items
              .map((j) => j.location)
              .filter((l): l is string => Boolean(l))
          );
          setLocations(["All", ...Array.from(uniqueLocations)]);
        }
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load jobs. Please try again.",
        }));
      }
    }

    loadJobs();
  }, [search, location, state.page, locations.length]);

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedResult = await fetchSavedItems({ limit: 200 });
        const map = savedResult.items.reduce<Record<string, boolean>>((acc, item) => {
          if (item.item_type === "job") {
            acc[item.item_id] = true;
          }
          return acc;
        }, {});
        setSavedMap(map);
      } catch (error) {
        console.error("Unable to load saved job state:", error);
      }
    };

    loadSavedState();
  }, []);

  const toggleSaved = async (jobId: string) => {
    setSavingMap((prev) => ({ ...prev, [jobId]: true }));
    try {
      const currentlySaved = Boolean(savedMap[jobId]);
      if (currentlySaved) {
        await unsaveItem(jobId, "job");
        setSavedMap((prev) => ({ ...prev, [jobId]: false }));
      } else {
        await saveItem(jobId, "job");
        setSavedMap((prev) => ({ ...prev, [jobId]: true }));
      }
    } catch (error) {
      console.error("Save toggle failed:", error);
    } finally {
      setSavingMap((prev) => ({ ...prev, [jobId]: false }));
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
          <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">Jobs</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">
            Explore public sector jobs by location, qualification, and application timeline.
          </p>
        </div>

        <div className="mt-6">
          <ListingSearchFilter
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search jobs by title, organization, or qualification"
            selectedFilter={location}
            onFilterChange={setLocation}
            filterLabel="Job location"
            filterOptions={locations}
            resultCount={state.total}
          />
        </div>

        {state.loading ? (
          <div className="mt-8 text-center">
            <div className="inline-block">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9BB6E5] border-t-[#1A3C6E]" />
            </div>
            <p className="mt-3 text-sm font-medium text-[#1A3C6E]">Loading jobs...</p>
          </div>
        ) : state.error ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">{state.error}</p>
          </div>
        ) : state.jobs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No jobs found</p>
            <p className="mt-1 text-sm text-[#111827]/70">Try changing your search or location filter.</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 xl:grid-cols-2">
              {state.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={Boolean(savedMap[job.id])}
                  saving={Boolean(savingMap[job.id])}
                  onToggleSaved={() => toggleSaved(job.id)}
                />
              ))}
            </div>

            {state.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={state.page === 1}
                  className="rounded-2xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-[#F5F3EE] disabled:text-[#9CA3AF]"
                >
                  Previous
                </button>
                <p className="text-sm font-medium text-[#111827]/70">
                  Page {state.page} of {state.totalPages}
                </p>
                <button
                  onClick={handleNextPage}
                  disabled={state.page === state.totalPages}
                  className="rounded-2xl bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:bg-[#9BB6E5]"
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
