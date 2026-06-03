"use client";

import { useMemo, useState, useEffect } from "react";
import ScholarshipCard from "@/components/cards/ScholarshipCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import * as scholarshipsApi from "@/lib/api/scholarships";

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<scholarshipsApi.Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Fetch scholarships on mount
  useEffect(() => {
    async function fetchScholarships() {
      try {
        setLoading(true);
        setError(null);
        const data = await scholarshipsApi.getScholarships();
        setScholarships(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch scholarships");
        setScholarships([]);
      } finally {
        setLoading(false);
      }
    }

    fetchScholarships();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(scholarships.map((scholarship) => scholarship.category))],
    [scholarships]
  );

  const filteredScholarships = useMemo(
    () =>
      scholarships.filter((scholarship) => {
        const matchesSearch = `${scholarship.title} ${scholarship.description} ${scholarship.eligibility}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory = category === "All" || scholarship.category === category;

        return matchesSearch && matchesCategory;
      }),
    [category, scholarships, search]
  );

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
                searchPlaceholder="Search scholarships by title, details, or eligibility"
                selectedFilter={category}
                onFilterChange={setCategory}
                filterLabel="Scholarship category"
                filterOptions={categories}
                resultCount={filteredScholarships.length}
              />
            </div>

            {filteredScholarships.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
                <p className="text-lg font-semibold text-[#1A3C6E]">No scholarships found</p>
                <p className="mt-1 text-sm text-[#111827]/70">Try changing your search or category filter.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 xl:grid-cols-2">
                {filteredScholarships.map((scholarship: any) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
