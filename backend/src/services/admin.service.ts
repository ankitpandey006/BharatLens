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
  updateUserRole,
} from "../repositories/admin.repository";
import {
  listCollectedData,
  getCollectedDataById,
  updateCollectedDataById,
  publishToTable,
  type CollectedDataRow,
} from "../repositories/collected-data.repository";
import { insertAdminAction } from "../repositories/admin.repository";
import { supabase } from "../config/supabase";
import { insertAdminAuditLog } from "../repositories/audit.repository";
import { AppError } from "../utils/app-error";

function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const err = error as Record<string, unknown>;
    return (
      (typeof err.message === "string" && err.message) ||
      (typeof err.details === "string" && err.details) ||
      (typeof err.hint === "string" && err.hint) ||
      JSON.stringify(err)
    );
  }
  return String(error);
}

function isValidOptionalUrl(value?: string | null) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeCollectedDataRow(row: any, fallbackType = "scheme"): AdminItem {
  const sourceUrl = row.official_url || row.source_url || (row as any).sources?.source_url || row.raw_url || "";

  return {
    id: row.id,
    title: row.raw_title || "Untitled Item",
    description: row.raw_content || "",
    official_url: row.official_url || sourceUrl,
    source_url: sourceUrl,
    source_id: row.source_id ?? null,
    source_name: (row as any).sources?.source_name || row.source_name || "Unknown Source",
    type: row.item_type || row.content_type || fallbackType,
    item_type: row.item_type || fallbackType,
    status: row.verification_status ?? null,
    verification_status: row.verification_status ?? null,
    approved_by: row.approved_by ?? null,
    approved_at: row.approved_at ?? null,
    rejected_by: row.rejected_by ?? null,
    rejected_at: row.rejected_at ?? null,
    rejection_reason: row.rejection_reason ?? null,
    published_by: row.published_by ?? null,
    published_at: row.published_at ?? null,
    unpublished_at: row.unpublished_at ?? null,
    deleted_at: row.deleted_at ?? null,
    is_deleted: Boolean(row.is_deleted),
    created_at: row.created_at,
    updated_at: row.updated_at,
  } as AdminItem;
}

function extractMissingColumnName(message: string): string | null {
  const regex1 = /column\s+"?([a-zA-Z0-9_]+)"?\s+does not exist/i;
  const regex2 = /Could not find the '([a-zA-Z0-9_]+)' column/i;
  const match = message.match(regex1) ?? message.match(regex2);
  return match?.[1] ?? null;
}

async function updateCollectedDataWithFallback(
  id: string,
  updates: Record<string, unknown>,
): Promise<CollectedDataRow | null> {
  const pending = { ...updates };

  while (Object.keys(pending).length > 0) {
    try {
      return await updateCollectedDataById(id, pending);
    } catch (error) {
      const message = getErrorMessage(error);
      const missingColumn = extractMissingColumnName(message);

      if (!missingColumn || !(missingColumn in pending)) {
        throw error;
      }

      delete pending[missingColumn];
    }
  }

  return getCollectedDataById(id);
}

const PUBLIC_TABLE_NAME_BY_ITEM_TYPE: Record<string, string> = {
  scheme: "schemes",
  scholarship: "scholarships",
  job: "jobs",
  exam: "exams",
  notification: "notifications",
};

const PUBLIC_TABLE_ALLOWED_COLUMNS: Record<string, string[]> = {
  schemes: [
    "title",
    "description",
    "state",
    "category",
    "benefit",
    "status",
    "deadline",
    "official_url",
    "apply_url",
    "source_url",
    "search_text",
    "source_id",
    "verification_status",
    "approved_by",
    "approved_at",
    "is_expired",
    "expired_at",
    "created_at",
    "updated_at",
  ],
  scholarships: [
    "title",
    "description",
    "state",
    "category",
    "education_level",
    "benefit",
    "status",
    "deadline",
    "official_url",
    "apply_url",
    "source_url",
    "search_text",
    "source_id",
    "verification_status",
    "approved_by",
    "approved_at",
    "rejection_reason",
    "is_expired",
    "expired_at",
    "created_at",
    "updated_at",
  ],
  jobs: [
    "title",
    "description",
    "department",
    "state",
    "category",
    "qualification",
    "vacancies",
    "status",
    "deadline",
    "official_url",
    "apply_url",
    "source_url",
    "search_text",
    "source_id",
    "verification_status",
    "approved_by",
    "approved_at",
    "rejection_reason",
    "is_expired",
    "expired_at",
    "created_at",
    "updated_at",
  ],
  exams: [
    "exam_name",
    "description",
    "conducting_body",
    "state",
    "category",
    "notification_date",
    "application_start_date",
    "application_end_date",
    "admit_card_date",
    "result_date",
    "status",
    "official_url",
    "apply_url",
    "source_url",
    "search_text",
    "source_id",
    "verification_status",
    "approved_by",
    "approved_at",
    "rejection_reason",
    "is_expired",
    "expired_at",
    "created_at",
    "updated_at",
  ],
};

function cleanPublishPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        continue;
      }
      cleaned[key] = trimmedValue;
      continue;
    }

    cleaned[key] = value;
  }

  return cleaned;
}

function buildPublishPayload(
  itemType: string,
  payload: Record<string, unknown>,
  prev: Record<string, unknown>,
  adminId: string,
): Record<string, unknown> {
  // Normalize title from multiple sources
  const normalizedTitle =
    String(payload.title ?? "").trim() ||
    String(prev.raw_title ?? "").trim() ||
    String(prev.title ?? "").trim() ||
    String((prev as any).name ?? "").trim() ||
    String((prev.raw_data as any)?.title ?? "").trim() ||
    "";

  // Normalize description from multiple sources
  const normalizedDescription =
    String(payload.description ?? "").trim() ||
    String(payload.summary ?? "").trim() ||
    String(prev.raw_content ?? "").trim() ||
    String(prev.description ?? "").trim() ||
    String(prev.summary ?? "").trim() ||
    String((prev as any).content ?? "").trim() ||
    String((prev.raw_data as any)?.description ?? "").trim() ||
    String((prev.raw_data as any)?.summary ?? "").trim() ||
    String((prev.raw_data as any)?.content ?? "").trim() ||
    normalizedTitle; // Fallback to title if description still missing

  // Normalize official_url from multiple sources
  const normalizedOfficialUrl =
    String(payload.official_url ?? "").trim() ||
    String(payload.apply_url ?? "").trim() ||
    String(payload.source_url ?? "").trim() ||
    String(payload.link ?? "").trim() ||
    String(prev.official_url ?? "").trim() ||
    String(prev.apply_url ?? "").trim() ||
    String(prev.source_url ?? "").trim() ||
    String(prev.raw_url ?? "").trim() ||
    String((prev as any).url ?? "").trim() ||
    String((prev.raw_data as any)?.official_url ?? "").trim() ||
    String((prev.raw_data as any)?.apply_url ?? "").trim() ||
    String((prev.raw_data as any)?.url ?? "").trim() ||
    "";

  // Normalize apply_url (defaults to official_url if not specified separately)
  const normalizedApplyUrl =
    String(payload.apply_url ?? "").trim() ||
    String(prev.apply_url ?? "").trim() ||
    String((prev.raw_data as any)?.apply_url ?? "").trim() ||
    normalizedOfficialUrl;

  // Normalize source_url (for reference)
  const normalizedSourceUrl =
    String(payload.source_url ?? "").trim() ||
    String(prev.source_url ?? "").trim() ||
    String(prev.raw_url ?? "").trim() ||
    String((prev.raw_data as any)?.source_url ?? "").trim() ||
    "";

  const source_id = payload.source_id ?? prev.source_id;
  const now = new Date().toISOString();

  const category = String(payload.category ?? prev.category ?? "General").trim();
  const state = String(payload.state ?? prev.state ?? "All India").trim();
  const deadline = String(payload.deadline ?? prev.deadline ?? "").trim();

  const basePayload: Record<string, unknown> = {
    title: normalizedTitle,
    description: normalizedDescription,
    official_url: normalizedOfficialUrl,
    apply_url: normalizedApplyUrl,
    source_url: normalizedSourceUrl,
    source_id,
    status: "active",
    verification_status: "published",
    approved_by: adminId,
    approved_at: now,
    search_text: `${normalizedTitle} ${normalizedDescription} ${category} ${state}`.trim(),
  };

  if (itemType === "scheme") {
    basePayload.category = category;
    basePayload.state = state;
    basePayload.benefit = payload.benefit ?? prev.benefit ?? null;
    basePayload.deadline = deadline;
  }

  if (itemType === "scholarship") {
    basePayload.category = category;
    basePayload.state = state;
    basePayload.education_level = payload.education_level ?? prev.education_level ?? null;
    basePayload.benefit = payload.benefit ?? prev.benefit ?? null;
    basePayload.deadline = deadline;
  }

  if (itemType === "job") {
    basePayload.department = payload.department ?? payload.organization ?? prev.department ?? prev.organization ?? null;
    basePayload.state = state;
    basePayload.category = category;
    basePayload.qualification = payload.qualification ?? prev.qualification ?? null;
    basePayload.vacancies = payload.vacancies ?? prev.vacancies ?? null;
    basePayload.deadline = deadline;
  }

  if (itemType === "exam") {
    basePayload.exam_name = payload.exam_name ?? payload.title ?? prev.raw_title ?? null;
    basePayload.conducting_body =
      payload.conducting_body ?? payload.conductingBody ?? prev.conducting_body ?? prev.conductingBody ?? null;
    basePayload.state = state;
    basePayload.category = category;
    basePayload.notification_date = payload.notification_date ?? payload.notificationDate ?? prev.notification_date ?? prev.notificationDate ?? null;
    basePayload.application_start_date =
      payload.application_start_date ?? payload.applicationStartDate ?? prev.application_start_date ?? prev.applicationStartDate ?? null;
    basePayload.application_end_date =
      payload.application_end_date ?? payload.applicationEndDate ?? prev.application_end_date ?? prev.applicationEndDate ?? null;
    basePayload.admit_card_date = payload.admit_card_date ?? prev.admit_card_date ?? null;
    basePayload.result_date = payload.result_date ?? prev.result_date ?? null;
  }

  const publicTable = PUBLIC_TABLE_NAME_BY_ITEM_TYPE[itemType] ?? itemType;
  const allowedColumns = PUBLIC_TABLE_ALLOWED_COLUMNS[publicTable] ?? [];

  const filteredPayload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(basePayload)) {
    if (allowedColumns.includes(key)) {
      filteredPayload[key] = value;
    }
  }

  return cleanPublishPayload(filteredPayload);
}

