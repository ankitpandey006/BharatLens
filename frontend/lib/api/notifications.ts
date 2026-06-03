import { get, ApiResponse } from "./client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch notifications for current user
 */
export async function getNotifications(): Promise<Notification[]> {
  const response = await get<ApiResponse<Notification[]>>("/api/notifications");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch notifications");
  }

  return response.data || [];
}
