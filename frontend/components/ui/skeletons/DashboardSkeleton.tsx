export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        {/* Hero skeleton */}
        <div className="animate-pulse rounded-[2rem] bg-[#1A3C6E]/90 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr] lg:items-center">
            <div className="space-y-5">
              <div className="h-8 w-48 rounded-full bg-white/10" />
              <div className="h-10 w-3/4 rounded-xl bg-white/10" />
              <div className="h-5 w-2/3 rounded-lg bg-white/10" />
              <div className="flex gap-3">
                <div className="h-11 w-32 rounded-full bg-white/10" />
                <div className="h-11 w-36 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <div className="h-12 w-32 rounded-lg bg-white/10" />
              <div className="mt-4 h-3 rounded-full bg-white/10" />
              <div className="mt-4 h-4 w-48 rounded-lg bg-white/10" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-[#F5F3EE]" />
                <div className="h-4 w-10 rounded bg-[#F5F3EE]" />
              </div>
              <div className="mt-5 h-8 w-16 rounded-lg bg-[#F5F3EE]" />
              <div className="mt-2 h-4 w-24 rounded bg-[#F5F3EE]" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <div className="h-7 w-48 rounded-lg bg-[#F5F3EE]" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-[#F5F3EE]" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <div className="h-7 w-36 rounded-lg bg-[#F5F3EE]" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-[#F5F3EE]" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <div className="h-7 w-32 rounded-lg bg-[#F5F3EE]" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-[#F5F3EE]" />
                ))}
              </div>
            </div>
            <div className="h-48 rounded-2xl bg-[#1A3C6E]/80" />
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <div className="h-7 w-28 rounded-lg bg-[#F5F3EE]" />
              <div className="mt-4 h-10 rounded-lg bg-[#F5F3EE]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
