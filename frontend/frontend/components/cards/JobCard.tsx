import Link from "next/link";
import type { JobListItem } from "@/types";

interface JobCardProps {
  job: JobListItem;
}

const statusStyles: Record<JobListItem["status"], string> = {
  Open: "bg-[#DBEAFE] text-[#1A3C6E]",
  "Closing Soon": "bg-[#FEF3C7] text-[#92400E]",
  Closed: "bg-[#F3F4F6] text-[#374151]",
  Upcoming: "bg-[#E0E7FF] text-[#3730A3]",
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-6 text-[#1A3C6E] sm:text-lg">{job.title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status]}`}>{job.status}</span>
      </div>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#111827]/80">{job.description}</p>

      <div className="mt-4 space-y-1 border-t border-[#E5E7EB] pt-4 text-sm text-[#111827]/75">
        <p>
          <span className="font-semibold text-[#111827]">Organization:</span> {job.organization}
        </p>
        <p>
          <span className="font-semibold text-[#111827]">Location:</span> {job.location}
        </p>
        <p>
          <span className="font-semibold text-[#111827]">Qualification:</span> {job.qualification}
        </p>
        <p>
          <span className="font-semibold text-[#111827]">Vacancies:</span> {job.vacancies}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#1A3C6E]">Deadline: {job.deadline}</span>
        <div className="flex gap-2">
          <button className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition-colors duration-200 hover:bg-[#F5F3EE]">
            Save
          </button>
          <Link
            href={`/jobs/${job.id}`}
            className="rounded-xl bg-[#1A3C6E] px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#3B82F6]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
