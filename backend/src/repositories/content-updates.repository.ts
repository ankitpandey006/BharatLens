/**
 * Content Updates Repository
 * Handles all content_updates data operations with Supabase
 * Supports CRUD, public queries, and admin operations
 */

import { supabase } from "../config/supabase";
import { AppError } from "../utils/app-error";
import { calculateOffset, calculatePaginationMeta } from "../utils/query-parser";
import type { ListResult } from "../types/query.types";
import type { PublicUpdatesQuery, AdminPublishUpdateInput, AdminUpdateActionInput, UpdateType, UpdateStatus } from "../validators/content-updates.validator";

export interface ContentUpdateItem {
  id: string;
  item_type: string;
  item_id: string;
  source_id?: string | null;
  collected_data_id?: string | null;
  update_type: string;
  title: string;
  description?: string;
  official_url?: string;
  status: string;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch public updates with filtering — only published status
 */
export async function getPublicUpdates(query: PublicUpdatesQuery): Promise<ListResult<ContentUpdateItem>> {
  try {
    const { page, limit, itemType, updateType, sortBy = "created_at", sortOrder = "desc" } = query;
    const offset = calculateOffset(page, limit);

    let sqlQuery = supabase
      .from("content_updates")
      .select("*", { count: "exact" })
      .eq("status", "published");

    if (itemType && itemType.trim()) {
      sqlQuery = sqlQuery.eq("item_type", itemType.trim());
    }
    if (updateType && updateType.trim()) {
      sqlQuery = sqlQuery.eq("update_type", updateType.trim());
    }

    sqlQuery = sqlQuery.order(sortBy, { ascending: sortOrder === "asc" });
    sqlQuery = sqlQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await sqlQuery;

    if (error) {
      throw new AppError(
        `Failed to fetch updates: ${error.message}`,
        error.code === "42501" ? 403 : 500,
      );
    }

    const total = count ?? 0;
    return {
      items: (data ?? []) as ContentUpdateItem[],
      pagination: calculatePaginationMeta(page, limit, total),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Fetch published updates for a specific item (exam/job/scheme/scholarship)
 * Returns an array of updates for badge/link display
 */
export async function getUpdatesByItemId(itemType: string, itemId: string): Promise<ContentUpdateItem[]> {
  try {
    const { data, error } = await supabase
      .from("content_updates")
      .select("*")
      .eq("item_type", itemType)
      .eq("item_id", itemId)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        `Failed to fetch updates for ${itemType}:${itemId}: ${error.message}`,
        500,
      );
    }

    return (data ?? []) as ContentUpdateItem[];
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Fetch published updates for multiple items of the same type (for list queries)
 * Returns a map of itemId -> updates[]
 */
export async function getUpdatesByItemIds(itemType: string, itemIds: string[]): Promise<Map<string, ContentUpdateItem[]>> {
  const resultMap = new Map<string, ContentUpdateItem[]>();

  if (itemIds.length === 0) return resultMap;

  try {
    const { data, error } = await supabase
      .from("content_updates")
      .select("*")
      .eq("item_type", itemType)
      .in("item_id", itemIds)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        `Failed to fetch updates for ${itemType}: ${error.message}`,
        500,
      );
    }

    for (const update of data ?? []) {
      const existing = resultMap.get(update.item_id) ?? [];
      existing.push(update as ContentUpdateItem);
      resultMap.set(update.item_id, existing);
    }

    return resultMap;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Fetch active (published) items with a specific update_type filter
 * e.g. all exams with published apply updates, or admit_card updates
 */
export async function getItemsByUpdateType(
  tableName: string,
  itemType: string,
  updateType: UpdateType,
  query: { page: number; limit: number },
): Promise<ListResult<Record<string, unknown>>> {
  try {
    const { page, limit } = query;
    const offset = calculateOffset(page, limit);

    // First, get item_ids from content_updates that match the filter
    const { data: updateData, error: updateError, count } = await supabase
      .from("content_updates")
      .select("item_id", { count: "exact" })
      .eq("item_type", itemType)
      .eq("update_type", updateType)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (updateError) {
      throw new AppError(
        `Failed to fetch ${itemType} by update type: ${updateError.message}`,
        500,
      );
    }

    const itemIds = (updateData ?? []).map((u) => u.item_id).filter(Boolean);
    const total = count ?? 0;

    if (itemIds.length === 0) {
      return {
        items: [],
        pagination: calculatePaginationMeta(page, limit, total),
      };
    }

    // Then fetch the actual items from the main table
    const { data: items, error: itemsError } = await supabase
      .from(tableName)
      .select("*")
      .in("id", itemIds)
      .eq("status", "active")
      .eq("verification_status", "published");

    if (itemsError) {
      throw new AppError(
        `Failed to fetch ${itemType} items: ${itemsError.message}`,
        500,
      );
    }

    return {
      items: (items ?? []) as Record<string, unknown>[],
      pagination: calculatePaginationMeta(page, limit, total),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Admin: Insert a new content update
 */
export async function insertContentUpdate(input: AdminPublishUpdateInput & { source_id?: string | null; collected_data_id?: string | null }): Promise<ContentUpdateItem> {
  try {
    const insertData: Record<string, unknown> = {
      item_type: input.item_type,
      item_id: input.item_id,
      update_type: input.update_type,
      title: input.title,
      description: input.description || "",
      official_url: input.official_url || "",
      status: input.status || "published",
      source_id: input.source_id || null,
      collected_data_id: input.collected_data_id || null,
      published_at: (input.status === "published" || !input.status) ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("content_updates")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to insert content update: ${error.message}`,
        error.code === "23505" ? 409 : 500,
      );
    }

    return data as ContentUpdateItem;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Admin: Update content update status (approve/reject/publish)
 */
export async function updateContentUpdateStatus(id: string, action: AdminUpdateActionInput): Promise<ContentUpdateItem | null> {
  try {
    const updateData: Record<string, unknown> = {
      status: action.status,
    };

    if (action.status === "published") {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("content_updates")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Failed to update content update status: ${error.message}`,
        500,
      );
    }

    return data as ContentUpdateItem | null;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Admin: Get a single content update by ID
 */
export async function getContentUpdateById(id: string): Promise<ContentUpdateItem | null> {
  try {
    const { data, error } = await supabase
      .from("content_updates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Failed to fetch content update: ${error.message}`,
        500,
      );
    }

    return data as ContentUpdateItem | null;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}

/**
 * Admin: List all content updates (for admin panel)
 */
export async function getAllContentUpdates(query: {
  page: number;
  limit: number;
  status?: string;
}): Promise<ListResult<ContentUpdateItem>> {
  try {
    const { page, limit, status } = query;
    const offset = calculateOffset(page, limit);

    let sqlQuery = supabase
      .from("content_updates")
      .select("*", { count: "exact" });

    if (status && status.trim()) {
      sqlQuery = sqlQuery.eq("status", status.trim());
    }

    const { data, error, count } = await sqlQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(
        `Failed to fetch content updates: ${error.message}`,
        500,
      );
    }

    const total = count ?? 0;
    return {
      items: (data ?? []) as ContentUpdateItem[],
      pagination: calculatePaginationMeta(page, limit, total),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Content updates repository error: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
}
