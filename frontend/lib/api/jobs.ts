import { get, ApiResponse } from "./client";

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location?: string;
  state?: string;
  category?: string;
  qualification: string;
  vacancies: number;
  deadline: string;
  official_url?: string;
  status: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all jobs
 */
export async function getJobs(query?: Record<string, any>): Promise<Job[]> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const path = `/api/jobs${queryString ? `?${queryString}` : ""}`;

  const response = await get<ApiResponse<Job[]>>(path);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch jobs");
  }

  return response.data || [];
}

/**
 * Fetch a single job by ID
 */
export async function getJobById(id: string): Promise<Job> {
  const response = await get<ApiResponse<Job>>(`/api/jobs/${id}`);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch job");
  }

  return response.data as Job;
}
