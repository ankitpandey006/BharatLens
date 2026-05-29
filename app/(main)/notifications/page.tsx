import NotificationCard from "@/components/cards/NotificationCard";
import { getNotifications } from "@/lib/services/content";

export default function NotificationsPage() {
  const dummyNotifications = getNotifications();
  const unreadCount = dummyNotifications.filter((notification) => !notification.read).length;

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">BharatLens Alerts</p>
              <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">Notifications</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#111827]/75">
                Stay updated with reminders, matches, updates, and alerts from your saved items.
              </p>
            </div>
            <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#1A3C6E]">
              {unreadCount} unread
            </span>
          </div>
        </div>

        {dummyNotifications.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No notifications available</p>
            <p className="mt-1 text-sm text-[#111827]/70">You will see new updates and reminders here.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {dummyNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
