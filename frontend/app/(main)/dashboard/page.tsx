"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { fetchDashboardSummary, type DashboardSummary } from "@/lib/api/dashboard-api";
import DashboardSkeleton from "@/components/ui/skeletons/DashboardSkeleton";

const defaultSummary: DashboardSummary = {
  counts: { schemes: 0, scholarships: 0, jobs: 0, exams: 0, savedItems: 0, notifications: 0 },
  profile: { completed: false, completionPercent: 0, missingFields: [] },
  recommendations: [],
  notificationsList: [],
  todayUpdates: [],
};

// ─── Empty State ───────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white/50 p-4 text-center sm:p-6">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F3EE] sm:h-12 sm:w-12 sm:rounded-xl">
        <Icon size={18} className="text-[#1A3C6E]/50 sm:size-[22px]" />
      </div>
      <p className="mt-2 text-xs font-semibold text-[#111827] sm:mt-3 sm:text-sm">{title}</p>
      <p className="mt-0.5 text-[11px] text-[#111827]/50 sm:mt-1 sm:text-xs">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B82F6] hover:text-[#1A3C6E] sm:mt-3 sm:text-xs"
        >
          {action.label} <ArrowRight size={10} className="sm:size-3" />
        </Link>
      )}
    </div>
  );
}

