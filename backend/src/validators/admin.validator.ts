import { z } from "zod";

export const adminItemTypeSchema = z.enum(["scheme", "scholarship", "job", "exam"]);

export const adminItemParamSchema = z
  .object({
    itemType: adminItemTypeSchema,
    itemId: z.string().min(1, "Item ID is required").optional(),
    id: z.string().min(1, "Item ID is required").optional(),
  })
  .transform((value) => ({
    itemType: value.itemType,
    itemId: value.itemId ?? value.id ?? "",
  }))
  .refine((value) => value.itemId.length > 0, {
    message: "Item ID is required",
    path: ["id"],
  });

export const adminReviewBodySchema = z.object({
  rejection_reason: z.string().trim().min(1, "Rejection reason is required"),
});

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
  itemType: adminItemTypeSchema.optional(),
});

export const adminSourceParamSchema = z.object({
  id: z.string().min(1, "Source ID is required"),
});

export const adminQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});
