import Link from "next/link";

const points = [
  "Personalized recommendations based on user profile",
  "Clean discovery for schemes, scholarships, jobs, and exams",
  "AI assistance for eligibility, deadlines, and next steps",
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-[#1A3C6E]/10 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
            About BharatLens
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-[#1A3C6E]">
            A simpler way to discover verified public opportunities.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#111827]/65">
            BharatLens is designed as an AI-powered SaaS-style platform for
            Indian government information. It helps users move from scattered
            discovery to guided recommendations, alerts, and action steps.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {points.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4 text-sm font-medium leading-6 text-[#111827]/75"
              >
                {point}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-[#1A3C6E] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
            >
              Get Started
            </Link>
            <Link
              href="/chatbot"
              className="rounded-full border border-[#E5E7EB] px-5 py-3 text-center text-sm font-semibold text-[#1A3C6E] transition hover:border-[#1A3C6E]"
            >
              Ask BharatLens AI
            </Link>
          </div>
        </section>
    </div>
  );
}
