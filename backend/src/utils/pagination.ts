import type { PaginationMeta } from "../utils/api-response";

export function paginate<T>(items: T[], page = 1, limit = 20): {
  data: T[];
  pagination: PaginationMeta;
} {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.max(1, limit);
  const total = items.length;
  const totalPages = Math.ceil(total / normalizedLimit);
  const hasNextPage = normalizedPage < totalPages;
  const hasPreviousPage = normalizedPage > 1;
  const offset = (normalizedPage - 1) * normalizedLimit;
  const data = items.slice(offset, offset + normalizedLimit);

  return {
    data,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
}
