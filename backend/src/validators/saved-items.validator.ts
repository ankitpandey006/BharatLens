import { z } from "zod";

export const savedItemTypeSchema = z.enum(["scheme", "scholarship", "job", "exam"]);

// Preprocess function to normalize camelCase and snake_case
const normalizeSavedItemInput = (data: unknown) => {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;

  // Handle item_type or itemType
  const itemType = obj.item_type ?? obj.itemType;
  // Handle item_id or itemId
  const itemId = obj.item_id ?? obj.itemId;

  return {
    itemType,
    itemId,
  };
};

const normalizeCheckInput = (data: unknown) => {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;

  // Handle itemType or item_type
  const itemType = obj.item_type ?? obj.itemType;
  // Handle itemId or item_id
  const itemId = obj.item_id ?? obj.itemId;

  return {
    itemType,
    itemId,
  };
};

export const savedItemsBodySchema = z.preprocess(
  normalizeSavedItemInput,
  z.object({
    itemId: z.string().min(1, "Item ID is required"),
    itemType: savedItemTypeSchema,
  })
);

export const savedItemCheckSchema = z.preprocess(
  normalizeCheckInput,
  z.object({
    itemType: savedItemTypeSchema,
    itemId: z.string().min(1, "Item ID is required"),
  })
);

export const savedItemsUserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const savedItemIdSchema = z.object({
  id: z.string().min(1, "Saved item ID is required"),
});
