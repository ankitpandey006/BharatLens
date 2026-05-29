"use client";

interface ConfidenceBadgeProps {
  score: number; // 0-100
  label?: string;
}

export default function ConfidenceBadge({
  score,
  label = "AI Confidence",
}: ConfidenceBadgeProps) {
  let textColor = "text-red-700";
  let barColor = "bg-red-400";
  let confidence = "Low";

  if (score >= 80) {
    textColor = "text-green-700";
    barColor = "bg-green-500";
    confidence = "High";
  } else if (score >= 60) {
    textColor = "text-[#1A3C6E]";
    barColor = "bg-[#3B82F6]";
    confidence = "Medium";
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#111827]/60">{label}</span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {score}% - {confidence}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
