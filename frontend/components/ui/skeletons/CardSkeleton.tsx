import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  lines?: number;
}

export default function CardSkeleton({ lines = 3 }: CardSkeletonProps) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      {/* Badge row */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Title */}
      <Skeleton className="mt-4 h-5 w-3/4" />

      {/* Provider */}
      <Skeleton className="mt-2 h-4 w-1/2" />

      {/* Description lines */}
      <div className="mt-3 space-y-2">
        {Array.from({ length: Math.min(lines, 3) }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>

      {/* Footer row */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#E5E7EB] pt-4">
        <Skeleton className="h-6 w-28 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16 rounded-xl" />
          <Skeleton className="h-9 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
