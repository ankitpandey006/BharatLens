export type FilterParams = Record<string, string | number | boolean>;

export function filterItems<T extends Record<string, unknown>>(items: T[], filters: FilterParams): T[] {
  return items.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      const raw = item[key];

      if (raw === undefined || raw === null) {
        return false;
      }

      if (typeof value === "string") {
        return String(raw).toLowerCase().includes(value.toLowerCase());
      }

      return String(raw) === String(value);
    });
  });
}
