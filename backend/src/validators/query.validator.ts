/**
 * Query Parameter Validators
 * Zod schemas for validating pagination, filtering, sorting, and search
 */

import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const sortSchema = z.object({
  sortBy: z.enum(["created_at", "updated_at", "deadline", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const filterSchema = z.object({
  state: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

export const searchSchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export const listQuerySchema = paginationSchema
  .extend({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .merge(sortSchema)
  .merge(filterSchema)
  .merge(searchSchema);

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortInput = z.infer<typeof sortSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;
