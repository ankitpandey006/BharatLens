import { z } from "zod";

export const notificationIdSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
});

export const notificationQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  is_read: z.enum(["true", "false"]).optional().transform((value) => (value === undefined ? undefined : value === "true")),
});
