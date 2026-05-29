import Link from "next/link";
import {
  Bell,
  Bookmark,
  Bot,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  getExams,
  getJobs,
  getNotifications,
  getSavedItems,
  getScholarships,
  getSchemes,
} from "@/lib/services/content";

const stats = [
  {
    label: "Eligible Schemes",
    value: String(getSchemes().length),
    icon: FileText,
    href: "/schemes",
  },
  {
    label: "Scholarships",
    value: String(getScholarships().length),
    icon: GraduationCap,
    href: "/scholarships",
  },
  {
    label: "Jobs Matched",
    value: String(getJobs().length),
    icon: Briefcase,
    href: "/jobs",
  },
  {
    label: "Exam Alerts",
    value: String(getExams().length),
    icon: CalendarDays,
    href: "/exams",
  },
];

const quickActions = [
  {
    title: "Ask AI",
    text: "Get instant help",
    href: "/chatbot",
    icon: Bot,
  },
  {
    title: "Update Profile",
    text: "Improve matches",
    href: "/profile/setup",
    icon: UserRound,
  },
  {
    title: "Saved Items",
    text: "Review later",
    href: "/saved",
    icon: Bookmark,
  },
];

const recommendations = [
  {
    title: "Student scholarship matching your profile",
    meta: "Education support · Deadline in 18 days",
    match: "92%",
    tag: "Scholarship",
  },
  {
    title: "State skill development scheme",
    meta: "Training benefit · Documents required",
    match: "86%",
    tag: "Scheme",
  },
  {
    title: "Public sector exam notification",
    meta: "Graduate eligible · Application window open",
    match: "78%",
    tag: "Exam",
  },
];

const notifications = getNotifications()
  .slice(0, 3)
  .map((item) => item.message);

const updates = [
  "New scholarship found for students in your state",
  "Government job notification added today",
  "Exam alert updated with new application date",
];

export default function DashboardPage() {
  const savedCount = getSavedItems().length;

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
                <Link
                  href="/profile/setup"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
                >
                  Complete Profile
                </Link>

                <Link
                  href="/chatbot"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ask BharatLens AI
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">
                  Profile strength
                </p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#1A3C6E]">
                  40%
                </span>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/20">
                <div className="h-3 w-2/5 rounded-full bg-[#9BB6E5]" />
              </div>

              <p className="mt-4 text-sm leading-6 text-white/70">
                Add location, education, income, and preference details to get
                better recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
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
                    <LayoutDashboard className="text-[#1A3C6E]" size={22} />
                    <h2 className="text-2xl font-bold text-[#111827]">
                      AI recommendations
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-[#111827]/60">
                    Based on your current profile details.
                  </p>
                </div>

                <Link
                  href="/chatbot"
                  className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1A3C6E] transition hover:border-[#1A3C6E]"
                >
                  Ask AI
                </Link>
              </div>

              <div className="mt-5 grid gap-4">
                {recommendations.map((item) => (
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
                        <p className="mt-1 text-sm text-[#111827]/60">
                          {item.meta}
                        </p>
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
                <CheckCircle2 className="text-[#1A3C6E]" size={22} />
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
                {notifications.map((item) => (
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
                className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
              >
                Open assistant
              </Link>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A3C6E]">Saved items</h2>
              <p className="mt-3 text-sm leading-6 text-[#111827]/65">
                You have {savedCount} saved opportunities ready for review.
              </p>

              <Link
                href="/saved"
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