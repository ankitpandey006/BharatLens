import Link from "next/link";

const features = [
  {
    title: "Personalized discovery",
    description:
      "Match schemes, scholarships, jobs, and exams against your profile instead of browsing scattered portals.",
  },
  {
    title: "Verified opportunity hub",
    description:
      "Keep public information organized with eligibility, deadlines, documents, and source-aware next steps.",
  },
  {
    title: "Smart alerts",
    description:
      "Track deadlines, exam windows, saved items, and new opportunities that match your needs.",
  },
];

const previewItems = [
  "PM scholarship opportunities for undergraduate students",
  "State welfare schemes for women entrepreneurs",
  "Upcoming government exams after graduation",
];

export default function Home() {
  return (
    <div className="flex flex-col bg-[#F5F3EE] text-[#111827]">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="w-fit rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3C6E] shadow-sm">
              AI-powered Indian government opportunity platform
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-[#111827] sm:text-5xl lg:text-[3.45rem]">
              Discover the right schemes, scholarships, jobs, exams, and
              benefits with BharatLens AI.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#111827]/65 sm:text-lg">
              BharatLens turns complex public information into personalized,
              actionable recommendations based on your profile, eligibility,
              location, and goals.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-[#1A3C6E] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#3B82F6]"
              >
                Get Started
              </Link>
              <Link
                href="/chatbot"
                className="rounded-full border border-[#E5E7EB] bg-white px-6 py-3 text-center text-sm font-semibold text-[#1A3C6E] shadow-sm transition hover:border-[#1A3C6E]"
              >
                ✨ Ask BharatLens AI
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-2xl shadow-[#1A3C6E]/10">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
                  Search preview
                </p>
                <div className="mt-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] px-4 py-3 text-sm text-[#111827]/55">
                  Search schemes, scholarships, jobs, exams...
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {previewItems.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E] text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold text-[#111827]">
                          {item}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-[#111827]/55">
                          Eligibility summary, required documents, and deadline
                          alerts prepared for your profile.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <h2 className="text-xl font-bold text-[#1A3C6E]">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#111827]/65">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-[#1A3C6E]/10 md:grid-cols-[0.9fr_1.1fr] md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
                AI Assistant
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111827]">
                Ask questions in plain language.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#111827]/65">
                BharatLens AI helps users understand eligibility, compare
                opportunities, and prepare next steps without navigating many
                websites manually.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4">
              <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-[#111827]/70">
                “I am a final-year engineering student from Rajasthan. Which
                scholarships and government exams should I track this month?”
              </p>
              <div className="mt-3 rounded-2xl bg-[#1A3C6E] p-4 text-sm leading-6 text-white">
                BharatLens AI can summarize eligible scholarships, exam alerts,
                important dates, and documents needed for your profile.
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
