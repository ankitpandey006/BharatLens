export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

const notifications: NotificationItem[] = [
  {
    id: "notif-001",
    userId: "user-001",
    title: "New scholarship alert",
    message: "A new scholarship relevant to your profile is now available.",
    read: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: "notif-002",
    userId: "user-001",
    title: "Scheme deadline approaching",
    message: "An eligible scheme is closing soon. Apply before the deadline.",
    read: false,
    timestamp: new Date().toISOString(),
  },
];

export interface NotificationsRepository {
  getNotificationsForUser(userId: string): Promise<NotificationItem[]>;
  markNotificationAsRead(notificationId: string): Promise<NotificationItem | undefined>;
}

export async function getNotificationsForUser(userId: string): Promise<NotificationItem[]> {
  return notifications.filter((item) => item.userId === userId);
}

export async function markNotificationAsRead(notificationId: string): Promise<NotificationItem | undefined> {
  const notification = notifications.find((item) => item.id === notificationId);

  if (!notification) {
    return undefined;
  }

  notification.read = true;
  return notification;
}
