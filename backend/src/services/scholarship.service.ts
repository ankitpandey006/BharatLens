import { getAllScholarships, getScholarshipById, type ScholarshipItem } from "../repositories/scholarship.repository";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult } from "../types/query.types";

export async function fetchAllScholarships(query: ListQueryInput): Promise<ListResult<ScholarshipItem>> {
  return getAllScholarships(query);
}

export async function fetchScholarshipById(id: string): Promise<ScholarshipItem | null> {
  return getScholarshipById(id);
}
