"use client";

import { useMemo, useState, useEffect } from "react";
import JobCard from "@/components/cards/JobCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import * as jobsApi from "@/lib/api/jobs";

export default function JobsPage() {
  const [jobs, setJobs] = useState<jobsApi.Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");

  // Fetch jobs on mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);
        const data = await jobsApi.getJobs();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const locations = useMemo(
    () => ["All", ...new Set(jobs.map((job) => job.location || job.state || "Unknown"))],
    [jobs]
  );

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesSearch = `${job.title} ${job.description} ${job.qualification} ${job.department}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesLocation = location === "All" || job.location === location || job.state === location;

        return matchesSearch && matchesLocation;
      }),
    [jobs, location, search]
  );

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

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6">
              <ListingSearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search jobs by title, department, or qualification"
                selectedFilter={location}
                onFilterChange={setLocation}
                filterLabel="Job location"
                filterOptions={locations}
                resultCount={filteredJobs.length}
              />
            </div>

            {filteredJobs.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
                <p className="text-lg font-semibold text-[#1A3C6E]">No jobs found</p>
                <p className="mt-1 text-sm text-[#111827]/70">Try changing your search or location filter.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 xl:grid-cols-2">
                {filteredJobs.map((job: any) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
