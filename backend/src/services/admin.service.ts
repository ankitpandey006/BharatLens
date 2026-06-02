import type { AdminItemType, AdminItem, AdminItemUpdates } from "../repositories/admin.repository";
import {
  approveAdminContentById,
  deleteAdminContentById,
  expireAdminContentById,
  fetchAdminItemsByVerificationStatus,
  fetchAdminSources,
  fetchAdminStatsSummary,
  fetchAdminUpdates,
  fetchAdminUsers as fetchAdminUsersRepository,
  getAdminContentById,
  publishAdminContentById,
  rejectAdminContentById,
  unpublishAdminContentById,
  updateAdminContentById,
  verifyAdminSource,
} from "../repositories/admin.repository";
import { AppError } from "../utils/app-error";

export async function fetchAdminItemsByStatus(status: string, itemType?: AdminItemType): Promise<AdminItem[]> {
  return fetchAdminItemsByVerificationStatus(status, itemType);
}

export async function getAdminItemById(itemType: AdminItemType, itemId: string): Promise<AdminItem | null> {
  return getAdminContentById(itemType, itemId);
}

export async function approveAdminItem(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  return approveAdminContentById(itemType, itemId, adminId);
}

export async function rejectAdminItem(
  itemType: AdminItemType,
  itemId: string,
  adminId: string,
  rejectionReason?: string,
): Promise<AdminItem | null> {
  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw new AppError("Rejection reason is required", 400);
  }

  return rejectAdminContentById(itemType, itemId, adminId, rejectionReason);
}

export async function publishAdminItem(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  return publishAdminContentById(itemType, itemId, adminId);
}

export async function unpublishAdminItem(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  return unpublishAdminContentById(itemType, itemId, adminId);
}

export async function expireAdminItem(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  return expireAdminContentById(itemType, itemId, adminId);
}

export async function updateAdminItem(itemType: AdminItemType, itemId: string, updates: AdminItemUpdates): Promise<AdminItem | null> {
  return updateAdminContentById(itemType, itemId, updates);
}

export async function deleteAdminItem(itemType: AdminItemType, itemId: string): Promise<boolean> {
  return deleteAdminContentById(itemType, itemId);
}

export async function fetchAdminStats() {
  return fetchAdminStatsSummary();
}

export async function fetchAdminUsers() {
  return fetchAdminUsersRepository();
}

export async function fetchSourcesForAdmin() {
  return fetchAdminSources();
}

export async function verifySourceForAdmin(sourceId: string, adminId: string) {
  return verifyAdminSource(sourceId, adminId);
}

export async function fetchUpdatesForAdmin() {
  return fetchAdminUpdates();
}
