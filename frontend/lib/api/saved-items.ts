import { get, post, del, ApiResponse } from "./client";

export interface SavedItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: "scheme" | "scholarship" | "job" | "exam";
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch saved items for current user
 */
export async function getSavedItems(): Promise<SavedItem[]> {
  const response = await get<ApiResponse<SavedItem[]>>("/api/saved");

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch saved items");
  }

  return response.data || [];
}

/**
 * Save an item
 */
export async function saveItem(
  itemId: string,
  itemType: "scheme" | "scholarship" | "job" | "exam",
  title: string
): Promise<SavedItem> {
  const response = await post<ApiResponse<SavedItem>>("/api/saved", {
    item_id: itemId,
    item_type: itemType,
    title,
  });

  if (!response.success) {
    throw new Error(response.message || "Failed to save item");
  }

  return response.data as SavedItem;
}

/**
 * Remove a saved item
 */
export async function removeSavedItem(itemId: string): Promise<void> {
  const response = await del<ApiResponse<void>>(`/api/saved/${itemId}`);

  if (!response.success) {
    throw new Error(response.message || "Failed to remove saved item");
  }
}
