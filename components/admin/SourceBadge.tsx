"use client";

interface SourceBadgeProps {
  sourceName: string;
  trustScore: number;
  size?: "sm" | "md";
}

export default function SourceBadge({
  sourceName,
  trustScore,
  size = "md",
}: SourceBadgeProps) {
  let trustLevel = "Unknown";
  let trustColor = "text-[#111827]/60";

  if (trustScore >= 90) {
    trustLevel = "Highly Trusted";
    trustColor = "text-green-700";
  } else if (trustScore >= 70) {
    trustLevel = "Trusted";
    trustColor = "text-[#1A3C6E]";
  } else if (trustScore >= 50) {
    trustLevel = "Moderate";
    trustColor = "text-yellow-700";
  } else {
    trustLevel = "Unverified";
    trustColor = "text-red-700";
  }

  const sizeClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center justify-between ${sizeClass}`}>
      <span className="font-medium text-[#111827]">{sourceName}</span>
      <span className={`font-semibold ${trustColor}`}>
        {trustLevel} ({trustScore}%)
      </span>
    </div>
  );
}
