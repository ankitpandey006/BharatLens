/**
 * AI Processing Controller
 *
 * Handles HTTP requests for AI processing of collected_data items.
 * All endpoints are admin-only protected.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import {
  processSingleItem,
  processPendingItems,
  recheckVerification,
  getProcessingLogs,
} from "../services/ai-processing.service";

/**
 * POST /api/ai-processing/process/:id
 * Process a single collected_data item through the AI pipeline.
 */
export const processSingleItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || id.trim().length === 0) {
    return sendError(res, "Item ID is required", 400);
  }

  const result = await processSingleItem(id);
  sendSuccess(res, "AI processing completed", result);
});

/**
 * POST /api/ai-processing/process-pending
 * Process all pending collected_data items in batch.
 * Query param: limit (default 10, max 50)
 */
export const processPendingItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as { limit?: string };
  const batchSize = Math.min(Math.max(1, parseInt(query.limit ?? "3", 10) || 3), 50);

  const result = await processPendingItems(batchSize);
  sendSuccess(res, `Batch AI processing completed: ${result.succeeded} succeeded, ${result.failed} failed`, result);
});

/**
 * GET /api/ai-processing/logs/:id
 * Get processing logs for a specific collected_data item.
 */
export const getProcessingLogsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || id.trim().length === 0) {
    return sendError(res, "Item ID is required", 400);
  }

  const logs = await getProcessingLogs(id);
  sendSuccess(res, "Processing logs fetched successfully", logs);
});

/**
 * POST /api/verification/recheck/:id
 * Re-run verification and duplicate detection on an already-processed item.
 */
export const recheckVerificationHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || id.trim().length === 0) {
    return sendError(res, "Item ID is required", 400);
  }

  const result = await recheckVerification(id);
  sendSuccess(res, "Verification recheck completed", result);
});
