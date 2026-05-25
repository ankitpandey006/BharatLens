import Link from "next/link";

const sections = [
  "Basic info",
  "State / District",
  "User type",
  "Education",
  "Income",
  "Language",
  "Notification preferences",
  "Saved preferences",
];

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-[#1A3C6E]/10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
              Profile
            </p>
            <h1 className="mt-3 text-3xl font-bold text-[#1A3C6E]">
              Personalization settings
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#111827]/65">
              Keep your profile updated so BharatLens can improve AI
              recommendations and alerts.
            </p>
            <Link
              href="/profile/setup"
              className="mt-6 inline-flex rounded-full bg-[#1A3C6E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
            >
              Update profile setup
            </Link>
          </section>

          <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#111827]">
              Profile fields
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {sections.map((section) => (
                <div
                  key={section}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4"
                >
                  <p className="text-sm font-semibold text-[#1A3C6E]">
                    {section}
                  </p>
                  <p className="mt-1 text-xs text-[#111827]/55">
                    Ready to configure
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
