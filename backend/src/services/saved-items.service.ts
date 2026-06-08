import {
  addSavedItem,
  findSavedItem,
  getSavedItemById,
  listSavedItems,
  removeSavedItem,
  removeSavedItemByItem,
  type SavedItemType,
  type SavedItem,
} from "../repositories/saved-items.repository";
import { getExamById } from "../repositories/exam.repository";
import { getJobById } from "../repositories/job.repository";
import { getSchemeById } from "../repositories/scheme.repository";
import { getScholarshipById } from "../repositories/scholarship.repository";
import type { PaginationMeta } from "../utils/api-response";

export interface SavedItemWithData extends SavedItem {
  item_data: Record<string, unknown> | null;
}

export interface PaginatedSavedItemsResult {
  items: SavedItemWithData[];
  pagination: PaginationMeta;
}

function getItemData(itemType: string, itemId: string): Promise<Record<string, unknown> | null> {
  switch (itemType) {
    case "scheme":
      return getSchemeById(itemId).then((item) => (item ? (item as unknown as Record<string, unknown>) : null));
    case "scholarship":
      return getScholarshipById(itemId).then((item) => (item ? (item as unknown as Record<string, unknown>) : null));
    case "job":
      return getJobById(itemId).then((item) => (item ? (item as unknown as Record<string, unknown>) : null));
    case "exam":
      return getExamById(itemId).then((item) => (item ? (item as unknown as Record<string, unknown>) : null));
    default:
      return Promise.resolve(null);
  }
}

export async function fetchSavedItems(userId: string, page = 1, limit = 20): Promise<PaginatedSavedItemsResult> {
  const { items: savedItems, total } = await listSavedItems(userId, page, limit);

  const itemsWithData = await Promise.all(
    savedItems.map(async (item) => ({
      ...item,
      item_data: await getItemData(item.item_type, item.item_id),
    })),
  );

  const totalPages = Math.ceil(total / limit);

  return {
    items: itemsWithData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function saveItem(userId: string, itemId: string, type: string) {
  const itemType = type as SavedItemType;
  const existing = await findSavedItem(userId, itemId, itemType);

  // If already saved, return the existing item instead of throwing error (duplicate-safe)
  if (existing) {
    return existing;
  }

  return addSavedItem(userId, itemId, itemType);
}

export async function deleteSavedItem(id: string, userId: string) {
  const deleted = await getSavedItemById(id, userId);
  if (!deleted) {
    return false;
  }

  return await removeSavedItem(id, userId);
}

export async function checkSavedItem(userId: string, itemType: string, itemId: string) {
  const existing = await findSavedItem(userId, itemId, itemType as SavedItemType);
  return Boolean(existing);
}

export async function deleteSavedItemByItem(userId: string, itemType: string, itemId: string) {
  return removeSavedItemByItem(userId, itemType as SavedItemType, itemId);
}
