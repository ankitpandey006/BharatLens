export function searchItems<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  fields: Array<keyof T>,
): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    fields.some((field) => {
      const rawValue = item[field];
      return typeof rawValue === "string" && rawValue.toLowerCase().includes(normalizedQuery);
    }),
  );
}