async function insertTableRecordWithFallback(table: string, payload: Record<string, unknown>) {
  let attemptPayload = { ...payload };

  while (Object.keys(attemptPayload).length > 0) {
    try {
      return await publishToTable(table, attemptPayload);
    } catch (error) {
      const message = getErrorMessage(error);
      const missingColumn = extractMissingColumnName(message);

      if (!missingColumn || !(missingColumn in attemptPayload)) {
        throw error;
      }
      delete attemptPayload[missingColumn];
    }
  }

  throw new AppError(`Failed to publish to ${table}: no supported payload fields remain`, 500);
}

async function updateTableRecordWithFallback(
  table: string,
  id: string,
  payload: Record<string, unknown>,
) {
  let attemptPayload = { ...payload };
  while (Object.keys(attemptPayload).length > 0) {
    const { data, error } = await supabase.from(table).update(attemptPayload).eq("id", id).select().maybeSingle();
    if (!error) {
      return data;
    }

    const message = getErrorMessage(error);
    const missingColumn = extractMissingColumnName(message);

    if (!missingColumn || !(missingColumn in attemptPayload)) {
      throw new AppError(`Failed to update existing ${table} record: ${message}`, 500);
    }

    delete attemptPayload[missingColumn];
  }

  const { data, error } = await supabase.from(table).select().eq("id", id).maybeSingle();
  if (error) {
    throw new AppError(`Failed to fetch existing ${table} record: ${getErrorMessage(error)}`, 500);
  }

  return data;
}

async function findExistingPublishedRecordId(
  table: string,
  prev: CollectedDataRow,
  itemType: string,
): Promise<string | null> {
  const publishedId = String(prev.published_item_id || "").trim();
  if (publishedId) {
    return publishedId;
  }

  if (prev.raw_url) {
    const { data: existingByUrl, error: urlError } = await supabase
      .from(table)
      .select("id")
      .eq("official_url", prev.raw_url)
      .maybeSingle();
    if (!urlError && existingByUrl?.id) {
      return existingByUrl.id;
    }
  }

  const titleField = itemType === "exam" ? "exam_name" : "title";
  if (prev.raw_title) {
    const { data: existingByTitle, error: titleError } = await supabase
      .from(table)
      .select("id")
      .eq(titleField, prev.raw_title)
      .maybeSingle();
    if (!titleError && existingByTitle?.id) {
      return existingByTitle.id;
    }
  }

  return null;
}

