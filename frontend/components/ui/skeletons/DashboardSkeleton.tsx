export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen w-full max-w-full bg-[#F5F3EE]">
      <div className="w-full max-w-full overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:mx-auto lg:max-w-7xl lg:px-8">
        {/* Hero skeleton */}
        <div className="animate-pulse rounded-2xl bg-[#1A3C6E]/90 p-4 sm:rounded-[2rem] sm:p-8 lg:p-10">
          <div className="grid gap-4 sm:gap-8 lg:grid-cols-[1.4fr_0.7fr] lg:items-center">
            <div className="space-y-3 sm:space-y-5">
              <div className="h-6 w-36 rounded-full bg-white/10 sm:h-8 sm:w-48" />
              <div className="h-7 w-full max-w-[90%] rounded-lg bg-white/10 sm:h-10 sm:rounded-xl" />
              <div className="h-3 w-4/5 rounded-md bg-white/10 sm:h-5 sm:w-2/3 sm:rounded-lg" />
              <div className="flex flex-wrap gap-1.5 sm:gap-3">
                <div className="h-8 w-24 rounded-full bg-white/10 sm:h-11 sm:w-32" />
                <div className="h-8 w-28 rounded-full bg-white/10 sm:h-11 sm:w-36" />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 sm:rounded-2xl sm:p-5">
              <div className="h-8 w-24 rounded-lg bg-white/10 sm:h-12 sm:w-32" />
              <div className="mt-2 h-1.5 rounded-full bg-white/10 sm:mt-4 sm:h-3" />
              <div className="mt-2 h-2.5 w-36 rounded-md bg-white/10 sm:mt-4 sm:h-4 sm:w-48 sm:rounded-lg" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mt-4 grid w-full max-w-full grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 sm:mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-3 sm:rounded-2xl sm:p-5">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-[#F5F3EE] sm:h-11 sm:w-11 sm:rounded-xl" />
                <div className="h-2.5 w-6 rounded bg-[#F5F3EE] sm:h-4 sm:w-10" />
              </div>
              <div className="mt-2 h-6 w-12 rounded-md bg-[#F5F3EE] sm:mt-5 sm:h-8 sm:w-16 sm:rounded-lg" />
              <div className="mt-1 h-2.5 w-16 rounded bg-[#F5F3EE] sm:mt-2 sm:h-4 sm:w-24" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="mt-4 grid w-full max-w-full gap-4 sm:mt-6 sm:gap-5 lg:gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
          <div className="w-full max-w-full space-y-4 sm:space-y-6">
            <div className="w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-4 sm:rounded-2xl sm:p-6">
              <div className="h-5 w-32 rounded-md bg-[#F5F3EE] sm:h-7 sm:w-48 sm:rounded-lg" />
              <div className="mt-3 space-y-2 sm:mt-5 sm:space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-[#F5F3EE] sm:h-24 sm:rounded-xl" />
                ))}
              </div>
            </div>
            <div className="w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-4 sm:rounded-2xl sm:p-6">
              <div className="h-5 w-24 rounded-md bg-[#F5F3EE] sm:h-7 sm:w-36 sm:rounded-lg" />
              <div className="mt-3 space-y-1.5 sm:mt-5 sm:space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-[#F5F3EE] sm:h-14 sm:rounded-xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full max-w-full space-y-4 sm:space-y-6">
            <div className="w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-4 sm:rounded-2xl sm:p-6">
              <div className="h-5 w-24 rounded-md bg-[#F5F3EE] sm:h-7 sm:w-32 sm:rounded-lg" />
              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-lg bg-[#F5F3EE] sm:h-12 sm:rounded-xl" />
                ))}
              </div>
            </div>
            <div className="w-full overflow-hidden rounded-xl bg-[#1A3C6E]/80 sm:h-48 sm:rounded-2xl" />
            <div className="w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-4 sm:rounded-2xl sm:p-6">
              <div className="h-5 w-20 rounded-md bg-[#F5F3EE] sm:h-7 sm:w-28 sm:rounded-lg" />
              <div className="mt-2 h-6 rounded-md bg-[#F5F3EE] sm:mt-4 sm:h-10 sm:rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
