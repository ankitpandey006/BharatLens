/**
 * Scholarship Repository
 * Handles all scholarship data operations with Supabase
 * Supports pagination, filtering, searching, and sorting
 */

import { supabase } from "../config/supabase";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult, AllowedSortColumns } from "../types/query.types";
import { calculateOffset, calculatePaginationMeta } from "../utils/query-parser";
import { AppError } from "../utils/app-error";

export interface ScholarshipItem {
  id: string;
  title: string;
  description: string;
  category: string;
  provider: string;
  benefit: string;
  eligibility: string;
  deadline: string;
  status: string;
  state?: string;
  search_text?: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all scholarships with pagination, filtering, searching, and sorting
 * @param query Query parameters including pagination, filters, search, and sorting
 * @returns ListResult with items and pagination metadata
 */
export async function getAllScholarships(query: ListQueryInput): Promise<ListResult<ScholarshipItem>> {
  try {
    const { page, limit, sortBy = "created_at", sortOrder = "desc", state, category, status, search } = query;

    const offset = calculateOffset(page, limit);

    // Build the query
    let sqlQuery = supabase.from("scholarships").select("*", { count: "exact" });

    // Apply search filter using ilike on multiple columns
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      sqlQuery = sqlQuery.or(
        `title.ilike.${searchPattern},description.ilike.${searchPattern},search_text.ilike.${searchPattern}`
      );
    }

    // Apply state filter
    if (state && state.trim()) {
      sqlQuery = sqlQuery.eq("state", state.trim());
    }

    // Apply category filter
    if (category && category.trim()) {
      sqlQuery = sqlQuery.eq("category", category.trim());
    }

    // Public website should only surface active, published content.
    sqlQuery = sqlQuery.eq("status", "active").eq("verification_status", "published");
    if (status && status.trim()) {
      sqlQuery = sqlQuery.eq("status", status.trim());
    }

    // Apply sorting
    const isAscending = sortOrder === "asc";
    sqlQuery = sqlQuery.order(sortBy as AllowedSortColumns, { ascending: isAscending });

    // Apply pagination
    sqlQuery = sqlQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await sqlQuery;

    if (error) {
      throw new AppError(
        `Failed to fetch scholarships from database: ${error.message}`,
        error.code === "42501" ? 403 : 500
      );
    }

    if (!data) {
      throw new AppError("No data returned from database", 500);
    }

    const total = count ?? 0;
    const pagination = calculatePaginationMeta(page, limit, total);

    return {
      items: data as ScholarshipItem[],
      pagination,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(`Scholarship repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Fetch a single scholarship by ID
 * @param id Scholarship ID
 * @returns Scholarship item or null if not found
 */
export async function getScholarshipById(id: string): Promise<ScholarshipItem | null> {
  try {
    if (!id || id.trim() === "") {
      throw new AppError("Scholarship ID is required", 400);
    }

    const { data, error } = await supabase
      .from("scholarships")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Failed to fetch scholarship from database: ${error.message}`,
        error.code === "42501" ? 403 : 500
      );
    }

    return data as ScholarshipItem | null;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(`Scholarship repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}
