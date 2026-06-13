import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { processCollectedData } from "../services/pipeline.service";

/**
 * POST /api/ai/process-collected-data
 * Trigger AI processing on pending collected data items.
 */
export const processCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  const limit = Math.min(Math.max(1, Number(query?.limit ?? 10)), 50);

  const result = await processCollectedData(limit);

  sendSuccess(res, "AI processing completed", {
    succeeded: result.succeeded,
    failed: result.failed,
    total: result.total,
    details: result.details,
  });
});
