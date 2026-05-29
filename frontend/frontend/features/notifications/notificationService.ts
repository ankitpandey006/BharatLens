import type { NotificationItem } from "./notificationTypes";

export async function getNotifications(): Promise<NotificationItem[]> {
  return [
    {
      id: "notification-1",
      title: "Application deadline approaching",
      message: "A scholarship deadline is in 5 days.",
      category: "Scholarship",
      timestamp: "2026-05-22T10:00:00Z",
      read: false,
    },
    {
      id: "notification-2",
      title: "New job alert",
      message: "A government role matching your profile is available.",
      category: "Jobs",
      timestamp: "2026-05-20T14:30:00Z",
      read: true,
    },
  ];
}
