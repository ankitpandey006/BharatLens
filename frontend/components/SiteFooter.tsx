import Link from "next/link";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/schemes", label: "Schemes" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/jobs", label: "Jobs" },
      { href: "/exams", label: "Exams" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/chatbot", label: "Ask BharatLens AI" },
      { href: "/about", label: "About" },
      { href: "/notifications", label: "Alerts" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Get Started" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#E5E7EB] bg-white text-[#111827]/65">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A3C6E] text-xs font-bold text-white">
              BL
            </span>
            <span className="text-lg font-bold text-[#111827]">
              BharatLens
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6">
            AI-powered discovery for Indian government schemes, scholarships,
            jobs, exams, welfare benefits, and alerts.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold text-[#111827]">
              {column.title}
            </h2>
            <div className="mt-3 grid gap-2 text-sm">
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-[#1A3C6E]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E5E7EB] px-5 py-4 text-center text-xs text-[#111827]/45">
        © 2026 BharatLens. Built for simpler access to verified public
        information.
      </div>
    </footer>
  );
}
