/**
 * Content Updates Controller
 * Handles public API and admin operations for content_updates
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchPublicUpdates, publishContentUpdate, updateUpdateStatus, fetchAllContentUpdates } from "../services/content-updates.service";
import type { PublicUpdatesQuery, AdminPublishUpdateInput, AdminUpdateActionInput } from "../validators/content-updates.validator";

/**
 * GET /api/updates — Public API to fetch published updates
 * Query params: page, limit, itemType, updateType
 */
export const getPublicUpdatesHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as PublicUpdatesQuery;
  const result = await fetchPublicUpdates(query);
  sendSuccess(res, "Updates fetched successfully", result.items, result.pagination);
});

/**
 * POST /api/admin/updates — Admin: publish a new content update
 */
export const publishUpdateHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const input = req.validatedBody as AdminPublishUpdateInput;
  const collectedDataId = req.body?.collected_data_id || req.query?.collectedDataId as string | undefined;

  const result = await publishContentUpdate(input, user.id, collectedDataId);
  sendSuccess(res, "Content update published successfully", result);
});

/**
 * PATCH /api/admin/updates/:id/status — Admin: approve/reject/publish a content update
 */
export const updateUpdateStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { id } = req.params as { id: string };
  const action = req.validatedBody as AdminUpdateActionInput;

  const result = await updateUpdateStatus(id, action, user.id);
  if (!result) {
    return sendError(res, "Content update not found", 404);
  }

  sendSuccess(res, `Content update ${action.status} successfully`, result);
});

/**
 * GET /api/admin/updates — Admin: fetch all content updates
 */
export const getAdminUpdatesHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as { page?: number; limit?: number; status?: string };
  const page = Number(query?.page || 1);
  const limit = Number(query?.limit || 20);
  const status = query?.status || undefined;

  const result = await fetchAllContentUpdates({ page, limit, status });
  sendSuccess(res, "Content updates fetched successfully", result.items, result.pagination);
});
