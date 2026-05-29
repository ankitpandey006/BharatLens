import type { Job } from "@/types/job";

export async function fetchJobs(): Promise<Job[]> {
  return [];
}

export async function fetchJobById(_id: string): Promise<Job | null> {
  void _id;
  return null;
}
