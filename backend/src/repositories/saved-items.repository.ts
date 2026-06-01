export type SavedItemType = "scheme" | "scholarship" | "job" | "exam";

export interface SavedItem {
  id: string;
  userId: string;
  itemId: string;
  type: SavedItemType;
  savedAt: string;
}

export interface SavedItemsRepository {
  listSavedItems(userId: string): Promise<SavedItem[]>;
  addSavedItem(userId: string, itemId: string, type: SavedItemType): Promise<SavedItem>;
  removeSavedItem(id: string): Promise<boolean>;
}

const savedItems: SavedItem[] = [
  {
    id: "saved-001",
    userId: "user-001",
    itemId: "scheme-001",
    type: "scheme",
    savedAt: new Date().toISOString(),
  },
];

export async function listSavedItems(userId: string): Promise<SavedItem[]> {
  return savedItems.filter((item) => item.userId === userId);
}

export async function addSavedItem(userId: string, itemId: string, type: SavedItemType): Promise<SavedItem> {
  const savedItem: SavedItem = {
    id: `saved-${String(savedItems.length + 1).padStart(3, "0")}`,
    userId,
    itemId,
    type,
    savedAt: new Date().toISOString(),
  };

  savedItems.push(savedItem);
  return savedItem;
}

export async function removeSavedItem(id: string): Promise<boolean> {
  const index = savedItems.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  savedItems.splice(index, 1);
  return true;
}
