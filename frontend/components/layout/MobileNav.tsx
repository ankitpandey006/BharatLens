import Link from "next/link";

const navLinks = [
  { href: "/schemes", label: "Schemes" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/jobs", label: "Jobs" },
  { href: "/exams", label: "Exams" },
];

export default function MobileNav() {
  return (
    <nav className="flex flex-col gap-2 px-4 py-4 sm:hidden">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={false}
          className="min-h-11 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#111827] transition hover:bg-[#F5F3EE]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
