import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  children?: React.ReactNode;
}

/**
 * Full-page skeleton with a generic header area and content area.
 * Use `children` to replace the content area with a more specific skeleton (ListSkeleton, etc.).
 */
export default function PageSkeleton({ children }: PageSkeletonProps) {
  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="w-full max-w-md space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-56 sm:h-10" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {children ?? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
