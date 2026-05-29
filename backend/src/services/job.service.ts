import { getAllJobs, getJobById, type JobItem } from "../repositories/job.repository";

export function fetchAllJobs(): JobItem[] {
  return getAllJobs();
}

export function fetchJobById(id: string): JobItem | undefined {
  return getJobById(id);
}
