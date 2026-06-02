import {
  countUnreadNotifications,
  deleteNotification as deleteNotificationRepo,
  markAllNotificationsRead,
  markNotificationAsRead,
  getNotificationsForUser,
} from "../repositories/notifications.repository";

export async function fetchUserNotifications(userId: string, page: number, limit: number, isRead?: boolean) {
  return getNotificationsForUser(userId, page, limit, isRead);
}

export async function readNotification(notificationId: string, userId: string) {
  return markNotificationAsRead(notificationId, userId);
}

export async function markReadAllNotifications(userId: string) {
  return markAllNotificationsRead(userId);
}

export async function deleteNotification(notificationId: string, userId: string) {
  return deleteNotificationRepo(notificationId, userId);
}

export async function getUnreadNotificationCount(userId: string) {
  return countUnreadNotifications(userId);
}
