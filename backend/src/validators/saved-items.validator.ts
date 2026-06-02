import { z } from "zod";

export const savedItemTypeSchema = z.enum(["scheme", "scholarship", "job", "exam"]);

export const savedItemsBodySchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  itemType: savedItemTypeSchema,
});

export const savedItemCheckSchema = z.object({
  itemType: savedItemTypeSchema,
  itemId: z.string().min(1, "Item ID is required"),
});

export const savedItemsUserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const savedItemIdSchema = z.object({
  id: z.string().min(1, "Saved item ID is required"),
});
