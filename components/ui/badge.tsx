import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "info" | "muted" | "warning";
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-[#1A3C6E]/10 text-[#1A3C6E]",
  info: "bg-[#DBEAFE] text-[#1A3C6E]",
  muted: "bg-[#F3F4F6] text-[#374151]",
  warning: "bg-[#FEF3C7] text-[#92400E]",
};

export function Badge({ className = "", tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`.trim()}
      {...props}
    />
  );
}
