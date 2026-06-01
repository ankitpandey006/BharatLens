import { getAllJobs, getJobById, type JobItem } from "../repositories/job.repository";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult } from "../types/query.types";

export async function fetchAllJobs(query: ListQueryInput): Promise<ListResult<JobItem>> {
  return getAllJobs(query);
}

export async function fetchJobById(id: string): Promise<JobItem | null> {
  return getJobById(id);
}
