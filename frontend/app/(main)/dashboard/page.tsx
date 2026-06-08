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
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/lib/api/dashboard-api";
import DashboardSkeleton from "@/components/ui/skeletons/DashboardSkeleton";

const defaultSummary: DashboardSummary = {
  counts: {
    schemes: 0,
    scholarships: 0,
    jobs: 0,
    exams: 0,
    savedItems: 0,
    notifications: 0,
  },
  profile: { completed: false, completionPercent: 0, missingFields: [] },
  recommendations: [],
  notificationsList: [],
  todayUpdates: [],
};

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
    <div className="w-full overflow-hidden wrap-break-words rounded-2xl border border-dashed border-[#E5E7EB] bg-white/60 px-4 py-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3EE]">
        <Icon size={20} className="text-[#1A3C6E]/50" />
      </div>
      <p className="mx-auto mt-3 max-w-full text-sm font-semibold text-[#111827]">{title}</p>
      <p className="mx-auto mt-1 max-w-full wrap-break-words text-xs leading-5 text-[#111827]/50">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#3B82F6]"
        >
          {action.label} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await fetchDashboardSummary();
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard load error:", err);
          setError("Unable to load dashboard data");
          setSummary(defaultSummary);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <DashboardSkeleton />;

  const { counts, profile, recommendations, notificationsList, todayUpdates } =
    summary;

  const statCards = [
    {
      label: "Schemes",
      value: counts.schemes,
      icon: FileText,
      href: "/schemes",
      color: "text-[#3B82F6]",
    },
    {
      label: "Scholarships",
      value: counts.scholarships,
      icon: GraduationCap,
      href: "/scholarships",
      color: "text-[#8B5CF6]",
    },
    {
      label: "Jobs",
      value: counts.jobs,
      icon: Briefcase,
      href: "/jobs",
      color: "text-[#059669]",
    },
    {
      label: "Exams",
      value: counts.exams,
      icon: CalendarDays,
      href: "/exams",
      color: "text-[#D97706]",
    },
  ];

  const hasRecommendations = recommendations.length > 0;
  const hasNotifications = notificationsList.length > 0;
  const hasUpdates = todayUpdates.length > 0;

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F5F3EE]">
      {error && (
        <div className="w-full max-w-full px-4 pt-4 sm:px-6 lg:mx-auto lg:max-w-7xl lg:px-8">
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      <div className="w-full max-w-full px-4 py-4 sm:px-6 sm:py-6 lg:mx-auto lg:max-w-7xl lg:px-8">
        <section className="relative w-full max-w-full overflow-hidden rounded-3xl bg-[#1A3C6E] shadow-lg shadow-[#1A3C6E]/10 lg:rounded-4xl">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#3B82F6]/20 blur-3xl" />
          <div className="absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-[#9BB6E5]/20 blur-3xl" />

          <div className="relative z-10 grid w-full max-w-full gap-4 overflow-hidden p-4 sm:p-6 lg:grid-cols-[1.4fr_0.7fr] lg:items-center lg:p-10">
            <div className="min-w-0 overflow-hidden">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/15 sm:text-xs">
                <Sparkles size={13} />
                AI-powered dashboard
              </div>

              <h1 className="mt-4 wrap-break-words text-xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                Your personalized workspace
              </h1>

              <p className="mt-2 max-w-xl wrap-break-words text-sm leading-6 text-white/75 sm:text-base">
                Track schemes, scholarships, jobs, exams, and AI recommendations
                tailored for your profile.
              </p>

              <div className="mt-4 flex w-full max-w-full flex-wrap gap-2">
                <Link
                  href={profile.completed ? "/profile" : "/profile/setup"}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1A3C6E] shadow-sm sm:flex-none sm:text-sm"
                >
                  {profile.completed ? (
                    <>
                      <CheckCircle2 size={15} />
                      Profile Complete
                    </>
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

            <div className="w-full max-w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
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
                  className="h-2 rounded-full bg-linear-to-r from-[#9BB6E5] to-[#3B82F6]"
                  style={{ width: `${profile.completionPercent}%` }}
                />
              </div>

              <p className="mt-3 wrap-break-words text-xs leading-5 text-white/65">
                {profile.completed
                  ? "✓ Your profile is complete. You'll get the best AI recommendations!"
                  : `Complete your profile (${profile.completionPercent}%) for personalized recommendations.`}
              </p>
            </div>
          </div>
        </section>

        {!profile.completed && profile.missingFields.length > 0 && (
          <section className="mt-4 w-full max-w-full overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex w-full max-w-full items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <div className="min-w-0 flex-1 overflow-hidden wrap-break-words">
                <p className="text-sm font-bold text-amber-900">
                  Profile incomplete
                </p>
                <p className="mt-1 wrap-break-words text-xs leading-5 text-amber-700">
                  Complete remaining {profile.missingFields.length} field
                  {profile.missingFields.length !== 1 ? "s" : ""} for better
                  recommendations.
                </p>
              </div>
              <Link
                href="/profile/setup"
                className="shrink-0 rounded-full bg-amber-600 px-3 py-2 text-xs font-semibold text-white"
              >
                Complete
              </Link>
            </div>
          </section>
        )}

        <section className="mt-4 grid w-full max-w-full grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className="group w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EE]">
                    <Icon size={19} className={item.color} />
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-[#111827]/25" />
                </div>

                <p className="mt-3 text-xl font-bold text-[#1A3C6E] sm:text-2xl">
                  {item.value.toLocaleString()}
                </p>
                <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-[#111827]/60">
                  {item.label}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-4 grid w-full max-w-full gap-4 sm:mt-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="grid w-full max-w-full gap-4 sm:gap-6">
            <div className="w-full max-w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <Zap size={18} className="shrink-0 text-[#1A3C6E]" />
                  <h2 className="truncate text-base font-bold text-[#111827] sm:text-lg">
                    AI Recommendations
                  </h2>
                </div>

                {hasRecommendations && (
                  <Link
                    href="/recommendations"
                    className="shrink-0 text-xs font-semibold text-[#3B82F6]"
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
                      className="w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F5F3EE] p-4"
                    >
                      <div className="flex w-full max-w-full items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <span className="inline-block max-w-full truncate rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#1A3C6E]">
                            {rec.tag}
                          </span>
                          <p className="mt-2 line-clamp-2 wrap-break-words text-sm font-semibold leading-snug text-[#111827]">
                            {rec.title}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-xl bg-white px-3 py-2 text-center">
                          <p className="text-sm font-bold text-[#1A3C6E]">
                            {rec.match}
                          </p>
                          <p className="text-[10px] text-[#111827]/50">
                            Match
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Zap}
                    title="No recommendations yet"
                    description={
                      profile.completed
                        ? "Check back later for personalized matches."
                        : "Complete your profile to get AI-powered recommendations."
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

            <div className="w-full max-w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 overflow-hidden">
                <CalendarDays size={18} className="shrink-0 text-[#1A3C6E]" />
                <h2 className="truncate text-base font-bold text-[#111827] sm:text-lg">
                  Recent Updates
                </h2>
              </div>

              <div className="mt-4 space-y-2">
                {hasUpdates ? (
                  todayUpdates.map((update, i) => (
                    <div
                      key={`${update.type}-${i}`}
                      className="flex w-full max-w-full items-start gap-3 overflow-hidden rounded-xl border border-[#E5E7EB] p-3"
                    >
                      <span className="shrink-0 rounded-lg bg-[#1A3C6E]/10 px-2 py-1 text-[10px] font-bold text-[#1A3C6E]">
                        {update.type}
                      </span>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-[#111827]">
                          {update.title}
                        </p>
                        <p className="truncate text-xs text-[#111827]/50">
                          {update.description}
                        </p>
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

          <aside className="grid w-full max-w-full gap-4 lg:block lg:space-y-5">
            <div className="w-full max-w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <Bell size={18} className="shrink-0 text-[#1A3C6E]" />
                  <h2 className="truncate text-base font-bold text-[#111827]">
                    Notifications
                  </h2>
                </div>

                {counts.notifications > 3 && (
                  <span className="shrink-0 rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-bold text-[#3B82F6]">
                    {counts.notifications}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {hasNotifications ? (
                  notificationsList.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className={`w-full max-w-full overflow-hidden wrap-break-words rounded-xl p-3 text-sm leading-5 ${
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

            <div className="w-full max-w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#1A3C6E] p-4 text-white shadow-lg shadow-[#1A3C6E]/15 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Bot size={22} />
              </div>
              <h2 className="mt-4 wrap-break-words text-base font-bold sm:text-lg">
                Ask BharatLens AI
              </h2>
              <p className="mt-2 wrap-break-words text-xs leading-6 text-white/70">
                Ask about eligibility, documents, deadlines, or benefits for any
                opportunity.
              </p>
              <Link
                href="/chatbot"
                className="mt-4 flex w-full max-w-full items-center justify-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1A3C6E]"
              >
                Open assistant <ArrowRight size={12} />
              </Link>
            </div>

            <div className="w-full max-w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2 overflow-hidden">
                <Bookmark size={18} className="shrink-0 text-[#1A3C6E]" />
                <h2 className="truncate text-base font-bold text-[#111827]">
                  Saved Items
                </h2>
              </div>

              {counts.savedItems > 0 ? (
                <>
                  <p className="mt-3 wrap-break-words text-sm leading-6 text-[#111827]/60">
                    You have{" "}
                    <strong className="text-[#1A3C6E]">
                      {counts.savedItems}
                    </strong>{" "}
                    saved {counts.savedItems === 1 ? "item" : "items"} ready for
                    review.
                  </p>
                  <Link
                    href="/saved"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#3B82F6]"
                  >
                    View saved items <ArrowRight size={12} />
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
    </main>
  );
}