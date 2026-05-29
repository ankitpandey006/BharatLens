import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/api-response";
import { AppError } from "../utils/app-error";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(err as Error);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json(errorResponse(message));
}
