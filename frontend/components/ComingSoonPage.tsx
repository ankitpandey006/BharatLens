import Link from "next/link";

type ComingSoonPageProps = {
  title: string;
  description: string;
};

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-6">
        <Link href="/" className="text-2xl font-bold text-blue-500">
          BharatLens
        </Link>

        <Link
          href="/"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
        >
          Home
        </Link>
      </nav>

      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Coming soon
        </p>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-lg text-slate-400">{description}</p>
      </section>
    </main>
  );
}
