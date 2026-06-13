"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  GraduationCap,
  Briefcase,
  CalendarDays,
  Sparkles,
  AlertCircle,
  Zap,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
  ChevronRight,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useRecommendations, useSavedItemsMap } from "@/hooks/useApi";
import { saveItem, unsaveItem } from "@/lib/api/content-api";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";

type FilterType = "all" | "scheme" | "scholarship" | "job" | "exam";

const FILTERS: { key: FilterType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "scheme", label: "Schemes", icon: FileText },
  { key: "scholarship", label: "Scholarships", icon: GraduationCap },
  { key: "job", label: "Jobs", icon: Briefcase },
  { key: "exam", label: "Exams", icon: CalendarDays },
];

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  scheme: { bg: "bg-blue-50", text: "text-blue-700" },
  scholarship: { bg: "bg-indigo-50", text: "text-indigo-700" },
  job: { bg: "bg-emerald-50", text: "text-emerald-700" },
  exam: { bg: "bg-purple-50", text: "text-purple-700" },
};

export default function RecommendationsPage() {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  const { data: result, error, isLoading, mutate } = useRecommendations({ page, limit: 12 });
  const { savedMap, mutate: mutateSaved } = useSavedItemsMap();

  const recommendations = result?.items ?? [];

  const toggleSaved = async (itemId: string, itemType: string) => {
    setSavingMap((prev) => ({ ...prev, [itemId]: true }));
    try {
      const currentlySaved = Boolean(savedMap[itemId]);
      if (currentlySaved) {
        await unsaveItem(itemId, itemType as "scheme" | "scholarship" | "job" | "exam");
      } else {
        await saveItem(itemId, itemType as "scheme" | "scholarship" | "job" | "exam");
      }
      mutateSaved();
    } catch (err) {
      console.error("Save toggle failed:", err);
    } finally {
      setSavingMap((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const filteredRecs = activeFilter === "all"
    ? recommendations
    : recommendations.filter((r) => r.item_type === activeFilter);

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return undefined;
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getItemData = (rec: typeof recommendations[0]) => {
    const data = rec.item_data as Record<string, unknown> | undefined;
    return {
      title: String(data?.title ?? rec.reason ?? "Untitled"),
      description: typeof data?.description === "string" ? data.description : undefined,
      deadline: typeof data?.deadline === "string" ? data.deadline :
                typeof data?.application_end_date === "string" ? data.application_end_date :
                typeof data?.applicationDeadline === "string" ? data.applicationDeadline : undefined,
      state: typeof data?.state === "string" ? data.state : undefined,
      category: typeof data?.category === "string" ? data.category : undefined,
      applyUrl: typeof data?.apply_url === "string" ? data.apply_url :
                typeof data?.official_url === "string" ? data.official_url : undefined,
    };
  };

  return (
    <main className="min-h-screen w-full bg-[#F5F3EE]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ─── Header ──────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3C6E] to-[#2D5A9E] px-6 py-8 shadow-lg shadow-[#1A3C6E]/10 sm:px-10 sm:py-10">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#3B82F6]/20 blur-3xl" />
          <div className="absolute -bottom-12 left-12 h-32 w-32 rounded-full bg-[#9BB6E5]/15 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">
              <Sparkles size={14} />
              Personalized for you
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              Recommended for You
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              Opportunities matched with your profile, eligibility, and interests.
            </p>
          </div>
        </section>

        {/* ─── Error State ─────────────────────────────── */}
        {error && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <p className="text-sm text-red-700">
                {error instanceof Error ? error.message : "Failed to load recommendations"}
              </p>
              <button
                onClick={() => mutate()}
                className="ml-auto shrink-0 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
              >
                <RefreshCw size={14} className="inline-block mr-1" />
                Retry
              </button>
            </div>
          </section>
        )}

        {/* ─── Filter Tabs ─────────────────────────────── */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => { setActiveFilter(filter.key); setPage(1); }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1A3C6E] text-white shadow-md"
                    : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#9BB6E5] hover:text-[#1A3C6E]"
                }`}
              >
                <Icon size={14} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* ─── Loading Skeleton ────────────────────────── */}
        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} lines={3} />
            ))}
          </div>
        ) : filteredRecs.length === 0 ? (
          /* ─── Empty State ───────────────────────────── */
          <section className="mt-8 overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white/60 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F3EE]">
              <Zap size={24} className="text-[#1A3C6E]/40" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#111827]">
              No matching opportunities found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              {activeFilter !== "all"
                ? `No recommendations available for ${FILTERS.find(f => f.key === activeFilter)?.label || activeFilter}. Try another category.`
                : "We couldn't find any schemes, scholarships, jobs, or exams matching your profile. Complete your profile and check back later."}
            </p>
            <Link
              href="/profile/setup"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1A3C6E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3B82F6] transition"
            >
              Complete Profile <ArrowRight size={14} />
            </Link>
          </section>
        ) : (
          <>
            {/* ─── Recommendations Grid ────────────────── */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRecs.map((rec) => {
                const isSaved = Boolean(savedMap[rec.item_id]);
                const isSaving = Boolean(savingMap[rec.item_id]);
                const { title, description, deadline, state, category, applyUrl } = getItemData(rec);
                const detailHref = `/${rec.item_type}s/${rec.item_id}`;
                const badge = BADGE_STYLES[rec.item_type] || { bg: "bg-gray-50", text: "text-gray-700" };

                return (
                  <div
                    key={rec.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-300 hover:border-[#9BB6E5] hover:shadow-[0_8px_30px_rgba(26,60,110,0.12)] hover:-translate-y-0.5"
                  >
                    {/* Gradient accent top bar */}
                    <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#1A3C6E] to-[#3B82F6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <Link href={detailHref} className="flex flex-1 flex-col p-5" prefetch={false}>
                      {/* Type Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                          {rec.item_type.charAt(0).toUpperCase() + rec.item_type.slice(1)}
                        </span>
                        {state && (
                          <span className="text-[10px] text-[#6B7280] truncate">{state}</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-[#111827] group-hover:text-[#1A3C6E] transition-colors duration-200">
                        {title}
                      </h3>

                      {/* Reason */}
                      {rec.reason && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6B7280]">
                          {rec.reason}
                        </p>
                      )}

                      {/* Description */}
                      {description && !rec.reason && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6B7280]">
                          {description}
                        </p>
                      )}

                      {/* Category */}
                      {category && (
                        <p className="mt-2 text-[11px] text-[#9CA3AF]">
                          {category}
                        </p>
                      )}

                      {/* Spacer */}
                      <div className="flex-1 min-h-3" />

                      {/* Deadline */}
                      {deadline && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B7280]">
                          <CalendarDays size={12} className="shrink-0" />
                          <span>Deadline: {formatDate(deadline)}</span>
                        </div>
                      )}
                    </Link>

                    {/* Actions divider */}
                    <div className="border-t border-[#E5E7EB]" />

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 p-3 pt-2.5">
                      {/* View Details */}
                      <Link
                        href={detailHref}
                        prefetch={false}
                        className="flex-1 rounded-lg bg-[#F5F3EE] px-3 py-2 text-center text-[11px] font-semibold text-[#1A3C6E] transition hover:bg-[#E5E7EB]"
                      >
                        View Details
                      </Link>

                      {/* Apply button */}
                      {applyUrl && (
                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center rounded-lg bg-[#1A3C6E] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#3B82F6]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Apply <ExternalLink size={10} className="ml-1" />
                        </a>
                      )}

                      {/* Save button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSaved(rec.item_id, rec.item_type);
                        }}
                        disabled={isSaving}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                          isSaved
                            ? "border-[#3B82F6]/30 bg-[#EFF6FF] text-[#1E40AF]"
                            : "border-[#E5E7EB] text-[#6B7280] hover:border-[#9BB6E5] hover:text-[#1A3C6E]"
                        } disabled:opacity-50`}
                        aria-label={isSaved ? "Unsave item" : "Save item"}
                      >
                        {isSaving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isSaved ? (
                          <BookmarkCheck size={12} />
                        ) : (
                          <Bookmark size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Pagination ───────────────────────────── */}
            {(result?.totalPages ?? 1) > 1 && (
              <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#F5F3EE] px-4 py-2 text-xs font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-40"
                >
                  <ChevronRight size={14} className="rotate-180" />
                  Previous
                </button>
                <p className="text-xs text-[#6B7280]">
                  Page {page} of {result?.totalPages ?? 1}
                </p>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page === (result?.totalPages ?? 1)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#F5F3EE] px-4 py-2 text-xs font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