async function deletePublishedRecord(
  publicTable: string,
  publishedId: string | null,
  prev: CollectedDataRow,
  itemType: string,
) {
  let targetId = publishedId;
  if (!targetId) {
    targetId = await findExistingPublishedRecordId(publicTable, prev, itemType);
  }

  if (!targetId) {
    return;
  }

  const { error } = await supabase.from(publicTable).delete().eq("id", targetId).select();
  if (error) {
    throw new AppError(`Failed to delete published record in ${publicTable}: ${getErrorMessage(error)}`, 500);
  }
}

export async function fetchAdminItemsByStatus(status: string, itemType?: AdminItemType): Promise<AdminItem[]> {
  // Prefer collected_data as the single source of truth for admin workflows.
  // Return mapped collected_data rows matching verification_status.
  try {
    const page = 1;
    const limit = 200;
    const verification = String(status || "pending").toLowerCase();
    const { items } = await listCollectedData(page, limit, verification);

    return items.map((row) => normalizeCollectedDataRow(row));
  } catch (err) {
    // fallback to older implementation if something goes wrong
    return fetchAdminItemsByVerificationStatus(status, itemType);
  }
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

export async function fetchCollectedDataForAdmin(page = 1, limit = 20, verificationStatus = "pending") {
  const result = await listCollectedData(page, limit, verificationStatus);
  return {
    total: result.total,
    items: result.items.map((row) => normalizeCollectedDataRow(row)),
  };
}

export async function getCollectedDataForAdmin(id: string) {
  const row = await getCollectedDataById(id);
  if (!row) return null;
  return normalizeCollectedDataRow(row);
}

export async function approveCollectedData(id: string, adminId: string, adminNotes?: string) {
  const prev = await getCollectedDataById(id);
  // eslint-disable-next-line no-console
  console.debug("approveCollectedData called", { id, found: Boolean(prev) });
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  // Only update existing columns. Never add title/description/item_type unless they already exist in collected_data.
  const updates: Record<string, unknown> = {
    verification_status: "approved",
    approved_by: adminId,
    approved_at: new Date().toISOString(),
    admin_notes: adminNotes ?? null,
  };

  // Only set these if they already exist in the collected_data row
  if (prev.title !== undefined) {
    updates.title = prev.title;
  }
  if (prev.description !== undefined) {
    updates.description = prev.description;
  }
  if (prev.item_type !== undefined) {
    updates.item_type = prev.item_type;
  }

  const updated = await updateCollectedDataWithFallback(id, updates);

  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "approve",
      detail: null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to record admin action for approveCollectedData", err);
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "approve",
      entity_type: "collected_data",
      entity_id: id,
      previous_status: prev?.verification_status ?? null,
      new_status: updated?.verification_status ?? "approved",
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log for approveCollectedData", err);
  }

  // eslint-disable-next-line no-console
  console.debug("approveCollectedData result", { id, new_status: updated?.verification_status });

  return updated;
}

export async function rejectCollectedData(id: string, adminId: string, reason?: string, adminNotes?: string) {
  const prev = await getCollectedDataById(id);
  // eslint-disable-next-line no-console
  console.debug("rejectCollectedData called", { id, found: Boolean(prev), reason });
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  const updated = await updateCollectedDataWithFallback(id, {
    verification_status: "rejected",
    rejection_reason: reason ?? null,
    rejected_by: adminId,
    rejected_at: new Date().toISOString(),
    admin_notes: adminNotes ?? reason ?? null,
  });

  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "reject",
      detail: reason ?? adminNotes ?? null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to record admin action for rejectCollectedData", err);
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "reject",
      entity_type: "collected_data",
      entity_id: id,
      previous_status: prev?.verification_status ?? null,
      new_status: updated?.verification_status ?? "rejected",
      changed_fields: null,
      reason: reason ?? adminNotes ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log for rejectCollectedData", err);
  }

  // eslint-disable-next-line no-console
  console.debug("rejectCollectedData result", { id, new_status: updated?.verification_status });

  return updated;
}

