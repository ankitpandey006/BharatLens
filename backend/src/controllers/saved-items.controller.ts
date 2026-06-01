import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { deleteSavedItem, fetchSavedItems, saveItem } from "../services/saved-items.service";

export const listSavedItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.validatedParams as { userId: string };
  const result = await fetchSavedItems(userId);
  sendSuccess(res, "Saved items fetched successfully", result);
});

export const saveItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as { userId: string; itemId: string; type: string };
  const result = await saveItem(body.userId, body.itemId, body.type);
  sendSuccess(res, "Item saved successfully", result);
});

export const removeSavedItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const deleted = await deleteSavedItem(id);

  if (!deleted) {
    return sendError(res, "Saved item not found", 404);
  }

  sendSuccess(res, "Saved item removed successfully", { id });
});
