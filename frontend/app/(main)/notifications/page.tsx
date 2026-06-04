"use client";

import { useEffect, useState } from "react";
import NotificationCard from "@/components/cards/NotificationCard";
import { fetchNotifications, type Notification } from "@/lib/api/content-api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchNotifications({ page, limit: 20 });
        setNotifications(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load notifications"
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [page]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">
                BharatLens Alerts
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">
                Notifications
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#111827]/75">
                Stay updated with reminders, matches, updates, and alerts from your saved items.
              </p>
            </div>
            <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#1A3C6E]">
              {unreadCount} unread
            </span>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-red-50 p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-red-600">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">
              No notifications available
            </p>
            <p className="mt-1 text-sm text-[#111827]/70">
              You will see new updates and reminders here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={{
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: (notification.type as "Reminder" | "Match" | "Update" | "Saved Item") || "Update",
                    createdAt: notification.created_at
                      ? new Date(notification.created_at).toLocaleDateString()
                      : new Date().toLocaleDateString(),
                    read: notification.is_read || false,
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2 text-[#1A3C6E] disabled:opacity-50 hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <span className="flex items-center px-4 text-[#111827]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2 text-[#1A3C6E] disabled:opacity-50 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
