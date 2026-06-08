import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import {
  checkSavedItem,
  deleteSavedItem,
  deleteSavedItemByItem,
  fetchSavedItems,
  saveItem,
} from "../services/saved-items.service";

export const listSavedItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

  const result = await fetchSavedItems(user.id, page, limit);
  sendSuccess(res, "Saved items fetched successfully", result.items, result.pagination);
});

export const saveItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const body = req.validatedBody as { itemId: string; itemType: string };
  const result = await saveItem(user.id, body.itemId, body.itemType);
  sendSuccess(res, "Item saved successfully", result);
});

export const removeSavedItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { id } = req.validatedParams as { id: string };
  const deleted = await deleteSavedItem(id, user.id);

  if (!deleted) {
    return sendError(res, "Saved item not found", 404);
  }

  sendSuccess(res, "Saved item removed successfully", { id });
});

export const checkSavedItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { itemType, itemId } = req.validatedParams as { itemType: string; itemId: string };
  const exists = await checkSavedItem(user.id, itemType, itemId);

  sendSuccess(res, "Saved item check completed", { saved: exists });
});

export const removeSavedItemByItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { itemType, itemId } = req.validatedParams as { itemType: string; itemId: string };
  const deleted = await deleteSavedItemByItem(user.id, itemType, itemId);

  if (!deleted) {
    return sendError(res, "Saved item not found", 404);
  }

  sendSuccess(res, "Saved item removed successfully", { itemType, itemId });
});
