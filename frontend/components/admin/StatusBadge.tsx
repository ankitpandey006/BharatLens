"use client";

import type { ItemStatus } from "@/types/admin";

interface StatusBadgeProps {
  status: ItemStatus;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  const styles = {
    ai_processed: {
      bg: "bg-[#111827]/5",
      text: "text-[#111827]",
      border: "border-[#111827]/20",
      label: "Processing",
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      label: "Pending",
    },
    pending_verification: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      label: "Pending",
    },
    approved: {
      bg: "bg-blue-50",
      text: "text-[#1A3C6E]",
      border: "border-[#3B82F6]/30",
      label: "Approved",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      label: "Rejected",
    },
    published: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      label: "Published",
    },
  };

  const style = styles[status];

  const sizeClass = {
    sm: "px-2.5 py-1 text-xs font-medium",
    md: "px-3 py-1.5 text-sm font-medium",
    lg: "px-4 py-2 text-sm font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClass} ${style.bg} ${style.text} ${style.border}`}
    >
      {style.label}
    </span>
  );
}
