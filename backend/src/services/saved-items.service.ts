import { addSavedItem, listSavedItems, removeSavedItem } from "../repositories/saved-items.repository";

export async function fetchSavedItems(userId: string) {
  return listSavedItems(userId);
}

export async function saveItem(userId: string, itemId: string, type: string) {
  return addSavedItem(userId, itemId, type as any);
}

export async function deleteSavedItem(id: string) {
  return removeSavedItem(id);
}
