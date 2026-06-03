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
import { AppError } from "../utils/app-error";

export interface SavedItemWithDetails extends SavedItem {
  item_details: Record<string, unknown> | null;
}

function getItemDetails(itemType: string, itemId: string): Promise<Record<string, unknown> | null> {
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

export async function fetchSavedItems(userId: string): Promise<SavedItemWithDetails[]> {
  const savedItems = await listSavedItems(userId);

  const itemsWithDetails = await Promise.all(
    savedItems.map(async (item) => ({
      ...item,
      item_details: await getItemDetails(item.item_type, item.item_id),
    })),
  );

  return itemsWithDetails;
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
