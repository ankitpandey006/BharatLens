export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
}

export function successResponse<T>(message: string, data: T, pagination?: PaginationMeta): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  };
}

export function errorResponse(message: string, error?: string): ErrorResponse {
  return {
    success: false,
    message,
    error: error ?? message,
  };
}
