import { supabase } from "../config/supabase";
import { AppError } from "../utils/app-error";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

export interface NotificationListResult {
  items: NotificationItem[];
  total: number;
}

export interface NotificationsRepository {
  getNotificationsForUser(userId: string, page: number, limit: number, isRead?: boolean): Promise<NotificationListResult>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<NotificationItem | null>;
  markAllNotificationsRead(userId: string): Promise<number>;
  deleteNotification(notificationId: string, userId: string): Promise<boolean>;
  countUnreadNotifications(userId: string): Promise<number>;
}

export async function getNotificationsForUser(userId: string, page: number, limit: number, isRead?: boolean): Promise<NotificationListResult> {
  const offset = (page - 1) * limit;
  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (typeof isRead === "boolean") {
    query = query.eq("is_read", isRead);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(`Failed to fetch notifications: ${error.message}`, 500);
  }

  return {
    items: (data ?? []) as NotificationItem[],
    total: count ?? 0,
  };
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<NotificationItem | null> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to mark notification read: ${error.message}`, 500);
  }

  return data as NotificationItem | null;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
    .select("id");

  if (error) {
    throw new AppError(`Failed to mark notifications read: ${error.message}`, 500);
  }

  return Array.isArray(data) ? data.length : 0;
}

export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to delete notification: ${error.message}`, 500);
  }

  return Boolean(data);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new AppError(`Failed to count unread notifications: ${error.message}`, 500);
  }

  return count ?? 0;
}
