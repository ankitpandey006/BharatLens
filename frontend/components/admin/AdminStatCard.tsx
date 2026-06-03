"use client";

import type { ReactNode } from "react";

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: number;
  color: "blue" | "yellow" | "green" | "red" | "purple";
}

export default function AdminStatCard({
  label,
  value,
  icon,
  trend,
  color,
}: AdminStatCardProps) {
  const colorStyles = {
    blue: {
      bg: "bg-[#3B82F6]/10",
      icon: "text-[#1A3C6E]",
      border: "border-[#3B82F6]/30",
    },
    yellow: {
      bg: "bg-yellow-50",
      icon: "text-yellow-600",
      border: "border-yellow-200",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-200",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      border: "border-red-200",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      border: "border-purple-200",
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-6 transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#111827]/60">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#111827]">{value}</p>
          {trend !== undefined && (
            <p
              className={`mt-2 text-xs font-medium ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? "+" : ""}{trend}% from last week
            </p>
          )}
        </div>
        <div className={`rounded-xl ${style.bg} p-3 ${style.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
