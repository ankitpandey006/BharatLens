import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-500">
          BharatLens
        </h1>

        <div className="hidden md:flex gap-6 text-sm items-center">
          <Link href="/">Home</Link>
          <Link href="/schemes">Schemes</Link>
          <Link href="/scholarships">Scholarships</Link>
          <Link href="/jobs">Jobs</Link>

          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">

        <h1 className="max-w-4xl text-5xl md:text-7xl font-bold leading-tight">
          India’s <span className="text-blue-500">AI Powered</span> Government Information Platform
        </h1>

        <p className="max-w-2xl mt-6 text-lg text-slate-400">
          Discover government schemes, scholarships, jobs, exams,
          and welfare programs personalized for you.
        </p>

        <div className="flex gap-4 mt-10 flex-wrap justify-center">
          <Link
            href="/schemes"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
          >
            Explore Schemes
          </Link>

          <Link
            href="/chatbot"
            className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
          >
            AI Assistant
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-6 px-8 pb-20">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-semibold mb-3 text-blue-400">
            Government Schemes
          </h3>
          <p className="text-slate-400">
            Find central & state government schemes personalized for you.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-semibold mb-3 text-blue-400">
            Scholarships
          </h3>
          <p className="text-slate-400">
            Discover scholarships based on eligibility and education level.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-semibold mb-3 text-blue-400">
            AI Assistant
          </h3>
          <p className="text-slate-400">
            Ask AI and get instant verified government information.
          </p>
        </div>
      </section>

    </main>
  );
}