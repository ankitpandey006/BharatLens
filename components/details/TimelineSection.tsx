import type { TimelineItem } from "@/components/details/types";

interface TimelineSectionProps {
  items: TimelineItem[];
}

export default function TimelineSection({ items }: TimelineSectionProps) {
  if (items.length === 0) {
    return <p>No timeline available right now.</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={`${item.label}-${item.date}`} className="relative pl-6">
          <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
          <p className="font-medium text-[#1A3C6E]">{item.label}</p>
          <p className="text-sm text-[#111827]/75">{item.date}</p>
          {item.description ? (
            <p className="mt-1 text-sm text-[#111827]/70">{item.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
