/**
 * Scheme Repository
 * Handles all scheme data operations with Supabase
 * Supports pagination, filtering, searching, and sorting
 */

import { supabase } from "../config/supabase";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult, AllowedSortColumns } from "../types/query.types";
import { calculateOffset, calculatePaginationMeta } from "../utils/query-parser";
import { AppError } from "../utils/app-error";

export interface SchemeItem {
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
 * Fetch all schemes with pagination, filtering, searching, and sorting
 * @param query Query parameters including pagination, filters, search, and sorting
 * @returns ListResult with items and pagination metadata
 */
export async function getAllSchemes(query: ListQueryInput): Promise<ListResult<SchemeItem>> {
  try {
    const { page, limit, sortBy = "created_at", sortOrder = "desc", state, category, status, search } = query;

    const offset = calculateOffset(page, limit);

    // Build the query
    let sqlQuery = supabase.from("schemes").select("*", { count: "exact" });

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

    // Apply status filter
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
        `Failed to fetch schemes from database: ${error.message}`,
        error.code === "42501" ? 403 : 500
      );
    }

    if (!data) {
      throw new AppError("No data returned from database", 500);
    }

    const total = count ?? 0;
    const pagination = calculatePaginationMeta(page, limit, total);

    return {
      items: data as SchemeItem[],
      pagination,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(`Scheme repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Fetch a single scheme by ID
 * @param id Scheme ID
 * @returns Scheme item or null if not found
 */
export async function getSchemeById(id: string): Promise<SchemeItem | null> {
  try {
    if (!id || id.trim() === "") {
      throw new AppError("Scheme ID is required", 400);
    }

    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Failed to fetch scheme from database: ${error.message}`,
        error.code === "42501" ? 403 : 500
      );
    }

    return data as SchemeItem | null;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(`Scheme repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}
