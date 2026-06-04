import Link from "next/link";
import type { Scholarship } from "@/lib/api/content-api";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isSaved?: boolean;
  saving?: boolean;
  onToggleSaved?: () => void;
}

const getStatusStyle = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-[#DBEAFE] text-[#1A3C6E]";
    case "closing soon":
      return "bg-[#FEF3C7] text-[#92400E]";
    case "closed":
      return "bg-[#F3F4F6] text-[#374151]";
    case "upcoming":
      return "bg-[#E0E7FF] text-[#3730A3]";
    default:
      return "bg-[#E0E7FF] text-[#3730A3]";
  }
};

export default function ScholarshipCard({
  scholarship,
  isSaved,
  saving,
  onToggleSaved,
}: ScholarshipCardProps) {
  const status = scholarship.status || "Upcoming";

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-6 text-[#1A3C6E] sm:text-lg">{scholarship.title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}>
          {status}
        </span>
      </div>

      {scholarship.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#111827]/80">{scholarship.description}</p>
      )}

      <div className="mt-4 space-y-1 border-t border-[#E5E7EB] pt-4 text-sm text-[#111827]/75">
        <p>
          <span className="font-semibold text-[#111827]">Provider:</span> {scholarship.provider}
        </p>
        <p>
          <span className="font-semibold text-[#111827]">Category:</span> {scholarship.category}
        </p>
        {scholarship.amount && (
          <p>
            <span className="font-semibold text-[#111827]">Amount:</span> {scholarship.amount}
          </p>
        )}
        <p>
          <span className="font-semibold text-[#111827]">Eligibility:</span> {scholarship.eligibility}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {scholarship.deadline && (
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#1A3C6E]">
            Deadline: {scholarship.deadline}
          </span>
        )}
        <div className="grid w-full gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            onClick={onToggleSaved}
            disabled={saving}
            className={`min-h-[44px] rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              isSaved
                ? "border-[#3B82F6] bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#C7D9FE]"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F5F3EE]"
            } ${saving ? "cursor-wait opacity-70" : "hover:border-[#D1D5DB]"}`}
          >
            {saving ? "Saving..." : isSaved ? "✓ Saved" : "Save"}
          </button>
          <Link
            href={`/scholarships/${scholarship.id}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1A3C6E] px-3 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#3B82F6]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
