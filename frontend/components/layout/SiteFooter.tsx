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
      { href: "/chatbot", label: "Ask BharatLens AI" },
      { href: "/about", label: "About" },
      { href: "/notifications", label: "Alerts" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:gap-6 sm:py-6 lg:gap-10">
          {/* Brand */}
          <div className="w-full sm:max-w-xs sm:flex-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1A3C6E] text-[10px] font-bold text-white">
                BL
              </span>
              <span className="text-sm font-bold text-[#111827]">
                BharatLens
              </span>
            </Link>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[#111827]/60">
              AI-powered discovery for Indian government opportunities.
            </p>
          </div>

          {/* Link Groups */}
          <div className="flex flex-wrap gap-6 sm:flex-nowrap">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-[#111827]">
                  {group.title}
                </h3>
                <div className="mt-1.5 flex flex-col gap-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="min-h-[36px] text-xs text-[#111827]/60 transition hover:text-[#1A3C6E] sm:min-h-0"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#E5E7EB] px-5 py-3 text-center text-[11px] text-[#111827]/45 sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} BharatLens. Built for simpler access to verified public information.
      </div>
    </footer>
  );
}
