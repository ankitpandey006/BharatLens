import Link from "next/link";

const stats = [
  { value: "4,200+", label: "Schemes" },
  { value: "98.4%", label: "Verified" },
  { value: "340+", label: "Exams" },
  { value: "28", label: "States" },
];

const features = [
  "Schemes",
  "Scholarships",
  "Jobs",
  "Exams",
  "Alerts",
  "AI Matching",
];

const steps = [
  {
    title: "Build your profile",
    text: "Add basic details like state, education, category, income, and goals.",
  },
  {
    title: "Get matched by AI",
    text: "BharatLens checks your eligibility with verified government opportunities.",
  },
  {
    title: "Apply with confidence",
    text: "Track deadlines, required documents, official links, and next steps.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F3EE] text-[#111827]">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-[#1A3C6E] px-6 py-10 text-white shadow-xl sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#3B82F6]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#9BB6E5]/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#9BB6E5] ring-1 ring-white/15">
                Verified Government Information
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Find the right government opportunities with{" "}
                <span className="text-[#3B82F6]">BharatLens</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
                Discover schemes, scholarships, jobs, exams, and benefits
                personalized for your profile using verified data and AI-based
                eligibility matching.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {features.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/85 ring-1 ring-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-full bg-[#3B82F6] px-7 py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/25 transition hover:bg-[#9BB6E5] hover:text-[#111827]"
                >
                  Get Started
                </Link>

                <Link
                  href="/login"
                  className="rounded-full border border-white/20 bg-white/10 px-7 py-3 text-center text-sm font-bold text-white transition hover:bg-white hover:text-[#1A3C6E]"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white/80">
                Platform Overview
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"
                  >
                    <p className="text-2xl font-extrabold text-[#9BB6E5]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-white/65">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 text-[#111827]">
                <p className="text-sm font-bold text-[#1A3C6E]">
                  Personalized dashboard
                </p>
                <p className="mt-2 text-sm leading-6 text-[#111827]/65">
                  Save opportunities, check eligibility, track deadlines, and
                  get AI-powered recommendations after login.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
        <div className="mb-7 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#111827]">
            Simple, verified, and personalized
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1A3C6E]/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A3C6E] text-sm font-bold text-white">
                {index + 1}
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#1A3C6E]">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#111827]/65">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-4xlß border border-[#E5E7EB] bg-white p-8 text-center shadow-xl shadow-[#1A3C6E]/10 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
            Start using BharatLens
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#111827]">
            Unlock personalized recommendations after login
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#111827]/65">
            Your dashboard gives access to AI recommendations, saved items,
            alerts, chatbot support, and profile-based opportunity matching.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-[#1A3C6E] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#3B82F6]"
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-[#E5E7EB] bg-[#F5F3EE] px-7 py-3 text-sm font-bold text-[#1A3C6E] transition hover:bg-[#9BB6E5]"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}