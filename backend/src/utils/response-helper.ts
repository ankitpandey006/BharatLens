import type { Response } from "express";
import { successResponse, errorResponse, type PaginationMeta } from "./api-response";

export function sendSuccess<T>(res: Response, message: string, data: T, pagination?: PaginationMeta): void {
  res.status(200).json(successResponse(message, data, pagination));
}

export function sendError(res: Response, message: string, statusCode = 400, errorDetail?: string): void {
  res.status(statusCode).json(errorResponse(message, errorDetail));
}
