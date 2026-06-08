import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { errorResponse } from "../utils/api-response";
import { AppError } from "../utils/app-error";
import { env } from "../config/env";

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
    res.status(err.statusCode).json(errorResponse(err.message, err.message));
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join(", ");
    res.status(400).json(errorResponse(`Validation failed: ${message}`, message));
    return;
  }

  // In production, don't leak internal error details
  const isProduction = env.NODE_ENV === "production";
  const safeMessage = isProduction ? "An unexpected error occurred" : (err instanceof Error ? err.message : "Unknown error");
  console.error("[Unhandled Error]", err instanceof Error ? err.stack || err.message : String(err));
  res.status(500).json(errorResponse(safeMessage));
}
