import * as React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#E5E7EB]/70 ${className}`.trim()}
      aria-hidden="true"
      {...props}
    />
  );
}
