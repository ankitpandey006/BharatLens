import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import {
  approveAdminItem,
  deleteAdminItem,
  fetchAdminItemsByStatus,
  fetchAdminStats,
  fetchSourcesForAdmin,
  fetchUpdatesForAdmin,
  fetchAdminUsers,
  getAdminItemById,
  rejectAdminItem,
  updateAdminItem,
  publishAdminItem,
  unpublishAdminItem,
  expireAdminItem,
  verifySourceForAdmin,
  updateUserRoleInDb,
} from "../services/admin.service";
import type { AdminItemType, AdminItemUpdates } from "../repositories/admin.repository";

type AdminItemParams = { itemType: AdminItemType; itemId: string };

export const getAdminItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.params as { status: string };
  const query = req.validatedQuery as { itemType?: AdminItemType } | undefined;
  const items = await fetchAdminItemsByStatus(status, query?.itemType);
  sendSuccess(res, "Admin items fetched successfully", items);
});

export const getPendingAdminItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as { itemType?: AdminItemType } | undefined;
  const items = await fetchAdminItemsByStatus("pending", query?.itemType);
  sendSuccess(res, "Pending items fetched successfully", items);
});

export const getApprovedAdminItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as { itemType?: AdminItemType } | undefined;
  const items = await fetchAdminItemsByStatus("approved", query?.itemType);
  sendSuccess(res, "Approved items fetched successfully", items);
});

export const getRejectedAdminItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as { itemType?: AdminItemType } | undefined;
  const items = await fetchAdminItemsByStatus("rejected", query?.itemType);
  sendSuccess(res, "Rejected items fetched successfully", items);
});

export const getPublishedAdminItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as { itemType?: AdminItemType } | undefined;
  const items = await fetchAdminItemsByStatus("published", query?.itemType);
  sendSuccess(res, "Published items fetched successfully", items);
});

export const getAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const item = await getAdminItemById(itemType, itemId);

  if (!item) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Admin item fetched successfully", item);
});

export const approveAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await approveAdminItem(itemType, itemId, user.id);

  if (!item) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Item approved successfully", item);
});

export const rejectAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const { rejection_reason } = req.validatedBody as { rejection_reason: string };
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await rejectAdminItem(itemType, itemId, user.id, rejection_reason);

  if (!item) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Item rejected successfully", item);
});

export const publishAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await publishAdminItem(itemType, itemId, user.id);

  if (!item) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Item published successfully", item);
});

export const unpublishAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await unpublishAdminItem(itemType, itemId, user.id);

  if (!item) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Item unpublished successfully", item);
});

export const expireAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await expireAdminItem(itemType, itemId, user.id);

  if (!item) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Item expired successfully", item);
});

export const updateAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const updates = req.validatedBody as AdminItemUpdates;

  const item = await updateAdminItem(itemType, itemId, updates);

  if (!item) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Item updated successfully", item);
});

export const deleteAdminItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, itemId } = req.validatedParams as AdminItemParams;
  const deleted = await deleteAdminItem(itemType, itemId);

  if (!deleted) {
    return sendError(res, "Item not found", 404);
  }

  sendSuccess(res, "Item deleted successfully", { itemType, itemId });
});

export const getAdminStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await fetchAdminStats();
  sendSuccess(res, "Admin stats fetched successfully", stats);
});

export const getAdminUsersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const users = await fetchAdminUsers();
  sendSuccess(res, "Admin users fetched successfully", users);
});

export const getAdminSourcesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const sources = await fetchSourcesForAdmin();
  sendSuccess(res, "Sources fetched successfully", sources);
});

export const verifyAdminSourceHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { id } = req.validatedParams as { id: string };
  const source = await verifySourceForAdmin(id, user.id);

  if (!source) {
    return sendError(res, "Source not found", 404);
  }

  sendSuccess(res, "Source verified successfully", source);
});

export const getAdminUpdatesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const updates = await fetchUpdatesForAdmin();
  sendSuccess(res, "Updates fetched successfully", updates);
});

export const updateUserRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = req.user;

  if (!currentUser) {
    return sendError(res, "Authentication required", 401);
  }

  const { userId } = req.validatedParams as { userId: string };
  const { role, confirm } = req.validatedBody as { role: string; confirm?: boolean };

  if (userId === currentUser.id && role !== currentUser.role && !confirm) {
    return sendError(res, "Confirm required for self-demotion", 400);
  }

  const updated = await updateUserRoleInDb(userId, role, currentUser.id);

  if (!updated) {
    return sendError(res, "User not found", 404);
  }

  sendSuccess(res, "User role updated successfully", updated);
});
