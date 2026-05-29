"use client";

import { useMemo, useState } from "react";
import ExamCard from "@/components/cards/ExamCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import { getExams } from "@/lib/services/content";

export default function ExamsPage() {
  const exams = useMemo(() => getExams(), []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(exams.map((exam) => exam.category))],
    [exams]
  );

  const filteredExams = useMemo(
    () =>
      exams.filter((exam) => {
        const matchesSearch = `${exam.title} ${exam.description} ${exam.conductingBody}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory = category === "All" || exam.category === category;

        return matchesSearch && matchesCategory;
      }),
    [category, exams, search]
  );

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">BharatLens Listings</p>
          <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">Exams</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">
            Track important exam dates, application deadlines, and latest exam opportunities.
          </p>
        </div>

        <div className="mt-6">
          <ListingSearchFilter
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search exams by title, description, or conducting body"
            selectedFilter={category}
            onFilterChange={setCategory}
            filterLabel="Exam category"
            filterOptions={categories}
            resultCount={filteredExams.length}
          />
        </div>

        {filteredExams.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No exams found</p>
            <p className="mt-1 text-sm text-[#111827]/70">Try changing your search or category filter.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {filteredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
