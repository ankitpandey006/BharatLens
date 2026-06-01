import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchUserNotifications, readNotification } from "../services/notifications.service";

export const getNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.validatedParams as { userId: string };
  const notifications = await fetchUserNotifications(userId);
  sendSuccess(res, "Notifications fetched successfully", notifications);
});

export const markNotificationReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.validatedParams as { notificationId: string };
  const notification = await readNotification(notificationId);

  if (!notification) {
    return sendError(res, "Notification not found", 404);
  }

  sendSuccess(res, "Notification marked as read", notification);
});
