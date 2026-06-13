"use client";

import { useRef, useState } from "react";
import BharatLensCard from "@/components/cards/BharatLensCard";
import ListingSearchFilter from "@/components/filters/ListingSearchFilter";
import { saveItem, unsaveItem } from "@/lib/api/content-api";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";
import { useScholarships, useSavedItemsMap } from "@/hooks/useApi";
import { Building2, Tag, IndianRupee, ShieldCheck, MapPin, FileText } from "lucide-react";

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
  const prevResultRef = useRef(result);
  if (result?.items && result !== prevResultRef.current) {
    prevResultRef.current = result;
    if (categories.length === 1 && result.items.length > 0) {
      const uniqueCategories = new Set(result.items.map((s) => s.category));
      setCategories(["All", ...Array.from(uniqueCategories)]);
    }
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
    } catch { /* ignore */ } finally {
      setSavingMap((prev) => ({ ...prev, [scholarshipId]: false }));
    }
  };

  const handleNextPage = () => {
    if (page < (result?.totalPages || 1)) setPage((p) => p + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const scholarships = result?.items ?? [];

  return (
    <section className="min-h-screen bg-[#F5F3EE]">
      {/* Blue Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A3C6E] via-[#1E4A8A] to-[#2D5A9E]">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#3B82F6]/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#9BB6E5]/10 blur-3xl" />
        
        <div className="relative px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9BB6E5]">BharatLens</p>
                <h1 className="mt-1.5 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">Scholarships</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[#C7D9FE] sm:text-base">
                  Find active scholarships by category, provider, and eligibility criteria.
                </p>
              </div>
              {/* Stats chip */}
              {!isLoading && scholarships.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm ring-1 ring-white/10">
                    <FileText className="h-3.5 w-3.5" />
                    {result?.total ?? 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mt-6 sm:mt-8">
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
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <p className="text-lg font-semibold text-red-700">{error instanceof Error ? error.message : "Failed to load scholarships."}</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#1A3C6E]">No scholarships found</p>
            <p className="mt-1 text-sm text-gray-500">Try changing your search or category filter.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {scholarships.map((scholarship) => {
                const metadata = [
                  { icon: <Building2 className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Provider:</span> {scholarship.provider || "Official Authority"}</> },
                  { icon: <Tag className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Category:</span> {scholarship.category || "General"}</> },
                  { icon: <IndianRupee className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Amount:</span> {scholarship.amount || "Not specified"}</> },
                  { icon: <ShieldCheck className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Eligibility:</span> {scholarship.eligibility || "Not specified"}</> },
                ];
                if (scholarship.state) metadata.push({ icon: <MapPin className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">State:</span> {scholarship.state}</> });

                return (
                  <BharatLensCard
                    key={scholarship.id}
                    detailHref={`/scholarships/${scholarship.id}`}
                    badge={{ label: "Scholarship", gradient: "from-[#1A3C6E] to-[#2D5A9E]", dotColor: "bg-blue-400" }}
                    title={scholarship.title || "Untitled"}
                    description={scholarship.description || undefined}
                    metadata={metadata}
                    deadline={scholarship.deadline || undefined}
                    sourceUrl={scholarship.source_url || undefined}
                    createdAt={scholarship.created_at || undefined}
                    primaryAction={{
                      label: "Apply Scholarship",
                      href: (scholarship.official_url || scholarship.apply_url) || undefined,
                      gradient: "from-[#1A3C6E] to-[#2D5A9E] hover:from-[#2D5A9E] hover:to-[#3B82F6]",
                    }}
                    isSaved={Boolean(savedMap[scholarship.id])}
                    saving={Boolean(savingMap[scholarship.id])}
                    onToggleSaved={() => toggleSaved(scholarship.id)}
                  />
                );
              })}
            </div>

            {(result?.totalPages ?? 1) > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button onClick={handlePreviousPage} disabled={page === 1} className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-[#F5F3EE] disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                <p className="px-2 text-sm font-medium text-gray-500">Page {page} of {result?.totalPages ?? 1}</p>
                <button onClick={handleNextPage} disabled={page === (result?.totalPages ?? 1)} className="min-h-[44px] rounded-xl bg-[#1A3C6E] px-4 text-sm font-semibold text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:bg-[#9BB6E5]">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
