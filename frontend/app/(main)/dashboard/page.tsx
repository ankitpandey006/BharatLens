"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Bot,
  Briefcase,
  CalendarDays,
  FileText,
  GraduationCap,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Zap,
  CheckCircle2,
  ArrowRight,
  BookmarkCheck,
  Loader2,
  ExternalLink,
  RefreshCw,
  CheckCheck,
} from "lucide-react";
import { useDashboardSummary } from "@/hooks/useApi";
import { saveItem, unsaveItem, markNotificationRead, markAllNotificationsRead } from "@/lib/api/content-api";
import DashboardSkeleton from "@/components/ui/skeletons/DashboardSkeleton";

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  action?: { label: string; href: string; onClick?: () => void };
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white/60 px-4 py-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3EE]">
        <Icon size={20} className="text-[#1A3C6E]/50" />
      </div>
      <p className="mx-auto mt-3 max-w-full text-sm font-semibold text-[#111827]">{title}</p>
      <p className="mx-auto mt-1 max-w-full text-xs leading-5 text-[#111827]/50">{description}</p>
      {action && (
        <Link
          href={action.href}
          onClick={action.onClick}
          className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#3B82F6] hover:text-[#1A3C6E]"
        >
          {action.label} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: summary, error, isLoading, mutate } = useDashboardSummary();
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const handleToggleSaved = useCallback(async (itemId: string, itemType: string, isCurrentlySaved: boolean) => {
    setSavingItem(itemId);
    try {
      if (isCurrentlySaved) {
        await unsaveItem(itemId, itemType as "scheme" | "scholarship" | "job" | "exam");
      } else {
        await saveItem(itemId, itemType as "scheme" | "scholarship" | "job" | "exam");
      }
      await mutate(); // Refresh dashboard
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSavingItem(null);
    }
  }, [mutate]);

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAllRead(true);
    try {
      await markAllNotificationsRead();
      await mutate();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      setMarkingAllRead(false);
    }
  }, [mutate]);

  const handleMarkRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      await mutate();
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }, [mutate]);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <main className="min-h-screen bg-[#F5F3EE]">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-sm font-medium text-red-700">Unable to load dashboard data</p>
            <button
              onClick={() => mutate()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!summary) return <DashboardSkeleton />;

  const { counts, profile, recommendations, notificationsList, todayUpdates, savedItems } = summary;

  const statCards = [
    { label: "Schemes", value: counts.schemes, icon: FileText, href: "/schemes" },
    { label: "Scholarships", value: counts.scholarships, icon: GraduationCap, href: "/scholarships" },
    { label: "Jobs", value: counts.jobs, icon: Briefcase, href: "/jobs" },
    { label: "Exams", value: counts.exams, icon: CalendarDays, href: "/exams" },
  ];

  // Check if the current user has saved an item (for showing saved state)
  const savedItemIds = new Set(savedItems?.map((s) => `${s.itemType}:${s.itemId}`) ?? []);

  return (
    <main className="min-h-screen w-full bg-[#F5F3EE]">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* ─── Hero Banner ──────────────────────────────── */}
        <section className="relative w-full overflow-hidden rounded-3xl bg-[#1A3C6E] shadow-lg shadow-[#1A3C6E]/10 lg:rounded-4xl">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#3B82F6]/20 blur-3xl" />
          <div className="absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-[#9BB6E5]/20 blur-3xl" />

          <div className="relative z-10 grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.4fr_0.7fr] lg:items-center lg:p-10">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/15 sm:text-xs">
                <Sparkles size={13} />
                AI-powered dashboard
              </div>
              <h1 className="mt-4 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                Your personalized workspace
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                Track schemes, scholarships, jobs, exams, and AI recommendations tailored for your profile.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={profile.completed ? "/profile" : "/profile/setup"}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1A3C6E] shadow-sm sm:flex-none sm:text-sm"
                >
                  {profile.completed ? (
                    <><CheckCircle2 size={15} />Profile Complete</>
                  ) : (
                    <>Complete Profile ({profile.completionPercent}%)</>
                  )}
                </Link>
                <Link
                  href="/chatbot"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white sm:flex-none sm:text-sm"
                >
                  <Bot size={15} />
                  Ask AI
                </Link>
              </div>
            </div>
            <div className="w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-white/85">
                  {profile.completed ? "Profile Complete" : "Profile Strength"}
                </p>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white">
                  {profile.completionPercent}%
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/15">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#9BB6E5] to-[#3B82F6]"
                  style={{ width: `${profile.completionPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-white/65">
                {profile.completed
                  ? "✓ Your profile is complete. You'll get the best AI recommendations!"
                  : `Complete your profile (${profile.completionPercent}%) for personalized recommendations.`}
              </p>
            </div>
          </div>
        </section>

        {/* ─── Profile Incomplete Alert ─────────────────── */}
        {!profile.completed && profile.missingFields.length > 0 && (
          <section className="mt-4 overflow-hidden rounded-2xl border border-[#3B82F6]/20 bg-[#EEF2FF] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#1A3C6E]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1A3C6E]">Profile incomplete</p>
                <p className="mt-1 text-xs leading-5 text-[#1A3C6E]/80">
                  Complete remaining {profile.missingFields.length} field{profile.missingFields.length !== 1 ? "s" : ""} for better recommendations.
                </p>
              </div>
              <Link
                href="/profile/setup"
                className="shrink-0 rounded-full bg-[#1A3C6E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3B82F6]"
              >
                Complete
              </Link>
            </div>
          </section>
        )}

        {/* ─── Stats Grid ───────────────────────────────── */}
        <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className="group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EE]">
                    <Icon size={19} className="text-[#3B82F6]" />
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-[#111827]/25" />
                </div>
                <p className="mt-3 text-xl font-bold text-[#1A3C6E] sm:text-2xl">{item.value.toLocaleString()}</p>
                <p className="mt-1 truncate text-xs font-medium text-[#111827]/60">{item.label}</p>
              </Link>
            );
          })}
        </section>

        {/* ─── Main Content Grid ────────────────────────── */}
        <section className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="grid gap-4 sm:gap-6">
            {/* ── Top Recommendations ──────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <Zap size={18} className="shrink-0 text-[#1A3C6E]" />
                  <h2 className="truncate text-base font-bold text-[#111827] sm:text-lg">Top Recommendations for You</h2>
                </div>
                {recommendations.length > 0 && (
                  <Link href="/recommendations" className="shrink-0 text-xs font-semibold text-[#3B82F6] hover:text-[#1A3C6E]">
                    View all
                  </Link>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.slice(0, 3).map((rec) => {
                    const isSaved = savedItemIds.has(`${rec.itemType}:${rec.itemId}`);
                    const isSaving = savingItem === rec.itemId;
                    const detailHref =
                      rec.itemType === "scheme" ? `/schemes/${rec.itemId}` :
                      rec.itemType === "scholarship" ? `/scholarships/${rec.itemId}` :
                      rec.itemType === "job" ? `/jobs/${rec.itemId}` :
                      rec.itemType === "exam" ? `/exams/${rec.itemId}` : "#";

                    return (
                      <Link
                        key={rec.id}
                        href={detailHref}
                        className="group block overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F5F3EE] p-4 transition hover:border-[#9BB6E5] hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#1A3C6E] shadow-sm">
                                {rec.tag}
                              </span>
                              {rec.state && (
                                <span className="text-[10px] text-[#6B7280]">{rec.state}</span>
                              )}
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-[#111827] group-hover:text-[#1A3C6E]">
                              {rec.title}
                            </p>
                            {rec.deadline && (
                              <p className="mt-0.5 text-xs text-[#6B7280]">
                                Deadline: {new Date(rec.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                            {rec.reason && (
                              <p className="mt-1 line-clamp-1 text-[10px] text-[#111827]/50">{rec.reason}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleSaved(rec.itemId, rec.itemType, isSaved);
                              }}
                              disabled={isSaving}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#6B7280] shadow-sm transition hover:text-[#1A3C6E] disabled:opacity-50"
                              aria-label={isSaved ? "Unsave item" : "Save item"}
                            >
                              {isSaving ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : isSaved ? (
                                <BookmarkCheck size={14} className="text-[#1A3C6E]" />
                              ) : (
                                <Bookmark size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={Zap}
                    title="No matching opportunities found"
                    description={
                      profile.completed
                        ? "We couldn't find any schemes, scholarships, jobs, or exams matching your profile. Check back later for new opportunities."
                        : "Complete your profile to get personalized recommendations."
                    }
                    action={
                      !profile.completed
                        ? { label: "Complete Profile", href: "/profile/setup" }
                        : undefined
                    }
                  />
                )}
              </div>
            </div>

            {/* ── Recent Updates ────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 overflow-hidden">
                <CalendarDays size={18} className="shrink-0 text-[#1A3C6E]" />
                <h2 className="truncate text-base font-bold text-[#111827] sm:text-lg">Recent Updates</h2>
              </div>
              <div className="mt-4 space-y-2">
                {todayUpdates.length > 0 ? (
                  todayUpdates.map((update, i) => {
                    // Map badge types to correct colors
                    const badgeClass =
                      update.type === "Scheme" ? "bg-blue-50 text-blue-700" :
                      update.type === "Scholarship" ? "bg-indigo-50 text-indigo-700" :
                      update.type === "Job" ? "bg-emerald-50 text-emerald-700" :
                      update.type === "Exam" ? "bg-purple-50 text-purple-700" :
                      update.type === "Result" ? "bg-amber-50 text-amber-700" :
                      update.type === "Admit Card" ? "bg-orange-50 text-orange-700" :
                      update.type === "Answer Key" ? "bg-violet-50 text-violet-700" :
                      "bg-gray-50 text-gray-700";

                    // Determine detail page link from itemType/itemId
                    const updateItemType = update.itemType;
                    const updateItemId = update.itemId;
                    const updateHref = updateItemId ? (
                      updateItemType === "scheme" ? `/schemes/${updateItemId}` :
                      updateItemType === "scholarship" ? `/scholarships/${updateItemId}` :
                      updateItemType === "job" ? `/jobs/${updateItemId}` :
                      updateItemType === "exam" ? `/exams/${updateItemId}` :
                      null
                    ) : null;

                    const content = (
                      <>
                        <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${badgeClass}`}>
                          {update.type}
                        </span>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-[#111827]">{update.title}</p>
                          <p className="truncate text-xs text-[#111827]/50">{update.description}</p>
                        </div>
                      </>
                    );

                    return updateHref ? (
                      <Link
                        key={`${update.type}-${update.id || i}`}
                        href={updateHref}
                        className="flex items-start gap-3 overflow-hidden rounded-xl border border-[#E5E7EB] p-3 transition hover:border-[#9BB6E5] hover:shadow-sm"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        key={`${update.type}-${update.id || i}`}
                        className="flex items-start gap-3 overflow-hidden rounded-xl border border-[#E5E7EB] p-3"
                      >
                        {content}
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={CalendarDays}
                    title="No recent updates"
                    description="New opportunities will appear here as they are added."
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="grid gap-4 lg:block lg:space-y-5">
            {/* ── Notifications ─────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <Bell size={18} className="shrink-0 text-[#1A3C6E]" />
                  <h2 className="truncate text-base font-bold text-[#111827]">Notifications</h2>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {notificationsList.some((n) => !n.is_read) && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={markingAllRead}
                      className="flex items-center gap-1 rounded-full bg-[#F5F3EE] px-2 py-1 text-[10px] font-semibold text-[#6B7280] hover:bg-[#E5E7EB] disabled:opacity-50"
                    >
                      {markingAllRead ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <CheckCheck size={10} />
                      )}
                      Mark all read
                    </button>
                  )}
                  {counts.notifications > 3 && (
                    <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-bold text-[#3B82F6]">
                      {counts.notifications}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {notificationsList.length > 0 ? (
                  notificationsList.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className={`relative overflow-hidden rounded-xl p-3 text-sm leading-5 transition ${
                        n.is_read
                          ? "bg-white text-[#111827]/60"
                          : "bg-[#F5F3EE] text-[#111827]/80 cursor-pointer hover:bg-[#EEF2FF]"
                      }`}
                      onClick={() => !n.is_read && handleMarkRead(n.id)}
                      role={n.is_read ? undefined : "button"}
                      tabIndex={n.is_read ? undefined : 0}
                      onKeyDown={(e) => {
                        if (!n.is_read && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          handleMarkRead(n.id);
                        }
                      }}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B82F6]" />
                      )}
                      <p className="ml-1">{n.message}</p>
                      {n.created_at && (
                        <p className="mt-1 ml-1 text-[10px] text-[#111827]/40">
                          {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Bell}
                    title="No notifications"
                    description="Updates about your opportunities will appear here."
                  />
                )}
              </div>
            </div>

            {/* ── AI Assistant CTA ──────────────────────── */}
            <div className="overflow-hidden rounded-2xl bg-[#1A3C6E] p-4 text-white shadow-lg shadow-[#1A3C6E]/15 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Bot size={22} />
              </div>
              <h2 className="mt-4 text-base font-bold sm:text-lg">Ask BharatLens AI</h2>
              <p className="mt-2 text-xs leading-6 text-white/70">
                Ask about eligibility, documents, deadlines, or benefits for any opportunity.
              </p>
              <Link
                href="/chatbot"
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1A3C6E] transition hover:bg-gray-100"
              >
                Open assistant <ArrowRight size={12} />
              </Link>
            </div>

            {/* ── Saved Items ───────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2 overflow-hidden">
                <Bookmark size={18} className="shrink-0 text-[#1A3C6E]" />
                <h2 className="truncate text-base font-bold text-[#111827]">Saved Items</h2>
              </div>
              {savedItems.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {savedItems.slice(0, 3).map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-start gap-2 rounded-xl border border-[#E5E7EB] p-2.5 transition hover:border-[#9BB6E5]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#111827]">{saved.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="rounded-full bg-[#F5F3EE] px-1.5 py-0.5 text-[9px] font-semibold text-[#6B7280]">
                            {saved.itemType.charAt(0).toUpperCase() + saved.itemType.slice(1)}
                          </span>
                          {saved.deadline && (
                            <span className="text-[9px] text-[#6B7280]">
                              {new Date(saved.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link
                          href={
                            saved.itemType === "scheme" ? `/schemes/${saved.itemId}` :
                            saved.itemType === "scholarship" ? `/scholarships/${saved.itemId}` :
                            saved.itemType === "job" ? `/jobs/${saved.itemId}` :
                            saved.itemType === "exam" ? `/exams/${saved.itemId}` : "#"
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F3EE] text-[#6B7280] hover:text-[#1A3C6E]"
                        >
                          <ExternalLink size={12} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleSaved(saved.itemId, saved.itemType, true)}
                          disabled={savingItem === saved.itemId}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F3EE] text-[#6B7280] hover:text-red-500 disabled:opacity-50"
                          aria-label="Remove saved item"
                        >
                          {savingItem === saved.itemId ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <BookmarkCheck size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  {counts.savedItems > 3 && (
                    <Link
                      href="/saved"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#3B82F6] hover:text-[#1A3C6E]"
                    >
                      View all {counts.savedItems} items <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="No saved items"
                  description="Save schemes, scholarships, jobs, or exams to review later."
                  action={{ label: "Browse opportunities", href: "/schemes" }}
                />
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
