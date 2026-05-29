import Link from "next/link";

const stats = [
  { value: "4,200+", label: "Schemes Indexed" },
  { value: "98.4%", label: "Verified Sources" },
  { value: "340+", label: "Exams Tracked" },
  { value: "28", label: "State Portals" },
];

const highlights = [
  "Government schemes",
  "Scholarships",
  "Jobs & exams",
  "Eligibility alerts",
];

const steps = [
  {
    title: "Create your profile",
    text: "Add your state, education, category, goal, and basic eligibility details after login.",
  },
  {
    title: "AI checks eligibility",
    text: "BharatLens matches your profile with verified schemes, scholarships, jobs, and exams.",
  },
  {
    title: "Get recommendations",
    text: "Receive personalized opportunities, deadlines, documents, and next steps in your dashboard.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#111827]">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-[#1A3C6E] px-6 py-8 text-white shadow-lg shadow-[#1A3C6E]/12 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#9BB6E5]/15" />
          <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-[#3B82F6]/10" />

          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#9BB6E5] ring-1 ring-white/15">
              Verified Government Information
            </p>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-[3.4rem]">
              BharatLens
              <span className="block text-[#3B82F6]">
                AI-Powered Opportunity Platform
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              Discover personalized government schemes, scholarships, jobs,
              exams, and public benefits through verified data and AI-based
              eligibility matching.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 ring-1 ring-white/10"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-[#3B82F6] px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/20 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:bg-[#9BB6E5] hover:text-[#111827]"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-bold text-white transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:bg-white hover:text-[#1A3C6E]"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/10 p-4"
              >
                <p className="text-2xl font-extrabold text-[#3B82F6]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1A3C6E]/8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1A3C6E] text-sm font-bold text-white">
                {index + 1}
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#1A3C6E]">
                {step.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#111827]/65">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-7 text-center shadow-lg shadow-[#1A3C6E]/8 md:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
            Personalized access after login
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#111827]">
            Features unlock after account login.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#111827]/65">
            BharatLens homepage only explains the platform. AI recommendations,
            saved items, alerts, chatbot, and profile-based matching will be
            available inside the user dashboard.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-[#1A3C6E] px-7 py-3 text-sm font-bold text-white transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:bg-[#3B82F6]"
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-[#E5E7EB] bg-[#F5F3EE] px-7 py-3 text-sm font-bold text-[#1A3C6E] transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:bg-[#9BB6E5]"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}