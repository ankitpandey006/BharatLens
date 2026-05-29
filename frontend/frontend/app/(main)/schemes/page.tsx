"use client";

import { useMemo, useState } from "react";
import SchemeCard from "@/components/cards/SchemeCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import { getSchemes } from "@/lib/services/content";

export default function SchemesPage() {
  const schemes = useMemo(() => getSchemes(), []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(schemes.map((scheme) => scheme.category))],
    [schemes]
  );

  const filteredSchemes = useMemo(
    () =>
      schemes.filter((scheme) => {
        const matchesSearch = `${scheme.title} ${scheme.description} ${scheme.eligibility}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory = category === "All" || scheme.category === category;

        return matchesSearch && matchesCategory;
      }),
    [category, schemes, search]
  );

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
            resultCount={filteredSchemes.length}
          />
        </div>

        {filteredSchemes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No schemes found</p>
            <p className="mt-1 text-sm text-[#111827]/70">Try changing your search or category filter.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {filteredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}