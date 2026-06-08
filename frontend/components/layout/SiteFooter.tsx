import Link from "next/link";

const linkGroups = [
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
      { href: "/chatbot", label: "Ask AI" },
      { href: "/about", label: "About" },
      { href: "/notifications", label: "Alerts" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-0 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1A3C6E] text-[9px] font-bold text-white">
              BL
            </span>
            <span className="text-xs font-semibold text-[#111827]">
              BharatLens
            </span>
          </Link>
          <span className="hidden text-[11px] leading-none text-[#111827]/45 sm:inline">
            AI-powered discovery for Indian government opportunities.
          </span>
        </div>

        {/* Link Groups */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {linkGroups.map((group, gi) => (
            <div key={group.title} className="flex items-center gap-x-3 gap-y-1">
              {gi > 0 && (
                <span className="hidden text-[10px] text-[#111827]/20 sm:inline">|</span>
              )}
              {group.links.map((link, li) => (
                <span key={link.href} className="flex items-center gap-x-3">
                  {li > 0 && (
                    <span className="text-[10px] text-[#111827]/20">|</span>
                  )}
                  <Link
                    href={link.href}
                    className="text-[11px] text-[#111827]/55 transition hover:text-[#1A3C6E]"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#E5E7EB] px-4 py-2 text-center text-[10px] text-[#111827]/40 sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} BharatLens. Built for simpler access to verified public information.
      </div>
    </footer>
  );
}

