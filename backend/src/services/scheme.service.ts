import { getAllSchemes, getSchemeById, type SchemeItem } from "../repositories/scheme.repository";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult } from "../types/query.types";

export async function fetchAllSchemes(query: ListQueryInput): Promise<ListResult<SchemeItem>> {
  return getAllSchemes(query);
}

export async function fetchSchemeById(id: string): Promise<SchemeItem | null> {
  return getSchemeById(id);
}
