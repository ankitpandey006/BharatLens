import type { NotificationItem } from "@/types";

interface NotificationCardProps {
  notification: NotificationItem;
}

const typeStyles: Record<NotificationItem["type"], string> = {
  Reminder: "bg-[#FEF3C7] text-[#92400E]",
  Match: "bg-[#DBEAFE] text-[#1A3C6E]",
  Update: "bg-[#E0E7FF] text-[#3730A3]",
  "Saved Item": "bg-[#DCFCE7] text-[#166534]",
};

export default function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-md transition-colors duration-200 ${
        notification.read
          ? "border-[#E5E7EB] bg-white"
          : "border-[#9BB6E5] bg-[#EFF6FF]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[notification.type]}`}>{notification.type}</span>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#3B82F6]" />}
        </div>
        <span className="shrink-0 text-xs text-[#111827]/60">{notification.createdAt}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-6 text-[#1A3C6E]">{notification.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#111827]/80">{notification.message}</p>
      <div className="mt-4 flex justify-end">
        <button
          aria-label="Mark notification as read"
          className="min-h-[44px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-medium text-[#111827] transition-colors duration-200 hover:bg-[#F5F3EE]"
        >
          Mark as read
        </button>
      </div>
    </article>
  );
}
