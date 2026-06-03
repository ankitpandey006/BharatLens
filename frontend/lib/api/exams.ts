import { get, ApiResponse } from "./client";

export interface Exam {
  id: string;
  title: string;
  description: string;
  state?: string;
  category: string;
  examBody: string;
  level: string;
  applicationWindow: string;
  notificationDate: string;
  deadline: string;
  official_url?: string;
  status: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all exams
 */
export async function getExams(query?: Record<string, any>): Promise<Exam[]> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const path = `/api/exams${queryString ? `?${queryString}` : ""}`;

  const response = await get<ApiResponse<Exam[]>>(path);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch exams");
  }

  return response.data || [];
}

/**
 * Fetch a single exam by ID
 */
export async function getExamById(id: string): Promise<Exam> {
  const response = await get<ApiResponse<Exam>>(`/api/exams/${id}`);

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch exam");
  }

  return response.data as Exam;
}
