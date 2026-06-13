"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BharatLensCard from "@/components/cards/BharatLensCard";
import { saveItem, unsaveItem } from "@/lib/api/content-api";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";
import { useJobs, useSavedItemsMap } from "@/hooks/useApi";
import { Search, X, Briefcase, BarChart3, Filter, ChevronDown, SlidersHorizontal, MapPin, BookOpen, Clock, FileText, Building2, Tag, GraduationCap, Users, MapPinned } from "lucide-react";
import { getCategoryCounts, normalizeSubType } from "@/utils/getCategoryCounts";

type JobTab = "all" | "apply_now" | "admit_card" | "result" | "notification";

const TABS: { key: JobTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "apply_now", label: "Apply Now" },
  { key: "admit_card", label: "Admit Card" },
  { key: "result", label: "Result" },
  { key: "notification", label: "Notifications" },
];

const TAB_EMPTY_STATES: Record<string, { title: string; icon: typeof Briefcase }> = {
  all: { title: "No jobs found", icon: Briefcase },
  apply_now: { title: "No open applications", icon: FileText },
  admit_card: { title: "No admit cards available", icon: BookOpen },
  result: { title: "No results declared", icon: BarChart3 },
  notification: { title: "No notifications", icon: Clock },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "deadline", label: "Deadline Soon" },
  { value: "title_asc", label: "Title A-Z" },
] as const;

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<JobTab>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Proper debounce with useEffect
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) setPage(1);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setShowStateDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (categoryFilter) params.category = categoryFilter;
    if (stateFilter) params.state = stateFilter;
    if (sortBy === "deadline") { params.sortBy = "deadline"; params.sortOrder = "asc"; }
    else if (sortBy === "title_asc") { params.sortBy = "title"; params.sortOrder = "asc"; }
    else { params.sortBy = "created_at"; params.sortOrder = "desc"; }
    return params;
  }, [page, debouncedSearch, activeTab, sortBy, categoryFilter, stateFilter]);

  const { data: result, error, isLoading } = useJobs(queryParams);
  const { savedMap, mutate: mutateSaved } = useSavedItemsMap("job");

  // ── Derived state — declared before useMemos that reference them ──
  const jobs = result?.items ?? [];
  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 1;

  // Compute stable counts from the full (unfiltered) items — never changes with tab switch
  const tabCounts = useMemo(() => {
    return getCategoryCounts(jobs, TABS.map((t) => t.key));
  }, [jobs]);

  // Extract unique categories and states from the result
  const uniqueCategories = useMemo(() => {
    if (!result?.items) return [];
    const cats = new Set<string>();
    result.items.forEach((j) => { if (j.category) cats.add(j.category); });
    return Array.from(cats).sort();
  }, [result?.items]);

  const uniqueStates = useMemo(() => {
    if (!result?.items) return [];
    const sts = new Set<string>();
    result.items.forEach((j) => { if (j.state) sts.add(j.state); });
    return Array.from(sts).sort();
  }, [result?.items]);

  const hasFilters = debouncedSearch || activeTab !== "all" || sortBy !== "newest" || categoryFilter || stateFilter;
  const displayJobs = activeTab === "all" ? jobs : jobs.filter((j) => normalizeSubType(j.sub_category) === activeTab);
  const EmptyIcon = TAB_EMPTY_STATES[activeTab]?.icon || Briefcase;

  const toggleSaved = async (jobId: string) => {
    setSavingMap((prev) => ({ ...prev, [jobId]: true }));
    try {
      const currentlySaved = Boolean(savedMap[jobId]);
      if (currentlySaved) await unsaveItem(jobId, "job");
      else await saveItem(jobId, "job");
      mutateSaved();
    } catch { /* ignore */ } finally {
      setSavingMap((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleTabChange = (tab: JobTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    setActiveTab("all");
    setSortBy("newest");
    setCategoryFilter("");
    setStateFilter("");
  };

  return (
    <section className="min-h-screen bg-[#F5F3EE]">
      {/* Compact Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A3C6E] via-[#1E4A8A] to-[#2D5A9E]">
        {/* Subtle decorative elements */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#3B82F6]/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#9BB6E5]/10 blur-3xl" />
        
        <div className="relative px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9BB6E5]">BharatLens</p>
                <h1 className="mt-1.5 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">Government Jobs</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[#C7D9FE] sm:text-base">
                  Verified job notifications, admit cards, results &amp; application links
                </p>
              </div>
              {/* Stats row inline */}
              {!isLoading && jobs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm ring-1 ring-white/10">
                    <Briefcase className="h-3.5 w-3.5" />
                    {total}
                  </span>
                  {activeTab === "all" && (
                    <>
                      {[
                        { key: "apply_now", label: "Apply", color: "bg-white/15 text-white" },
                        { key: "admit_card", label: "Admit", color: "bg-white/15 text-white" },
                        { key: "result", label: "Result", color: "bg-white/15 text-white" },
                        { key: "notification", label: "Notify", color: "bg-white/15 text-white" },
                      ].map((stat) => {
                        const count = jobs.filter((j) => normalizeSubType(j.sub_category) === stat.key).length;
                        return count > 0 ? (
                          <span key={stat.key} className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium ${stat.color} ring-1 ring-white/10`}>
                            {count} {stat.label}
                          </span>
                        ) : null;
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Pill-style Tabs with count badges */}
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-none -mx-4 px-4 sm:px-0 sm:mx-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                    : "bg-white text-gray-600 border border-[#E5E7EB] hover:border-[#9BB6E5] hover:text-[#1A3C6E] hover:shadow-sm"
                }`}
              >
                {tab.label}
                {count !== undefined && (
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs font-semibold px-1.5 ${
                    isActive ? "bg-white/20 text-white" : "bg-[#F0F5FA] text-[#1A3C6E]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <div className="ml-auto flex items-center sm:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                showFilters || hasFilters
                  ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                  : "bg-white text-gray-500 border border-[#E5E7EB]"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters - SaaS dashboard style */}
        <div className={`${showFilters ? "block" : "hidden sm:block"} mb-4`}>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
              {/* Search input with larger icon and focus ring */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs by title, organization, qualification..."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pl-11 pr-10 py-3 text-sm text-[#111827] outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20"
                />
                {search && (
                  <button 
                    onClick={() => { setSearch(""); setDebouncedSearch(""); searchInputRef.current?.focus(); }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-0.5 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category dropdown */}
              {uniqueCategories.length > 0 && (
                <div className="relative" ref={categoryRef}>
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-3 text-sm text-gray-600 outline-none transition-all duration-200 hover:border-[#D1D5DB] hover:bg-white min-w-[140px]"
                  >
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-left truncate">{categoryFilter || "Category"}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        onClick={() => { setCategoryFilter(""); setShowCategoryDropdown(false); setPage(1); }}
                        className={`w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F3EE] ${!categoryFilter ? "font-semibold text-[#1A3C6E]" : "text-gray-600"}`}
                      >
                        All Categories
                      </button>
                      {uniqueCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); setPage(1); }}
                          className={`w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F3EE] ${categoryFilter === cat ? "font-semibold text-[#1A3C6E] bg-[#F0F5FA]" : "text-gray-600"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* State dropdown */}
              {uniqueStates.length > 0 && (
                <div className="relative" ref={stateRef}>
                  <button
                    onClick={() => setShowStateDropdown(!showStateDropdown)}
                    className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-3 text-sm text-gray-600 outline-none transition-all duration-200 hover:border-[#D1D5DB] hover:bg-white min-w-[140px]"
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-left truncate">{stateFilter || "State"}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showStateDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showStateDropdown && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        onClick={() => { setStateFilter(""); setShowStateDropdown(false); setPage(1); }}
                        className={`w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F3EE] ${!stateFilter ? "font-semibold text-[#1A3C6E]" : "text-gray-600"}`}
                      >
                        All States
                      </button>
                      {uniqueStates.map((st) => (
                        <button
                          key={st}
                          onClick={() => { setStateFilter(st); setShowStateDropdown(false); setPage(1); }}
                          className={`w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F3EE] ${stateFilter === st ? "font-semibold text-[#1A3C6E] bg-[#F0F5FA]" : "text-gray-600"}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sort + Results count */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <select
                  id="job-sort"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-3 text-sm text-gray-600 outline-none transition-all duration-200 focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Results count badge */}
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EEF2FF] px-3 py-2 text-xs font-semibold text-[#1A3C6E] whitespace-nowrap">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {total} result{total === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} lines={3} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <X className="h-7 w-7 text-red-600" />
            </div>
            <p className="mt-4 text-lg font-semibold text-red-700">Failed to load jobs</p>
            <p className="mt-1.5 text-sm text-red-500">{error instanceof Error ? error.message : "Please try again."}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 sm:p-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F5F3EE]">
              <EmptyIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-[#1A3C6E]">
              {TAB_EMPTY_STATES[activeTab]?.title || "No jobs found"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              {hasFilters
                ? "We couldn't find any jobs matching your current filters. Try adjusting your search terms or clearing filters."
                : "Job listings will appear here once they are published and verified."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#1A3C6E] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3B82F6] hover:shadow-md active:scale-[0.97]"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {displayJobs.map((job) => {
                const sc = normalizeSubType(job.sub_category);
                const deadlineDate = job.deadline ? new Date(job.deadline) : null;
                const isExpiringSoon = Boolean(deadlineDate && deadlineDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && deadlineDate.getTime() > Date.now());

                const badgeConfig: Record<string, { label: string; gradient: string; dot: string }> = {
                  apply_now: { label: "Apply Now", gradient: "from-[#1A3C6E] to-[#2D5A9E]", dot: "bg-blue-400" },
                  admit_card: { label: "Admit Card", gradient: "from-[#1A3C6E] to-[#2D5A9E]", dot: "bg-blue-400" },
                  result: { label: "Result", gradient: "from-[#1A3C6E] to-[#2D5A9E]", dot: "bg-blue-400" },
                  notification: { label: "Notification", gradient: "from-[#1A3C6E] to-[#2D5A9E]", dot: "bg-blue-400" },
                };
                const bc = badgeConfig[sc] || { label: "Published", gradient: "from-[#1A3C6E] to-[#2D5A9E]", dot: "bg-blue-400" };

                const actionConfig: Record<string, { label: string; gradient: string }> = {
                  apply_now: { label: "Apply Now", gradient: "from-[#1A3C6E] to-[#2D5A9E] hover:from-[#2D5A9E] hover:to-[#3B82F6]" },
                  admit_card: { label: "Download Admit Card", gradient: "from-[#1A3C6E] to-[#2D5A9E] hover:from-[#2D5A9E] hover:to-[#3B82F6]" },
                  result: { label: "View Result", gradient: "from-[#1A3C6E] to-[#2D5A9E] hover:from-[#2D5A9E] hover:to-[#3B82F6]" },
                  notification: { label: "View Notification", gradient: "from-[#1A3C6E] to-[#2D5A9E] hover:from-[#2D5A9E] hover:to-[#3B82F6]" },
                };
                const ac = actionConfig[sc] || { label: "View Details", gradient: "from-[#1A3C6E] to-[#2D5A9E] hover:from-[#2D5A9E] hover:to-[#3B82F6]" };

                const metadata = [
                  { icon: <Building2 className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Organization:</span> {job.organization || "Official Authority"}</> },
                  { icon: <Tag className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Category:</span> {job.category || "General"}</> },
                ];
                if (job.state) metadata.push({ icon: <MapPinned className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">State:</span> {job.state}</> });
                if (job.qualification) metadata.push({ icon: <GraduationCap className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Qualification:</span> {job.qualification}</> });
                if (job.vacancies) metadata.push({ icon: <Users className="h-4 w-4" />, text: <><span className="font-medium text-gray-900">Vacancies:</span> {job.vacancies}</> });

                return (
                  <BharatLensCard
                    key={job.id}
                    detailHref={`/jobs/${job.id}`}
                    badge={{ label: bc.label, gradient: bc.gradient, dotColor: bc.dot }}
                    isOfficial={job.verification_status === "published"}
                    title={job.title || "Untitled"}
                    description={job.description || undefined}
                    metadata={metadata}
                    deadline={job.deadline || undefined}
                    isExpiringSoon={isExpiringSoon}
                    sourceUrl={job.source_url || undefined}
                    createdAt={job.created_at || undefined}
                    primaryAction={{
                      label: ac.label,
                      href: job.official_url || job.apply_url || undefined,
                      gradient: ac.gradient,
                    }}
                    isSaved={Boolean(savedMap[job.id])}
                    saving={Boolean(savingMap[job.id])}
                    onToggleSaved={() => toggleSaved(job.id)}
                  />
                );
              })}
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-[#9BB6E5] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Prev
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                          page === pageNum
                            ? "bg-gradient-to-br from-[#1A3C6E] to-[#2D5A9E] text-white shadow-md"
                            : "border border-[#E5E7EB] bg-white text-gray-600 hover:border-[#9BB6E5] hover:text-[#1A3C6E] hover:shadow-sm"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-[#9BB6E5] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
