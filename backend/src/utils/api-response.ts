export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
}

export function successResponse<T>(message: string, data: T): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message: string): ErrorResponse {
  return {
    success: false,
    message,
  };
}
