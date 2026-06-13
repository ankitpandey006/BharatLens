/**
 * Content Updates Service
 * Business logic for content_updates — public queries and admin operations
 */

import { getPublicUpdates, insertContentUpdate, updateContentUpdateStatus, getContentUpdateById, getAllContentUpdates, getUpdatesByItemId, getUpdatesByItemIds, getItemsByUpdateType, type ContentUpdateItem } from "../repositories/content-updates.repository";
import { insertAdminAction } from "../repositories/admin.repository";
import { insertAdminAuditLog } from "../repositories/audit.repository";
import { AppError } from "../utils/app-error";
import type { PublicUpdatesQuery, AdminPublishUpdateInput, AdminUpdateActionInput, UpdateType } from "../validators/content-updates.validator";
import type { ListResult } from "../types/query.types";

/**
 * Fetch public updates — only returns published records
 */
export async function fetchPublicUpdates(query: PublicUpdatesQuery): Promise<ListResult<ContentUpdateItem>> {
  return getPublicUpdates(query);
}

/**
 * Fetch published updates for a specific item
 */
export async function fetchUpdatesByItemId(itemType: string, itemId: string): Promise<ContentUpdateItem[]> {
  return getUpdatesByItemId(itemType, itemId);
}

/**
 * Fetch published updates for multiple items (batch)
 */
export async function fetchUpdatesByItemIds(itemType: string, itemIds: string[]): Promise<Map<string, ContentUpdateItem[]>> {
  return getUpdatesByItemIds(itemType, itemIds);
}

/**
 * Admin: Publish a new content update from collected_data
 */
export async function publishContentUpdate(input: AdminPublishUpdateInput, adminId: string, collectedDataId?: string): Promise<ContentUpdateItem> {
  // Normalize item_type — allow singular forms used in code
  let itemType = input.item_type as string;
  if (itemType === "schemes") itemType = "scheme";
  else if (itemType === "scholarships") itemType = "scholarship";
  else if (itemType === "jobs") itemType = "job";
  else if (itemType === "exams") itemType = "exam";

  const insertPayload = {
    ...input,
    item_type: itemType as AdminPublishUpdateInput["item_type"],
    source_id: input.source_id || null,
    collected_data_id: input.collected_data_id || collectedDataId || null,
  };

  const result = await insertContentUpdate(insertPayload);

  // Log admin action
  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: result.id,
      item_type: "collected_data" as any,
      action: "publish_update",
      detail: JSON.stringify({
        update_type: input.update_type,
        related_item_type: itemType,
        related_item_id: input.item_id,
      }),
    });
  } catch (err) {
    console.error("Failed to record admin action for publishContentUpdate", err);
  }

  // Log audit
  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "publish_update",
      entity_type: "content_updates",
      entity_id: result.id,
      previous_status: null,
      new_status: "published",
      changed_fields: { update_type: input.update_type, item_type: itemType, item_id: input.item_id },
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to write audit log for publishContentUpdate", err);
  }

  return result;
}

/**
 * Admin: Update content update status (approve/reject/publish)
 */
export async function updateUpdateStatus(id: string, action: AdminUpdateActionInput, adminId: string): Promise<ContentUpdateItem | null> {
  const prev = await getContentUpdateById(id);
  if (!prev) {
    throw new AppError("Content update not found", 404);
  }

  const result = await updateContentUpdateStatus(id, action);

  // Log admin action
  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: action.status === "approved" ? "approve_update" : (action.status === "rejected" ? "reject_update" : "publish_update"),
      detail: action.admin_notes || null,
    });
  } catch (err) {
    console.error("Failed to record admin action for updateUpdateStatus", err);
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: action.status === "approved" ? "approve_update" : (action.status === "rejected" ? "reject_update" : "publish_update"),
      entity_type: "content_updates",
      entity_id: id,
      previous_status: prev.status,
      new_status: action.status,
      changed_fields: null,
      reason: action.admin_notes || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to write audit log for updateUpdateStatus", err);
  }

  return result;
}

/**
 * Admin: Fetch all content updates (for admin panel)
 */
export async function fetchAllContentUpdates(query: {
  page: number;
  limit: number;
  status?: string;
}): Promise<ListResult<ContentUpdateItem>> {
  return getAllContentUpdates(query);
}

/**
 * Build update badges map for a set of exam/job items
 * Returns: { [itemId]: { apply: boolean, admit_card: boolean, result: boolean, notification: boolean } }
 */
export async function buildUpdateBadgesMap(itemType: string, itemIds: string[]): Promise<Record<string, { apply: boolean; admit_card: boolean; result: boolean; notification: boolean }>> {
  const updatesMap = await getUpdatesByItemIds(itemType, itemIds);
  const badges: Record<string, { apply: boolean; admit_card: boolean; result: boolean; notification: boolean }> = {};

  for (const [itemId, updates] of updatesMap) {
    const badge = { apply: false, admit_card: false, result: false, notification: false };
    for (const update of updates) {
      const ut = update.update_type as string;
      if (ut === "apply") badge.apply = true;
      else if (ut === "admit_card") badge.admit_card = true;
      else if (ut === "result") badge.result = true;
      else if (ut === "notification") badge.notification = true;
    }
    badges[itemId] = badge;
  }

  return badges;
}

/**
 * Build update links map (URLs for each update type)
 * Returns: { [itemId]: { apply?: string, admit_card?: string, result?: string, notification?: string } }
 */
export async function buildUpdateLinksMap(itemType: string, itemIds: string[]): Promise<Record<string, { apply?: string; admit_card?: string; result?: string; notification?: string }>> {
  const updatesMap = await getUpdatesByItemIds(itemType, itemIds);
  const links: Record<string, { apply?: string; admit_card?: string; result?: string; notification?: string }> = {};

  for (const [itemId, updates] of updatesMap) {
    const linkObj: { apply?: string; admit_card?: string; result?: string; notification?: string } = {};
    for (const update of updates) {
      const ut = update.update_type as string;
      if (update.official_url) {
        if (ut === "apply" && !linkObj.apply) linkObj.apply = update.official_url;
        else if (ut === "admit_card" && !linkObj.admit_card) linkObj.admit_card = update.official_url;
        else if (ut === "result" && !linkObj.result) linkObj.result = update.official_url;
        else if (ut === "notification" && !linkObj.notification) linkObj.notification = update.official_url;
      }
    }
    links[itemId] = linkObj;
  }

  return links;
}
