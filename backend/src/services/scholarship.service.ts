import { getAllScholarships, getScholarshipById, type ScholarshipItem } from "../repositories/scholarship.repository";

export function fetchAllScholarships(): ScholarshipItem[] {
  return getAllScholarships();
}

export function fetchScholarshipById(id: string): ScholarshipItem | undefined {
  return getScholarshipById(id);
}