export async function editCollectedData(id: string, updates: Record<string, unknown>, adminId?: string) {
  const prev = await getCollectedDataById(id);
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  const urlFields: Array<keyof Record<string, unknown>> = [
    "official_url",
    "source_url",
    "raw_url",
    "sourceUrl",
    "link",
  ];

  for (const field of urlFields) {
    const rawValue = updates[field];
    if (rawValue === undefined || rawValue === null) continue;
    const value = String(rawValue).trim();
    if (value && !isValidOptionalUrl(value)) {
      throw new AppError("Official URL must be a valid http or https URL", 400);
    }
  }

  const normalizedUpdates: Record<string, unknown> = {
    ...updates,
  };

  if (updates.summary && !("description" in updates)) {
    normalizedUpdates.description = updates.summary;
    delete normalizedUpdates.summary;
  }

  if (updates.link && !("official_url" in updates) && !("source_url" in updates)) {
    normalizedUpdates.official_url = updates.link;
    delete normalizedUpdates.link;
  }

  // Keep official_url, source_url, and raw_url as separate columns.
  // Only merge into raw_url if raw_url itself wasn't explicitly provided.
  if (!normalizedUpdates.raw_url) {
    normalizedUpdates.raw_url =
      normalizedUpdates.official_url ?? normalizedUpdates.source_url ?? normalizedUpdates.raw_url;
  }
  // If official_url or source_url were provided, keep them as-is
  // so the editCollectedData endpoint preserves all three URL fields

  const cleanedUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(normalizedUpdates)) {
    if (value === undefined) continue;
    cleanedUpdates[key] = value === "" ? null : value;
  }

  const updated = await updateCollectedDataWithFallback(id, cleanedUpdates);

  if (updated && String(prev.verification_status || "").toLowerCase() === "published") {
    const itemType = String(prev.item_type || "scheme");
    const publicTable = PUBLIC_TABLE_NAME_BY_ITEM_TYPE[itemType];
    const updatedRawUrl = String(updated.raw_url || "").trim();
    if (publicTable && updatedRawUrl) {
      const publishedId = prev.published_item_id ?? null;
      const existingPublishedId = publishedId || (await findExistingPublishedRecordId(publicTable, prev, itemType));
      if (existingPublishedId) {
        await updateTableRecordWithFallback(publicTable, existingPublishedId, {
          official_url: updatedRawUrl,
        });
      }
    }
  }

  // compute changed fields
  const changed: Record<string, unknown> = {};
  for (const key of Object.keys(normalizedUpdates)) {
    // @ts-ignore
    const prevVal = prev[key];
    const newVal = normalizedUpdates[key];
    if (String(prevVal) !== String(newVal)) {
      changed[key] = { previous: prevVal, new: newVal };
    }
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId ?? "system",
      action: "edit",
      entity_type: "collected_data",
      entity_id: id,
      previous_status: prev?.processing_status ?? null,
      new_status: updated?.processing_status ?? null,
      changed_fields: Object.keys(changed).length ? changed : null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log for editCollectedData", err);
  }

  return updated;
}

export async function unpublishCollectedData(id: string, adminId: string) {
  const prev = await getCollectedDataById(id);
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  const itemType = String(prev.item_type || "scheme");
  const publicTable = PUBLIC_TABLE_NAME_BY_ITEM_TYPE[itemType];
  const publishedId = prev.published_item_id ?? null;

  if (!publicTable) {
    throw new AppError("Unable to resolve public table for unpublish", 500);
  }

  try {
    await deletePublishedRecord(publicTable, publishedId, prev, itemType);
    // eslint-disable-next-line no-console
    console.debug("Unpublish deleted public record", { publicTable, publishedId });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error deleting published record during unpublish", err);
  }

  const updated = await updateCollectedDataWithFallback(id, {
    verification_status: "approved",
    published_item_id: null,
    published_by: null,
    published_at: null,
    unpublished_at: new Date().toISOString(),
  });

  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "unpublish",
      detail: null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to record admin action for unpublishCollectedData", err);
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "unpublish",
      entity_type: "collected_data",
      entity_id: id,
      previous_status: prev?.verification_status ?? null,
      new_status: updated?.verification_status ?? "approved",
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log for unpublishCollectedData", err);
  }

  return updated;
}

