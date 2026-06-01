/**
 * Query Parser Utility
 * Parses and validates query parameters from Express requests
 */

import type { Request } from "express";
import { listQuerySchema, type ListQueryInput } from "../validators/query.validator";
import { AppError } from "./app-error";

/**
 * Parse and validate query parameters from Express request
 * @param req Express request object
 * @returns Validated and sanitized query parameters
 * @throws AppError if validation fails
 */
export function parseListQuery(req: Request): ListQueryInput {
  try {
    const query = req.query;

    const parsed = listQuerySchema.safeParse({
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder || "desc",
      state: query.state,
      category: query.category,
      status: query.status,
      search: query.search,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.issues
        .map((issue) => `${issue.path.map(String).join(".")}: ${issue.message}`)
        .join("; ");

      throw new AppError(`Invalid query parameters: ${fieldErrors}`, 400);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to parse query parameters", 400);
  }
}

/**
 * Calculate pagination metadata
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Calculate database offset for pagination
 * @param page Page number (1-indexed)
 * @param limit Items per page
 * @returns Database offset (0-indexed)
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
