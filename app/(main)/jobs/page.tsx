"use client";

import { useMemo, useState } from "react";
import JobCard from "@/components/cards/JobCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import { getJobs } from "@/lib/services/content";

export default function JobsPage() {
  const jobs = useMemo(() => getJobs(), []);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");

  const locations = useMemo(
    () => ["All", ...new Set(jobs.map((job) => job.location))],
    [jobs]
  );

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesSearch = `${job.title} ${job.description} ${job.qualification} ${job.organization}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesLocation = location === "All" || job.location === location;

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

        <div className="mt-6">
          <ListingSearchFilter
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search jobs by title, organization, or qualification"
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
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
