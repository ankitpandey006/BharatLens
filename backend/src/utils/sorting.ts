export type SortDirection = "asc" | "desc";

export function sortItems<T extends Record<string, unknown>>(
  items: T[],
  sortBy?: string,
  order: SortDirection = "asc",
): T[] {
  if (!sortBy) {
    return items;
  }

  return [...items].sort((first, second) => {
    const left = first[sortBy];
    const right = second[sortBy];

    if (left === undefined || right === undefined) {
      return 0;
    }

    const valueA = String(left).toLowerCase();
    const valueB = String(right).toLowerCase();

    if (valueA < valueB) {
      return order === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });
}
