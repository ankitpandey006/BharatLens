import { getAuthToken, clearAuthToken } from "@/lib/auth/storage";

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecommendationsListResponse {
  success: boolean;
  message?: string;
  data: {
    items: any[];
    count: number;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// API CLIENT
// ============================================================================

const DEFAULT_API_URL = "http://localhost:5001/api";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_API_URL;

function normalizePath(path: string) {
  if (path.startsWith("/api")) {
    return path.replace(/^\/api/, "");
  }
  return path;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = normalizePath(path);
  const url = `${BASE_URL}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    let body: any = null;

    if (contentType?.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    // Handle 401 - Unauthorized
    if (response.status === 401) {
      clearAuthToken();
      // Redirect to login if in browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Unauthorized. Please login again.");
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage =
        body?.message ||
        body?.error ||
        `API request failed with status ${response.status}`;
      throw new ApiError(response.status, errorMessage, body);
    }

    // Return body if it's already parsed JSON and has success flag (backend format)
    if (typeof body === "object" && body !== null && "success" in body) {
      if (!body.success && body.message) {
        throw new ApiError(response.status, body.message, body);
      }
      return body as T;
    }

    // Otherwise return body as-is
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(0, "Network error. Please check your connection.", error);
    }

    throw new ApiError(500, "An unexpected error occurred", error);
  }
}

export async function get<T>(path: string): Promise<T> {
  return request<T>(path, {
    method: "GET",
  });
}

export async function post<T>(
  path: string,
  body?: Record<string, any>
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function patch<T>(
  path: string,
  body?: Record<string, any>
): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function put<T>(
  path: string,
  body?: Record<string, any>
): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function del<T>(path: string): Promise<T> {
  return request<T>(path, {
    method: "DELETE",
  });
}

/**
 * Legacy compatibility - use specific methods (get, post, etc.) instead
 */
export async function apiClient<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  return request<T>(path, options);
}

