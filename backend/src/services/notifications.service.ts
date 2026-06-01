import { getNotificationsForUser, markNotificationAsRead } from "../repositories/notifications.repository";

export async function fetchUserNotifications(userId: string) {
  return getNotificationsForUser(userId);
}

export async function readNotification(notificationId: string) {
  return markNotificationAsRead(notificationId);
}
