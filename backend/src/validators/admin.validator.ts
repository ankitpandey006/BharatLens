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
  admin_notes: z.string().trim().optional(),
}).refine(
  (data) => data.rejection_reason || data.reason || data.admin_notes,
  {
    message: "Provide rejection_reason, reason, or admin_notes",
  }
).transform((data) => ({
  rejection_reason: data.rejection_reason || data.reason || data.admin_notes || "",
  admin_notes: data.admin_notes,
}));

export const adminNotesBodySchema = z.object({
  admin_notes: z.string().trim().optional(),
});

export const adminPublishBodySchema = z.object({
  itemType: z.enum(["scheme", "scholarship", "job", "exam", "notification"]),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

const normalizeCollectedDataItemType = (data: unknown) => {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;
  const itemType = (obj.itemType as string | undefined) ?? (obj.item_type as string | undefined);

  if (!itemType) return obj;

  let normalized = itemType;
  if (itemType === "schemes") normalized = "scheme";
  else if (itemType === "scholarships") normalized = "scholarship";
  else if (itemType === "jobs") normalized = "job";
  else if (itemType === "exams") normalized = "exam";

  return {
    ...obj,
    item_type: normalized,
  };
};

export const adminCollectedDataEditSchema = z
  .object({
    title: z.string().trim().min(1).optional().nullable(),
    description: z.string().trim().min(1).optional().nullable(),
    summary: z.string().trim().optional().nullable(),
    category: z.string().trim().min(1).optional().nullable(),
    state: z.string().trim().min(1).optional().nullable(),
    deadline: z.string().trim().optional().nullable(),
    official_url: z.string().trim().url().optional().nullable(),
    source_url: z.string().trim().url().optional().nullable(),
    link: z.string().trim().url().optional().nullable(),
    itemType: z.string().optional().nullable(),
    item_type: z.string().optional().nullable(),
    source_id: z.string().trim().optional().nullable(),
    eligibility: z.string().trim().optional().nullable(),
    benefits: z.string().trim().optional().nullable(),
    admin_notes: z.string().trim().optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    rejection_reason: z.string().trim().optional().nullable(),
  })
  .transform(normalizeCollectedDataItemType)
  .refine(
    (value) => typeof value === "object" && value !== null && Object.keys(value as Record<string, unknown>).length > 0,
    {
      message: "Edit payload cannot be empty",
    },
  );

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
  status: z.string().trim().optional(),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "moderator"]),
  confirm: z.boolean().optional(),
});

export const adminUserParamSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});
