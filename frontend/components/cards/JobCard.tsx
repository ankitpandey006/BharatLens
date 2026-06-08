import Link from "next/link";
import type { Job } from "@/lib/api/content-api";

interface JobCardProps {
  job: Job;
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

export default function JobCard({
  job,
  isSaved,
  saving,
  onToggleSaved,
}: JobCardProps) {
  const status = job.status || "Upcoming";

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex-1 text-base font-semibold leading-6 text-[#1A3C6E] sm:text-lg">{job.title}</h3>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}>{status}</span>
      </div>

      {job.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#111827]/80">{job.description}</p>
      )}

      <div className="mt-4 space-y-1 border-t border-[#E5E7EB] pt-4 text-sm text-[#111827]/75">
        <p>
          <span className="font-semibold text-[#111827]">Organization:</span> {job.organization}
        </p>
        {job.location && (
          <p>
            <span className="font-semibold text-[#111827]">Location:</span> {job.location}
          </p>
        )}
        <p>
          <span className="font-semibold text-[#111827]">Qualification:</span> {job.qualification}
        </p>
        {job.vacancies && (
          <p>
            <span className="font-semibold text-[#111827]">Vacancies:</span> {job.vacancies}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {job.deadline && (
          <span className="w-fit rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#1A3C6E]">Deadline: {job.deadline}</span>
        )}
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onToggleSaved}
            disabled={saving}
            aria-label={isSaved ? "Remove from saved" : "Save item"}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200 sm:flex-initial ${
              isSaved
                ? "border-[#3B82F6] bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#C7D9FE]"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F5F3EE]"
            } ${saving ? "cursor-wait opacity-70" : "hover:border-[#D1D5DB]"}`}
          >
            {saving ? "Saving..." : isSaved ? "✓ Saved" : "Save"}
          </button>
          <Link
            href={`/jobs/${job.id}`}
            className="flex-1 rounded-xl bg-[#1A3C6E] px-3 py-2.5 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-[#3B82F6] sm:flex-initial"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
