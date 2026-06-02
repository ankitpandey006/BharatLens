import { supabase } from "../config/supabase";
import { AppError } from "../utils/app-error";

export type SavedItemType = "scheme" | "scholarship" | "job" | "exam";

export interface SavedItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: SavedItemType;
  saved_at?: string;
  updated_at?: string;
}

export interface SavedItemsRepository {
  listSavedItems(userId: string): Promise<SavedItem[]>;
  addSavedItem(userId: string, itemId: string, type: SavedItemType): Promise<SavedItem>;
  removeSavedItem(id: string, userId: string): Promise<boolean>;
  removeSavedItemByItem(userId: string, itemType: SavedItemType, itemId: string): Promise<boolean>;
  findSavedItem(userId: string, itemId: string, type: SavedItemType): Promise<SavedItem | null>;
  getSavedItemById(id: string, userId: string): Promise<SavedItem | null>;
}

export async function listSavedItems(userId: string): Promise<SavedItem[]> {
  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch saved items: ${error.message}`, 500);
  }

  return (data ?? []) as SavedItem[];
}

export async function addSavedItem(userId: string, itemId: string, type: SavedItemType): Promise<SavedItem> {
  const existing = await findSavedItem(userId, itemId, type);

  if (existing) {
    throw new AppError("Item is already saved", 409);
  }

  const { data, error } = await supabase
    .from("saved_items")
    .insert({ user_id: userId, item_id: itemId, item_type: type })
    .select()
    .maybeSingle();

  if (error || !data) {
    throw new AppError(`Failed to save item: ${error?.message ?? "Unknown error"}`, 500);
  }

  return data as SavedItem;
}

export async function removeSavedItem(id: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to remove saved item: ${error.message}`, 500);
  }

  return Boolean(data);
}

export async function removeSavedItemByItem(userId: string, itemType: SavedItemType, itemId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_items")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to remove saved item: ${error.message}`, 500);
  }

  return Boolean(data);
}

export async function findSavedItem(userId: string, itemId: string, type: SavedItemType): Promise<SavedItem | null> {
  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .eq("item_type", type)
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to check saved item: ${error.message}`, 500);
  }

  return data as SavedItem | null;
}

export async function getSavedItemById(id: string, userId: string): Promise<SavedItem | null> {
  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to fetch saved item: ${error.message}`, 500);
  }

  return data as SavedItem | null;
}
