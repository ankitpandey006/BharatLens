import Link from "next/link";

const stats = [
  { label: "Eligible schemes", value: "24" },
  { label: "Scholarships", value: "12" },
  { label: "Jobs matched", value: "18" },
  { label: "Exam alerts", value: "7" },
];

const recommendations = [
  {
    title: "Student scholarship matching your profile",
    meta: "Education support · Deadline in 18 days",
  },
  {
    title: "State skill development scheme",
    meta: "Training benefit · Documents required",
  },
  {
    title: "Public sector exam notification",
    meta: "Graduate eligible · Application window open",
  },
];

const cards = [
  { title: "Recommended schemes", value: "24", href: "/schemes" },
  { title: "Scholarships", value: "12", href: "/scholarships" },
  { title: "Jobs", value: "18", href: "/jobs" },
  { title: "Exam alerts", value: "7", href: "/exams" },
];

const notifications = [
  "Scholarship application deadline approaching",
  "New job alert added for your education level",
  "Profile update can improve scheme accuracy",
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-[#1A3C6E]/10 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#1A3C6E] sm:text-4xl">
              Your personalized opportunity workspace
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#111827]/65">
              Review AI recommendations, track deadlines, continue profile
              setup, and jump into verified public opportunities.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4"
                >
                  <p className="text-3xl font-bold text-[#1A3C6E]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-[#111827]/60">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-[#1A3C6E]/10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#1A3C6E]">
                Profile completion
              </h2>
              <span className="rounded-full bg-[#F5F3EE] px-3 py-1 text-sm font-semibold text-[#1A3C6E]">
                40%
              </span>
            </div>
            <div className="mt-5 h-3 rounded-full bg-[#F5F3EE]">
              <div className="h-3 w-2/5 rounded-full bg-[#1A3C6E]" />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#111827]/65">
              Complete location, education, income, and preference details to
              improve AI recommendations.
            </p>
            <Link
              href="/profile/setup"
              className="mt-6 inline-flex w-full justify-center rounded-full bg-[#1A3C6E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
            >
              Continue setup
            </Link>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#1A3C6E] hover:shadow-xl"
                >
                  <p className="text-3xl font-bold text-[#1A3C6E]">
                    {card.value}
                  </p>
                  <h3 className="mt-3 text-sm font-semibold text-[#111827]">
                    {card.title}
                  </h3>
                </Link>
              ))}
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#111827]">
                    AI recommendations
                  </h2>
                  <p className="mt-1 text-sm text-[#111827]/60">
                    Based on your current profile signals.
                  </p>
                </div>
                <Link
                  href="/chatbot"
                  className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1A3C6E] transition hover:border-[#1A3C6E]"
                >
                  Ask AI
                </Link>
              </div>

              <div className="mt-5 grid gap-3">
                {recommendations.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4"
                  >
                    <h3 className="font-semibold text-[#111827]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#111827]/60">
                      {item.meta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#1A3C6E] p-6 text-white shadow-xl shadow-[#1A3C6E]/15">
              <h2 className="text-xl font-bold">Ask BharatLens AI</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Ask eligibility questions, compare benefits, or get help
                preparing required documents.
              </p>
              <Link
                href="/chatbot"
                className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1A3C6E]"
              >
                Open assistant
              </Link>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A3C6E]">
                Notifications
              </h2>
              <div className="mt-4 grid gap-3">
                {notifications.map((item) => (
                  <p
                    key={item}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-3 text-sm leading-5 text-[#111827]/70"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A3C6E]">Saved items</h2>
              <p className="mt-3 text-sm leading-6 text-[#111827]/65">
                You have 5 saved opportunities ready for review.
              </p>
              <Link
                href="/saved"
                className="mt-4 inline-flex text-sm font-semibold text-[#1A3C6E]"
              >
                View saved items
              </Link>
            </div>
          </aside>
        </section>
    </div>
  );
}
