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
  UserRound,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getCurrentUser, type UserProfile } from "@/lib/api/auth-api";
import { fetchDashboardStats, fetchRecommendations, fetchNotifications } from "@/lib/api/content-api";

interface DashboardStats {
  schemes: number;
  scholarships: number;
  jobs: number;
  exams: number;
  saved: number;
  notifications: number;
}

const defaultStats: DashboardStats = {
  schemes: 0,
  scholarships: 0,
  jobs: 0,
  exams: 0,
  saved: 0,
  notifications: 0,
};

const quickActions = [
  {
    title: "Ask AI",
    text: "Get instant help",
    href: "/chatbot",
    icon: Bot,
  },
  {
    title: "Saved Items",
    text: "Review later",
    href: "/saved",
    icon: Bookmark,
  },
];

const updates = [
  "New scholarship found for students in your state",
  "Government job notification added today",
  "Exam alert updated with new application date",
];

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [recommendations, setRecommendations] = useState<Array<{title: string; match: string; tag: string}>>();
  const [notificationsList, setNotificationsList] = useState<string[]>([]);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to load current user:", error);
      } finally {
        setUserLoading(false);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    async function loadData() {
      // Use Promise.allSettled to handle each widget independently
      // If one fails, others still load
      const results = await Promise.allSettled([
        fetchDashboardStats(),
        fetchRecommendations({ limit: 3, optional: true }),
        fetchNotifications({ limit: 3, optional: true }),
      ]);

      // Process dashboard stats (critical, always required)
      if (results[0].status === "fulfilled") {
        const dashboardStats = results[0].value;
        setStats({
          schemes: dashboardStats.total_schemes || 0,
          scholarships: dashboardStats.total_scholarships || 0,
          jobs: dashboardStats.total_jobs || 0,
          exams: dashboardStats.total_exams || 0,
          saved: dashboardStats.total_saved_items || 0,
          notifications: dashboardStats.total_notifications || 0,
        });
      } else {
        // Use default stats if fetch fails
        setStats(defaultStats);
      }

      // Process recommendations (optional widget)
      if (results[1].status === "fulfilled") {
        const recsResponse = results[1].value;
        if (recsResponse && recsResponse.items && recsResponse.items.length > 0) {
          setRecommendations(
            recsResponse.items.map((item) => {
              const itemData = item.item_data as Record<string, unknown> | undefined;
              return {
                title: (itemData?.title as string) || "Recommendation",
                match: `${Math.round((item.match_score || 0) * 100)}%`,
                tag: item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1),
              };
            })
          );
        }
      }
      // If recommendations fail, leave as undefined (shows default message)

      // Process notifications (optional widget)
      if (results[2].status === "fulfilled") {
        const notifResponse = results[2].value;
        if (notifResponse && notifResponse.items && notifResponse.items.length > 0) {
          setNotificationsList(notifResponse.items.map((n) => n.message));
        }
      }
      // If notifications fail, leave as empty (shows default messages)
    }

    loadData();
  }, []);

  const statCards = [
    {
      label: "Eligible Schemes",
      value: String(stats.schemes),
      icon: FileText,
      href: "/schemes",
    },
    {
      label: "Scholarships",
      value: String(stats.scholarships),
      icon: GraduationCap,
      href: "/scholarships",
    },
    {
      label: "Jobs Matched",
      value: String(stats.jobs),
      icon: Briefcase,
      href: "/jobs",
    },
    {
      label: "Exam Alerts",
      value: String(stats.exams),
      icon: CalendarDays,
      href: "/exams",
    },
  ];

  const recommendationsList = recommendations || [
    {
      title: "Complete your profile to see personalized recommendations",
      match: "--",
      tag: "Info",
    },
  ];

  const notificationsToShow = notificationsList.length > 0 ? notificationsList : [
    "Check out new opportunities in your state",
    "Profile completion increases match accuracy",
    "Set preferences to get better recommendations",
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-[#1A3C6E] p-6 text-white shadow-lg shadow-[#1A3C6E]/12 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                <Sparkles size={16} />
                AI-powered dashboard
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Your personalized BharatLens workspace
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Track schemes, scholarships, jobs, exams, saved items, and AI
                recommendations based on your profile.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {!currentUser?.profile_completed && (
                  <Link
                    href="/profile/setup"
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
                  >
                    Complete Profile
                  </Link>
                )}

                {currentUser?.profile_completed && (
                  <Link
                    href="/profile"
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
                  >
                    View Profile
                  </Link>
                )}

                <Link
                  href="/chatbot"
                  prefetch={false}
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ask BharatLens AI
                </Link>
              </div>
            </div>

            {/* Profile Strength Card */}
            {!userLoading && currentUser && (
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/80">
                    {currentUser.profile_completed ? "Profile Complete" : "Profile strength"}
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#1A3C6E]">
                    {currentUser.profile_completion_percentage ?? 0}%
                  </span>
                </div>

                <div className="mt-4 h-3 rounded-full bg-white/20">
                  <div
                    className="h-3 rounded-full bg-[#9BB6E5] transition-all duration-300"
                    style={{
                      width: `${currentUser.profile_completion_percentage ?? 0}%`,
                    }}
                  />
                </div>

                {!currentUser.profile_completed && currentUser.missing_profile_fields && (
                  <p className="mt-4 text-sm leading-6 text-white/70">
                    Complete {currentUser.missing_profile_fields.length} more field{currentUser.missing_profile_fields.length !== 1 ? "s" : ""} to get better recommendations.
                  </p>
                )}

                {currentUser.profile_completed && (
                  <p className="mt-4 text-sm leading-6 text-white/70">
                    ✓ Your profile is complete. You'll get the best recommendations!
                  </p>
                )}
              </div>
            )}
            </div>
        </section>

        {/* Profile Completion Alert (if incomplete) */}
        {!userLoading && currentUser && !currentUser.profile_completed && currentUser.missing_profile_fields && (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-amber-900">Complete Your Profile</h2>
                <p className="mt-2 text-sm text-amber-800">
                  Your profile is {currentUser.profile_completion_percentage}% complete. Complete the remaining fields for better recommendations:
                </p>
                <ul className="mt-3 space-y-1">
                  {currentUser.missing_profile_fields.map((field) => (
                    <li key={field} className="text-sm text-amber-800">
                      • {field.replace(/_/g, " ").charAt(0).toUpperCase() + field.replace(/_/g, " ").slice(1).toLowerCase()}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/profile/setup"
                  prefetch={false}
                  className="mt-4 inline-flex rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className="group rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F3EE] text-[#1A3C6E]">
                    <Icon size={21} />
                  </div>
                  <span className="text-xs font-semibold text-[#3B82F6]">
                    View
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-[#1A3C6E]">
                  {item.value}
                </p>
                <p className="mt-1 text-sm font-medium text-[#111827]/65">
                  {item.label}
                </p>
              </Link>
            );
          })}
        </section>

        {/* Quick actions */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                prefetch={false}
                className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition duration-200 hover:border-[#9BB6E5] hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A3C6E] text-white">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#111827]/60">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <div className="grid gap-6">
            {/* AI Recommendations */}
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-[#1A3C6E]" size={22} />
                    <h2 className="text-2xl font-bold text-[#111827]">
                      AI recommendations
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-[#111827]/60">
                    Based on your current profile details.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/recommendations"
                    prefetch={false}
                    className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1A3C6E] transition hover:border-[#1A3C6E]"
                  >
                    View all
                  </Link>

                  <Link
                    href="/chatbot"
                    prefetch={false}
                    className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1A3C6E] transition hover:border-[#1A3C6E]"
                  >
                    Ask AI
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {recommendationsList.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1A3C6E]">
                          {item.tag}
                        </span>
                        <h3 className="mt-3 font-bold text-[#111827]">
                          {item.title}
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-white px-4 py-3 text-center">
                        <p className="text-lg font-bold text-[#1A3C6E]">
                          {item.match}
                        </p>
                        <p className="text-xs text-[#111827]/50">Match</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today Updates */}
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-[#1A3C6E]" size={22} />
                <h2 className="text-2xl font-bold text-[#111827]">
                  Today&apos;s updates
                </h2>
              </div>

              <div className="mt-5 grid gap-3">
                {updates.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#E5E7EB] p-4 text-sm font-medium text-[#111827]/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <aside className="grid gap-6">
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Bell className="text-[#1A3C6E]" size={21} />
                <h2 className="text-xl font-bold text-[#1A3C6E]">
                  Notifications
                </h2>
              </div>

              <div className="mt-4 grid gap-3">
                {notificationsToShow.map((item) => (
                  <p
                    key={item}
                    className="rounded-2xl bg-[#F5F3EE] p-3 text-sm leading-5 text-[#111827]/70"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-[#1A3C6E] p-6 text-white shadow-lg shadow-[#1A3C6E]/15">
              <Bot size={28} />
              <h2 className="mt-4 text-xl font-bold">Ask BharatLens AI</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Ask about eligibility, documents, deadlines, or benefits.
              </p>

              <Link
                href="/chatbot"
                prefetch={false}
                className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
              >
                Open assistant
              </Link>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A3C6E]">Saved items</h2>
              <p className="mt-3 text-sm leading-6 text-[#111827]/65">
                You have {stats.saved} saved opportunities ready for review.
              </p>

              <Link
                href="/saved"
                prefetch={false}
                className="mt-4 inline-flex text-sm font-bold text-[#1A3C6E] transition hover:text-[#3B82F6]"
              >
                View saved items
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}