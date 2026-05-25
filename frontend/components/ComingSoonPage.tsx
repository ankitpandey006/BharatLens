type ComingSoonPageProps = {
  title: string;
  description: string;
};

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[70vh] flex-col bg-[#F5F3EE] text-[#111827]">
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#3B82F6]">
          Coming soon
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-base leading-7 text-[#111827]/65 sm:text-lg">
          {description}
        </p>
      </section>
    </div>
  );
}
