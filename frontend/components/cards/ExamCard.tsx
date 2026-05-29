import Link from "next/link";
import type { ExamListItem } from "@/types";

interface ExamCardProps {
  exam: ExamListItem;
}

const statusStyles: Record<ExamListItem["status"], string> = {
  Open: "bg-[#DBEAFE] text-[#1A3C6E]",
  "Closing Soon": "bg-[#FEF3C7] text-[#92400E]",
  Closed: "bg-[#F3F4F6] text-[#374151]",
  Upcoming: "bg-[#E0E7FF] text-[#3730A3]",
};

export default function ExamCard({ exam }: ExamCardProps) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-6 text-[#1A3C6E] sm:text-lg">{exam.title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[exam.status]}`}>{exam.status}</span>
      </div>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#111827]/80">{exam.description}</p>

      <div className="mt-4 space-y-1 border-t border-[#E5E7EB] pt-4 text-sm text-[#111827]/75">
        <p>
          <span className="font-semibold text-[#111827]">Conducting Body:</span> {exam.conductingBody}
        </p>
        <p>
          <span className="font-semibold text-[#111827]">Category:</span> {exam.category}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#1A3C6E]">Exam Date: {exam.examDate}</span>
        <span className="rounded-full bg-[#F0F9FF] px-3 py-1 text-xs font-medium text-[#1A3C6E]">
          Apply By: {exam.applicationDeadline}
        </span>
        <div className="ml-auto flex gap-2">
          <button className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition-colors duration-200 hover:bg-[#F5F3EE]">
            Save
          </button>
          <Link
            href={`/exams/${exam.id}`}
            className="rounded-xl bg-[#1A3C6E] px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#3B82F6]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