// ─── Main Dashboard Component ──────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await fetchDashboardSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard load error:", err);
          setError("Unable to load dashboard data");
          // Use defaults - no crash
          setSummary(defaultSummary);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <DashboardSkeleton />;

  const { counts, profile, recommendations, notificationsList, todayUpdates } = summary;

  const statCards = [
    { label: "Schemes", value: counts.schemes, icon: FileText, href: "/schemes", color: "text-[#3B82F6]" },
    { label: "Scholarships", value: counts.scholarships, icon: GraduationCap, href: "/scholarships", color: "text-[#8B5CF6]" },
    { label: "Jobs", value: counts.jobs, icon: Briefcase, href: "/jobs", color: "text-[#059669]" },
    { label: "Exams", value: counts.exams, icon: CalendarDays, href: "/exams", color: "text-[#D97706]" },
  ];

  const hasRecommendations = recommendations.length > 0;
  const hasNotifications = notificationsList.length > 0;
  const hasUpdates = todayUpdates.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      {error && (
        <div className="mx-auto w-full max-w-7xl px-5 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#1A3C6E] shadow-xl shadow-[#1A3C6E]/12 max-sm:rounded-xl max-sm:shadow-md">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#3B82F6]/20 blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-64 w-64 rounded-full bg-[#9BB6E5]/20 blur-3xl" />

          <div className="relative z-10 grid gap-4 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[1.4fr_0.7fr] lg:items-center lg:p-10">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 sm:px-4 sm:py-2">
                <Sparkles size={14} />
                AI-powered dashboard
              </div>

              <h1 className="mt-4 text-xl font-bold leading-tight sm:mt-5 sm:text-3xl lg:text-4xl text-balance max-sm:text-lg">
                Your personalized workspace
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-5 text-white/70 sm:mt-3 sm:text-base sm:leading-6 text-balance">
                Track schemes, scholarships, jobs, exams, and AI recommendations
                tailored for your profile.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
                {profile.completed ? (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1A3C6E] shadow-sm transition hover:bg-[#F5F3EE] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    <CheckCircle2 size={14} className="sm:size-4" />
                    Profile Complete
                  </Link>
                ) : (
                  <Link
                    href="/profile/setup"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1A3C6E] shadow-sm transition hover:bg-[#F5F3EE] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    Complete Profile ({profile.completionPercent}%)
                  </Link>
                )}
                <Link
                  href="/chatbot"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <Bot size={14} className="sm:size-4" />
                  Ask AI
                </Link>
              </div>
            </div>

            {/* Right - Profile Strength */}
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:rounded-2xl sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-white/80 sm:text-xs">
                  {profile.completed ? "Profile Complete" : "Profile Strength"}
                </p>
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/10 sm:px-3 sm:py-1 sm:text-xs">
                  {profile.completionPercent}%
                </span>
              </div>

              <div className="mt-2 h-1.5 rounded-full bg-white/15 sm:mt-3 sm:h-2.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-[#9BB6E5] to-[#3B82F6] transition-all duration-700 ease-out sm:h-2.5"
                  style={{ width: `${profile.completionPercent}%` }}
                />
              </div>

              {!profile.completed && profile.missingFields.length > 0 && (
                <p className="mt-1.5 text-[10px] leading-4 text-white/60 sm:mt-3 sm:text-xs sm:leading-5">
                  Complete your profile ({profile.completionPercent}%) for personalized recommendations.
                </p>
              )}

              {profile.completed && (
                <p className="mt-1.5 text-[10px] leading-4 text-white/60 sm:mt-3 sm:text-xs sm:leading-5">
                  ✓ Your profile is complete. You&apos;ll get the best AI recommendations!
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ─── Incomplete Profile Banner ─── */}
        {!profile.completed && profile.missingFields.length > 0 && (
          <section className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 break-words sm:mt-4 sm:rounded-2xl sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600 sm:size-[18px]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-900 sm:text-sm">Profile incomplete</p>
                <p className="mt-0.5 text-[11px] text-amber-700 sm:mt-1 sm:text-xs">
                  Complete the remaining {profile.missingFields.length} field{profile.missingFields.length !== 1 ? "s" : ""}
                  {" "}({profile.completionPercent}% done) for better recommendations.
                </p>
              </div>
              <Link
                href="/profile/setup"
                className="shrink-0 rounded-full bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-amber-700 sm:px-4 sm:py-2 sm:text-xs"
              >
                Complete
              </Link>
            </div>
          </section>
        )}

        {/* ─── Stats Cards ─── */}
        <section className="mt-4 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 sm:mt-6">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className="group relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1A3C6E]/8 sm:rounded-2xl sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3EE] group-hover:bg-[#1A3C6E]/5 sm:h-11 sm:w-11 sm:rounded-xl">
                    <Icon size={16} className={item.color + " sm:size-5"} />
                  </div>
                  <ChevronRight size={12} className="text-[#111827]/20 transition group-hover:translate-x-0.5 group-hover:text-[#111827]/40 sm:size-[14px]" />
                </div>

                <p className="mt-1.5 text-base font-bold text-[#1A3C6E] sm:mt-4 sm:text-2xl">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-[11px] font-medium text-[#111827]/60 sm:text-xs">
                  {item.label}
                </p>
              </Link>
            );
          })}
        </section>

        {/* ─── Main Content Grid ─── */}
        <section className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 lg:gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
          {/* Left Column */}
          <div className="grid gap-4 sm:gap-6">
            {/* AI Recommendations */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Zap size={16} className="text-[#1A3C6E] sm:size-5" />
                  <h2 className="text-sm font-bold text-[#111827] sm:text-lg">AI Recommendations</h2>
                </div>
                {hasRecommendations && (
                  <Link
                    href="/recommendations"
                    className="text-[11px] font-semibold text-[#3B82F6] transition hover:text-[#1A3C6E] sm:text-xs"
                  >
                    View all
                  </Link>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {hasRecommendations ? (
                  recommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded-xl border border-[#E5E7EB] bg-[#F5F3EE] p-4 transition hover:border-[#9BB6E5]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#1A3C6E] shadow-sm">
                            {rec.tag}
                          </span>
                          <p className="mt-2 text-sm font-semibold text-[#111827] leading-snug">
                            {rec.title}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-xl bg-white px-3 py-2 text-center shadow-sm">
                          <p className="text-sm font-bold text-[#1A3C6E]">{rec.match}</p>
                          <p className="text-[10px] text-[#111827]/50">Match</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Zap}
                    title="No recommendations yet"
                    description={profile.completed ? "Check back later for personalized matches." : "Complete your profile to get AI-powered recommendations."}
                    action={!profile.completed ? { label: "Complete Profile", href: "/profile/setup" } : undefined}
                  />
                )}
              </div>
            </div>

            {/* Today's Updates */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CalendarDays size={16} className="text-[#1A3C6E] sm:size-5" />
                <h2 className="text-sm font-bold text-[#111827] sm:text-lg">Recent Updates</h2>
              </div>

              <div className="mt-4 space-y-2">
                {hasUpdates ? (
                  todayUpdates.map((update, i) => (
                    <div
                      key={`${update.type}-${i}`}
                      className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-3 transition hover:border-[#9BB6E5]"
                    >
                      <span className="shrink-0 rounded-lg bg-[#1A3C6E]/10 px-2 py-1 text-[10px] font-bold text-[#1A3C6E]">
                        {update.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#111827] truncate">
                          {update.title}
                        </p>
                        <p className="text-xs text-[#111827]/50">{update.description}</p>
                      </div>
                    </div>
                  ))
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

          {/* Right Sidebar */}
          <aside className="space-y-4 sm:space-y-5">
            {/* Notifications */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Bell size={16} className="text-[#1A3C6E] sm:size-[18px]" />
                  <h2 className="text-sm font-bold text-[#111827] sm:text-base">Notifications</h2>
                </div>
                {counts.notifications > 3 && (
                  <span className="rounded-full bg-[#3B82F6]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#3B82F6] sm:px-2">
                    {counts.notifications}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {hasNotifications ? (
                  notificationsList.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-3 text-sm leading-5 break-words ${
                        n.is_read
                          ? "bg-white text-[#111827]/60"
                          : "bg-[#F5F3EE] text-[#111827]/80"
                      }`}
                    >
                      {n.message}
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

            {/* AI Assistant CTA */}
            <div className="rounded-xl border border-[#E5E7EB] bg-[#1A3C6E] p-4 text-white shadow-lg shadow-[#1A3C6E]/15 sm:rounded-2xl sm:p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 sm:h-10 sm:w-10 sm:rounded-xl">
                <Bot size={18} className="sm:size-[22px]" />
              </div>
              <h2 className="mt-3 text-sm font-bold sm:mt-4 sm:text-lg">Ask BharatLens AI</h2>
              <p className="mt-1.5 text-[11px] leading-5 text-white/70 sm:mt-2 sm:text-xs sm:leading-6">
                Ask about eligibility, documents, deadlines, or benefits for any opportunity.
              </p>
              <Link
                href="/chatbot"
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1A3C6E] transition hover:bg-[#F5F3EE] sm:mt-4 sm:inline-flex sm:w-auto sm:px-4 sm:py-2 sm:text-xs"
              >
                Open assistant <ArrowRight size={10} className="sm:size-3" />
              </Link>
            </div>

            {/* Saved Items */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Bookmark size={16} className="text-[#1A3C6E] sm:size-[18px]" />
                <h2 className="text-sm font-bold text-[#111827] sm:text-base">Saved Items</h2>
              </div>

              {counts.savedItems > 0 ? (
                <>
                  <p className="mt-2 text-xs text-[#111827]/60 sm:mt-3 sm:text-sm">
                    You have <strong className="text-[#1A3C6E]">{counts.savedItems}</strong> saved{" "}
                    {counts.savedItems === 1 ? "item" : "items"} ready for review.
                  </p>
                  <Link
                    href="/saved"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B82F6] transition hover:text-[#1A3C6E] sm:mt-3 sm:text-xs"
                  >
                    View saved items <ArrowRight size={10} className="sm:size-3" />
                  </Link>
                </>
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
    </div>
  );
}
