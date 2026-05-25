export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#111827]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-8 md:grid-cols-[1fr_440px] md:px-8 lg:gap-16">
        <section className="hidden md:block">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
              BharatLens
            </p>
            <h1 className="text-4xl font-bold leading-tight text-[#1A3C6E] lg:text-5xl">
              AI-powered access to verified public opportunities.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#111827]/65">
              Discover schemes, scholarships, jobs, exams, and recommendations
              built around your needs.
            </p>
          </div>
        </section>

        <main className="flex w-full justify-center">{children}</main>
      </div>
    </div>
  );
}
