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
  fetchCollectedDataForAdmin,
  getCollectedDataForAdmin,
  approveCollectedData,
  rejectCollectedData,
  editCollectedData,
  publishCollectedData,
  unpublishCollectedData,
  deleteCollectedData,
  bulkApproveCollectedData,
  bulkRejectCollectedData,
  bulkPublishCollectedData,
  bulkUnpublishCollectedData,
  bulkRestoreCollectedData,
  bulkDeleteCollectedData,
  bulkProcessAiCollectedData,
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

  // rejection_reason is guaranteed to exist due to our validator transform
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

export const getAdminCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as { page?: number; limit?: number; status?: string } | undefined;
  const page = Number(query?.page || 1);
  const limit = Number(query?.limit || 20);
  const status = query?.status ? String(query.status).trim() : undefined;
  const result = await fetchCollectedDataForAdmin(page, limit, status || "pending");
  // dev logs
  // eslint-disable-next-line no-console
  console.debug("Admin collected-data fetched", { count: result.items.length });
  sendSuccess(res, "Collected data fetched successfully", result);
});

export const getAdminCollectedDataByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const item = await getCollectedDataForAdmin(id);

  if (!item) {
    return sendError(res, "Collected data not found", 404);
  }

  sendSuccess(res, "Collected data fetched successfully", item);
});

export const approveCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const body = req.validatedBody as Record<string, unknown>;
  const admin_notes = body.admin_notes as string | undefined;
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  // Extract editable fields (everything except admin_notes which goes to the notes field)
  const edits: Record<string, unknown> = {};
  const editFields = [
    "title", "description", "sub_category", "content_action", "category", "item_type",
    "state", "deadline", "official_url", "source_url",
    "eligibility", "benefits", "organization", "vacancies",
    "education", "age_limit", "salary", "application_fee",
    "selection_process", "conducting_body", "exam_date",
    "amount", "income_limit", "education_level",
    "required_documents", "start_date",
  ];
  for (const field of editFields) {
    if (body[field] !== undefined) {
      edits[field] = body[field];
    }
  }

  const item = await approveCollectedData(id, user.id, admin_notes, Object.keys(edits).length > 0 ? edits : undefined);

  if (!item) {
    return sendError(res, "Collected data not found", 404);
  }

  sendSuccess(res, "Collected data approved with latest changes", item);
});

export const rejectCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { rejection_reason, admin_notes } = req.validatedBody as { rejection_reason?: string; admin_notes?: string };
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await rejectCollectedData(id, user.id, rejection_reason, admin_notes);

  if (!item) {
    return sendError(res, "Collected data not found", 404);
  }

  sendSuccess(res, "Collected data rejected", item);
});

export const editCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const updates = req.validatedBody as Record<string, unknown>;
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await editCollectedData(id, updates, user.id);

  if (!item) {
    return sendError(res, "Collected data not found", 404);
  }

  sendSuccess(res, "Collected data updated", item);
});

export const unpublishCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const item = await unpublishCollectedData(id, user.id);

  if (!item) {
    return sendError(res, "Collected data not found", 404);
  }

  sendSuccess(res, "Collected data unpublished", item);
});

export const deleteCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const deleted = await deleteCollectedData(id, user.id);

  if (!deleted) {
    return sendError(res, "Collected data not found", 404);
  }

  sendSuccess(res, "Collected data deleted", { id });
});

export const publishCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { itemType, payload } = req.validatedBody as { itemType: string; payload: Record<string, unknown> };
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const inserted = await publishCollectedData(id, itemType, payload, user.id);

  sendSuccess(res, "Collected data published", inserted);
});

// ─── Bulk Action Handlers ─────────────────────────────────────────

export const bulkApproveHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, "Authentication required", 401);

  const { ids, reason } = req.validatedBody as { ids: string[]; reason?: string };
  const result = await bulkApproveCollectedData(ids, user.id, reason);
  sendSuccess(res, "Bulk approve completed", result);
});

export const bulkRejectHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, "Authentication required", 401);

  const { ids, reason } = req.validatedBody as { ids: string[]; reason?: string };
  const result = await bulkRejectCollectedData(ids, user.id, reason);
  sendSuccess(res, "Bulk reject completed", result);
});

export const bulkPublishHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, "Authentication required", 401);

  const { ids } = req.validatedBody as { ids: string[] };
  const result = await bulkPublishCollectedData(ids, user.id);
  sendSuccess(res, "Bulk publish completed", result);
});

export const bulkUnpublishHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, "Authentication required", 401);

  const { ids } = req.validatedBody as { ids: string[] };
  const result = await bulkUnpublishCollectedData(ids, user.id);
  sendSuccess(res, "Bulk unpublish completed", result);
});

export const bulkRestoreHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, "Authentication required", 401);

  const { ids } = req.validatedBody as { ids: string[] };
  const result = await bulkRestoreCollectedData(ids, user.id);
  sendSuccess(res, "Bulk restore completed", result);
});

export const bulkDeleteHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, "Authentication required", 401);

  const { ids } = req.validatedBody as { ids: string[] };
  const result = await bulkDeleteCollectedData(ids, user.id);
  sendSuccess(res, "Bulk delete completed", result);
});

export const bulkProcessAiHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return sendError(res, "Authentication required", 401);

  const { ids } = req.validatedBody as { ids: string[] };
  const result = await bulkProcessAiCollectedData(ids, user.id);
  sendSuccess(res, "Bulk AI processing initiated", result);
});
