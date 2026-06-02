import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import {
  deleteNotification,
  fetchUserNotifications,
  getUnreadNotificationCount,
  markReadAllNotifications,
  readNotification,
} from "../services/notifications.service";

export const getNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const query = req.validatedQuery as { page?: number; limit?: number; is_read?: boolean };
  const notifications = await fetchUserNotifications(user.id, query.page ?? 1, query.limit ?? 20, query.is_read);

  sendSuccess(res, "Notifications fetched successfully", notifications);
});

export const getUnreadCountHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const unreadCount = await getUnreadNotificationCount(user.id);
  sendSuccess(res, "Unread count fetched successfully", { unreadCount });
});

export const markNotificationReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { id } = req.validatedParams as { id: string };
  const notification = await readNotification(id, user.id);

  if (!notification) {
    return sendError(res, "Notification not found", 404);
  }

  sendSuccess(res, "Notification marked as read", notification);
});

export const markAllNotificationsReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const updatedCount = await markReadAllNotifications(user.id);
  sendSuccess(res, "All notifications marked as read", { updatedCount });
});

export const deleteNotificationHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { id } = req.validatedParams as { id: string };
  const deleted = await deleteNotification(id, user.id);

  if (!deleted) {
    return sendError(res, "Notification not found", 404);
  }

  sendSuccess(res, "Notification deleted successfully", { id });
});
