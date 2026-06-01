import { z } from "zod";

export const savedItemsBodySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  itemId: z.string().min(1, "Item ID is required"),
  type: z.enum(["scheme", "scholarship", "job", "exam"]),
});

export const savedItemsUserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const savedItemIdSchema = z.object({
  id: z.string().min(1, "Saved item ID is required"),
});
