type ComingSoonPageProps = {
  title: string;
  description: string;
};

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <main className="min-h-screen bg-[#F5F3EE] px-5 py-10">
      <section className="mx-auto flex max-w-4xl flex-col items-center justify-center rounded-3xl border border-[#E5E7EB] bg-white px-6 py-20 text-center shadow-sm">
        
        <p className="rounded-full bg-[#EEF4FF] px-4 py-2 text-sm font-semibold text-[#1A3C6E]">
          Coming Soon
        </p>

        <h1 className="mt-6 text-4xl font-bold text-[#1A3C6E] sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-[#111827]/65">
          {description}
        </p>

        <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] px-6 py-4">
          <p className="text-sm text-[#111827]/60">
            This feature is currently under development.
          </p>
        </div>

      </section>
    </main>
  );
}