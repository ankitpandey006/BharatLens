/**
 * Content Updates Validator
 * Zod schemas for content_updates CRUD and public API
 */

import { z } from "zod";

export const updateTypeEnum = z.enum(["notification", "apply", "admit_card", "result", "answer_key", "update", "new", "unpublished", "deleted"]);
export const updateStatusEnum = z.enum(["pending", "approved", "rejected", "published", "active", "deleted"]);
export const updateItemTypeEnum = z.enum(["scheme", "scholarship", "job", "exam", "notification", "admit_card", "result", "answer_key", "update"]);

export type UpdateType = z.infer<typeof updateTypeEnum>;
export type UpdateStatus = z.infer<typeof updateStatusEnum>;
export type UpdateItemType = z.infer<typeof updateItemTypeEnum>;

/**
 * Query schema for GET /api/updates (public)
 */
export const publicUpdatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  itemType: z.string().trim().optional(),
  updateType: z.string().trim().optional(),
  sortBy: z.string().trim().optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PublicUpdatesQuery = z.infer<typeof publicUpdatesQuerySchema>;

/**
 * Admin publish update schema — used when admin publishes collected_data as an update
 */
export const adminPublishUpdateSchema = z.object({
  item_type: updateItemTypeEnum,
  item_id: z.string().trim().min(1, "Related item ID is required"),
  update_type: updateTypeEnum,
  title: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  official_url: z.string().trim().optional().default(""),
  parent_content_type: z.string().trim().optional().nullable(),
  parent_content_id: z.string().trim().optional().nullable(),
  date: z.string().trim().optional().nullable(),
  deadline: z.string().trim().optional().nullable(),
  status: updateStatusEnum.optional().default("published"),
  source_id: z.string().trim().optional().nullable(),
  collected_data_id: z.string().trim().optional().nullable(),
});

export type AdminPublishUpdateInput = z.infer<typeof adminPublishUpdateSchema>;

/**
 * Admin approve/reject/publish update body
 */
export const adminUpdateActionSchema = z.object({
  status: updateStatusEnum,
  admin_notes: z.string().trim().optional(),
});

export type AdminUpdateActionInput = z.infer<typeof adminUpdateActionSchema>;