export async function deleteCollectedData(id: string, adminId: string) {
  const prev = await getCollectedDataById(id);
  // eslint-disable-next-line no-console
  console.debug("deleteCollectedData called", { id, found: Boolean(prev) });
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  const itemType = String(prev.item_type || "scheme");
  const publicTable = PUBLIC_TABLE_NAME_BY_ITEM_TYPE[itemType];
  const publishedId = prev.published_item_id ?? null;

  if (publicTable) {
    try {
      await deletePublishedRecord(publicTable, publishedId, prev, itemType);
      // eslint-disable-next-line no-console
      console.debug("Deleted public record during delete", { publicTable, publishedId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting published record during delete", err);
    }
  }

  const deletePayload: Record<string, unknown> = {
    is_deleted: true,
    deleted_at: new Date().toISOString(),
  };

  if (Object.prototype.hasOwnProperty.call(prev, "published_item_id")) {
    deletePayload.published_item_id = null;
  }
  if (Object.prototype.hasOwnProperty.call(prev, "published_by")) {
    deletePayload.published_by = null;
  }
  if (Object.prototype.hasOwnProperty.call(prev, "published_at")) {
    deletePayload.published_at = null;
  }
  if (Object.prototype.hasOwnProperty.call(prev, "unpublished_at")) {
    deletePayload.unpublished_at = null;
  }

  const deleted = await updateCollectedDataWithFallback(id, deletePayload);

  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "delete",
      detail: null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to record admin action for deleteCollectedData", err);
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "delete",
      entity_type: "collected_data",
      entity_id: id,
      previous_status: prev?.verification_status ?? null,
      new_status: null,
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log for deleteCollectedData", err);
  }

  // eslint-disable-next-line no-console
  console.debug("deleteCollectedData result", { id, deleted: Boolean(deleted) });

  return true;
}

export async function publishCollectedData(
  id: string,
  itemType: string,
  payload: Record<string, any>,
  adminId: string,
) {
  // eslint-disable-next-line no-console
  console.debug("publishCollectedData called", { id, itemType });
  const table = PUBLIC_TABLE_NAME_BY_ITEM_TYPE[itemType];

  if (!table) {
    throw new AppError("Invalid target item type for publish", 400);
  }

  const prev = await getCollectedDataById(id);
  // eslint-disable-next-line no-console
  console.debug("publishCollectedData found prev", { id, found: Boolean(prev), prev_status: prev?.verification_status });

  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  const prevStatus = String(prev.verification_status || "").toLowerCase();
  if (prevStatus !== "approved") {
    throw new AppError("Item must be approved before publishing", 400);
  }

  const finalPayload = buildPublishPayload(itemType, payload, prev as unknown as Record<string, unknown>, adminId);

  const requiredTitle = String(finalPayload.title || "").trim();
  const requiredDescription = String(finalPayload.description || "").trim();
  const requiredUrl = String(finalPayload.official_url || "").trim();

  const missingFields: string[] = [];
  if (!requiredTitle) missingFields.push("title");
  if (!requiredDescription) missingFields.push("description");
  if (!requiredUrl) missingFields.push("official_url / apply URL");

  if (itemType === "scheme" && !String(finalPayload.category || "").trim()) {
    missingFields.push("category (scheme-specific)");
  }
  if (itemType === "job" && !String(finalPayload.department || "").trim()) {
    missingFields.push("department / organization (job-specific)");
  }
  if (itemType === "exam" && !String(finalPayload.conducting_body || "").trim()) {
    missingFields.push("conducting_body (exam-specific)");
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Publishing failed. Missing required fields: ${missingFields.join(", ")}`,
      400,
    );
  }
  if (!finalPayload.source_id) {
    throw new AppError(
      "Publishing requires source_id from collected data or payload",
      400,
    );
  }

  let publishedRecord: any = null;
  let publishedId: string | null = prev.published_item_id ?? null;

  if (!publishedId) {
    publishedId = await findExistingPublishedRecordId(table, prev, itemType);
  }

  if (publishedId) {
    publishedRecord = await updateTableRecordWithFallback(table, publishedId, finalPayload);
  } else {
    publishedRecord = await insertTableRecordWithFallback(table, finalPayload);
    publishedId = publishedRecord?.id ?? null;
  }

  const updated = await updateCollectedDataWithFallback(id, {
    verification_status: "published",
    published_by: adminId,
    published_at: new Date().toISOString(),
    published_item_id: publishedId,
  });

  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "publish",
      detail: JSON.stringify({ published_table: table, published_id: publishedId }),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to record admin action for publishCollectedData", err);
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "publish",
      entity_type: "collected_data",
      entity_id: id,
      previous_status: prev?.verification_status ?? null,
      new_status: updated?.verification_status ?? "published",
      changed_fields: { published_item: publishedRecord ?? null },
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log for publishCollectedData", err);
  }

  // eslint-disable-next-line no-console
  console.debug("publishCollectedData result", { id, published_table: table, published_id: publishedId, new_status: updated?.verification_status });

  return {
    table,
    item: publishedRecord,
  };
}


export async function updateUserRoleInDb(userId: string, newRole: string, adminId: string) {
  if (!["user", "admin", "moderator"].includes(newRole)) {
    throw new AppError("Invalid role", 400);
  }

  return updateUserRole(userId, newRole, adminId);
}
