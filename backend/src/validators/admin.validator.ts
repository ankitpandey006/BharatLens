import { z } from "zod";

export const adminItemTypeSchema = z.enum(["scheme", "scholarship", "job", "exam"]);

// Transform function to normalize plural to singular
const normalizeItemType = (data: unknown) => {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;
  const itemType = obj.itemType as string | undefined;

  if (!itemType) return obj;

  // Normalize plural to singular
  let normalized = itemType;
  if (itemType === "schemes") normalized = "scheme";
  else if (itemType === "scholarships") normalized = "scholarship";
  else if (itemType === "jobs") normalized = "job";
  else if (itemType === "exams") normalized = "exam";

  return {
    ...obj,
    itemType: normalized,
  };
};

export const adminItemParamSchema = z
  .object({
    itemType: z.string().min(1, "Item type is required"),
    itemId: z.string().min(1, "Item ID is required").optional(),
    id: z.string().min(1, "Item ID is required").optional(),
  })
  .transform((value) => {
    // Normalize plural to singular
    let itemType = value.itemType;
    if (itemType === "schemes") itemType = "scheme";
    else if (itemType === "scholarships") itemType = "scholarship";
    else if (itemType === "jobs") itemType = "job";
    else if (itemType === "exams") itemType = "exam";

    // Validate the normalized type
    if (!["scheme", "scholarship", "job", "exam"].includes(itemType)) {
      throw new Error(`Invalid item type: ${itemType}`);
    }

    return {
      itemType,
      itemId: value.itemId ?? value.id ?? "",
    };
  })
  .refine((value) => value.itemId.length > 0, {
    message: "Item ID is required",
    path: ["id"],
  });

export const adminReviewBodySchema = z.object({
  rejection_reason: z.string().trim().min(1, "Rejection reason is required").optional(),
  reason: z.string().trim().min(1, "Reason is required").optional(),
}).refine(
  (data) => data.rejection_reason || data.reason,
  {
    message: "Either rejection_reason or reason is required",
  }
).transform((data) => ({
  rejection_reason: data.rejection_reason || data.reason || "",
}));

export const adminUpdateBodySchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    provider: z.string().trim().min(1).optional(),
    department: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1).optional(),
    status: z.string().trim().min(1).optional(),
    verification_status: z.string().trim().min(1).optional(),
    rejection_reason: z.string().trim().optional(),
    is_expired: z.boolean().optional(),
  })
  .passthrough()
  .refine((value) => Object.keys(value).length > 0, "Update body cannot be empty")
  .refine((value) => !("id" in value), "ID cannot be updated");

export const adminStatusQuerySchema = z.object({
  itemType: z.enum(["scheme", "scholarship", "job", "exam"]).optional(),
});

export const adminSourceParamSchema = z.object({
  id: z.string().min(1, "Source ID is required"),
});

export const adminQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "moderator"]),
  confirm: z.boolean().optional(),
});

export const adminUserParamSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});
