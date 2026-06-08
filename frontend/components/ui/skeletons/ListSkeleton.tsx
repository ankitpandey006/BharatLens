import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  count?: number;
  /** Show card-style items instead of list-style items */
  card?: boolean;
  /** Show compact items (shorter height) */
  compact?: boolean;
}

export default function ListSkeleton({ count = 5, card = false, compact = false }: ListSkeletonProps) {
  return (
    <div className={card ? "grid gap-5 xl:grid-cols-2" : "space-y-4"}>
      {Array.from({ length: count }).map((_, i) =>
        card ? (
          <div key={i} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#E5E7EB] pt-4">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-xl" />
            </div>
          </div>
        ) : compact ? (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-4">
            <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ) : (
          <div key={i} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>
            <Skeleton className="mt-3 h-4 w-1/2" />
          </div>
        ),
      )}
    </div>
  );
}
