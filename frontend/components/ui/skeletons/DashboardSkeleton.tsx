export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        {/* Hero skeleton */}
        <div className="animate-pulse rounded-[2rem] bg-[#1A3C6E]/90 p-5 sm:p-8 lg:p-10">
          <div className="grid gap-5 sm:gap-8 lg:grid-cols-[1.4fr_0.7fr] lg:items-center">
            <div className="space-y-4 sm:space-y-5">
              <div className="h-7 w-40 rounded-full bg-white/10 sm:h-8 sm:w-48" />
              <div className="h-8 w-full max-w-[90%] rounded-xl bg-white/10 sm:h-10" />
              <div className="h-4 w-4/5 rounded-lg bg-white/10 sm:h-5 sm:w-2/3" />
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="h-10 w-28 rounded-full bg-white/10 sm:h-11 sm:w-32" />
                <div className="h-10 w-32 rounded-full bg-white/10 sm:h-11 sm:w-36" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5">
              <div className="h-10 w-28 rounded-lg bg-white/10 sm:h-12 sm:w-32" />
              <div className="mt-3 h-2.5 rounded-full bg-white/10 sm:mt-4 sm:h-3" />
              <div className="mt-3 h-3 w-40 rounded-lg bg-white/10 sm:mt-4 sm:h-4 sm:w-48" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[#F5F3EE] sm:h-11 sm:w-11" />
                <div className="h-3 w-8 rounded bg-[#F5F3EE] sm:h-4 sm:w-10" />
              </div>
              <div className="mt-3 h-7 w-14 rounded-lg bg-[#F5F3EE] sm:mt-5 sm:h-8 sm:w-16" />
              <div className="mt-1.5 h-3 w-20 rounded bg-[#F5F3EE] sm:mt-2 sm:h-4 sm:w-24" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="mt-6 grid gap-5 lg:gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
          <div className="space-y-5 sm:space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <div className="h-6 w-40 rounded-lg bg-[#F5F3EE] sm:h-7 sm:w-48" />
              <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-[#F5F3EE] sm:h-24" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <div className="h-6 w-32 rounded-lg bg-[#F5F3EE] sm:h-7 sm:w-36" />
              <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-[#F5F3EE] sm:h-14" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-5 sm:space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <div className="h-6 w-28 rounded-lg bg-[#F5F3EE] sm:h-7 sm:w-32" />
              <div className="mt-4 space-y-2 sm:mt-4 sm:space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-[#F5F3EE] sm:h-12" />
                ))}
              </div>
            </div>
            <div className="h-44 rounded-2xl bg-[#1A3C6E]/80 sm:h-48" />
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <div className="h-6 w-24 rounded-lg bg-[#F5F3EE] sm:h-7 sm:w-28" />
              <div className="mt-3 h-8 rounded-lg bg-[#F5F3EE] sm:mt-4 sm:h-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
