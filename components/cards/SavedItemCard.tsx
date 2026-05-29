import type { SavedItem } from "@/types";

interface SavedItemCardProps {
  item: SavedItem;
}

const typeStyles: Record<SavedItem["type"], string> = {
  Scheme: "bg-[#DBEAFE] text-[#1A3C6E]",
  Scholarship: "bg-[#E0E7FF] text-[#3730A3]",
  Job: "bg-[#DCFCE7] text-[#166534]",
  Exam: "bg-[#FEF3C7] text-[#92400E]",
};

const statusStyles: Record<SavedItem["status"], string> = {
  Open: "bg-[#DBEAFE] text-[#1A3C6E]",
  "Closing Soon": "bg-[#FEF3C7] text-[#92400E]",
  Closed: "bg-[#F3F4F6] text-[#374151]",
  Upcoming: "bg-[#E0E7FF] text-[#3730A3]",
};

export default function SavedItemCard({ item }: SavedItemCardProps) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[item.type]}`}>{item.type}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-6 text-[#1A3C6E] sm:text-lg">{item.title}</h3>
      <p className="mt-1 text-sm text-[#111827]/70">{item.provider}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#111827]/80">{item.description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] pt-4">
        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#1A3C6E]">Deadline: {item.deadline}</span>
        <button className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-medium text-[#111827] transition-colors duration-200 hover:bg-[#F5F3EE]">
          Remove
        </button>
      </div>
    </article>
  );
}
