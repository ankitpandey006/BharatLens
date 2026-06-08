import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { getDashboardSummary } from "../services/dashboard.service";

/**
 * GET /api/dashboard/summary
 * Returns aggregated dashboard data for the authenticated user
 */
export const getDashboardSummaryHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const summary = await getDashboardSummary(user.id);
  sendSuccess(res, "Dashboard summary fetched successfully", summary);
});
