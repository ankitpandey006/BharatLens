import { z } from "zod";

export const notificationUserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const notificationIdSchema = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});
