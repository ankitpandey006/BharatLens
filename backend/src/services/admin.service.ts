import {
  getPendingAdminContent,
  findAdminContentById,
  updateAdminContentStatus,
  type AdminContentItem,
} from "../repositories/admin.repository";
import { ContentStatus } from "../constants/status";

export function fetchPendingAdminContent(): AdminContentItem[] {
  return getPendingAdminContent();
}

export function approveAdminContent(id: string): AdminContentItem | undefined {
  return updateAdminContentStatus(id, ContentStatus.AdminApproved);
}

export function rejectAdminContent(id: string): AdminContentItem | undefined {
  return updateAdminContentStatus(id, ContentStatus.Rejected);
}

export function getAdminContentById(id: string): AdminContentItem | undefined {
  return findAdminContentById(id);
}
