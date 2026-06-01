import { paginate } from "../utils/pagination";
import { searchAll, type SearchResult } from "../repositories/search.repository";
import type { PaginationMeta } from "../utils/api-response";

export async function performSearch(query: string, page = 1, limit = 20): Promise<{ data: SearchResult[]; pagination: PaginationMeta }> {
  const results = await searchAll(query);
  return paginate(results, page, limit);
}
