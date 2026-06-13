import { ExternalLink } from "lucide-react";

export interface SavedItemCardData {
  id: string;
  type: "Scheme" | "Scholarship" | "Job" | "Exam";
  title: string;
  provider: string;
  description: string;
  deadline: string;
  status: "Open" | "Closing Soon" | "Closed" | "Upcoming";
  applyUrl?: string;
  detailUrl?: string;
}

interface SavedItemCardProps {
  item: SavedItemCardData;
  onRemove?: () => void;
  removing?: boolean;
}

const typeStyles: Record<SavedItemCardData["type"], string> = {
  Scheme: "bg-[#DBEAFE] text-[#1A3C6E]",
  Scholarship: "bg-[#EEF2FF] text-[#1A3C6E]",
  Job: "bg-[#EFF6FF] text-[#1A3C6E]",
  Exam: "bg-[#F0F5FA] text-[#1A3C6E]",
};

const statusStyles: Record<SavedItemCardData["status"], string> = {
  Open: "bg-[#DBEAFE] text-[#1A3C6E]",
  "Closing Soon": "bg-[#EEF2FF] text-[#1A3C6E]",
  Closed: "bg-[#F3F4F6] text-[#374151]",
  Upcoming: "bg-[#EFF6FF] text-[#1A3C6E]",
};

export default function SavedItemCard({ item, onRemove, removing }: SavedItemCardProps) {
  const applyUrl = item.applyUrl;
  const hasDeadline = item.deadline && item.deadline.length > 0;

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-lg">
      {/* Type + Status badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[item.type]}`}>{item.type}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-base font-semibold leading-6 text-[#1A3C6E] sm:text-lg">
        {item.title || "Untitled"}
      </h3>

      {/* Provider / Organization */}
      {item.provider && (
        <p className="mt-1 text-sm text-[#111827]/70">{item.provider}</p>
      )}

      {/* Description */}
      {item.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#111827]/80">{item.description}</p>
      )}

      {/* Actions row */}
      <div className="mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
          hasDeadline
            ? "bg-[#EEF2FF] text-[#1A3C6E]"
            : "bg-[#F3F4F6] text-[#6B7280]"
        }`}>
          {hasDeadline ? `Deadline: ${item.deadline}` : "No deadline"}
        </span>

        <div className="flex flex-wrap gap-2">
          {item.detailUrl && (
            <a
              href={item.detailUrl}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-medium text-[#1A3C6E] transition-colors duration-200 hover:bg-[#F5F3EE]"
            >
              <ExternalLink size={14} />
              Open
            </a>
          )}

          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#1A3C6E] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1A3C6E]/90"
            >
              Apply
            </a>
          ) : (
            <span className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm font-medium text-[#9CA3AF] cursor-not-allowed">
              Apply link unavailable
            </span>
          )}

          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            aria-label="Remove saved item"
            className={`min-h-[44px] rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              removing
                ? "border-[#9CA3AF] bg-[#F3F4F6] text-[#6B7280] cursor-wait opacity-70"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F5F3EE]"
            }`}
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}
