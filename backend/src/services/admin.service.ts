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
    sub_category: row.sub_category || row.content_action || null,
    content_action: row.content_action || row.sub_category || null,
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

/**
 * Normalize item_type to lowercase singular form.
 * Handles: "Exam" → "exam", "exams" → "exam", "Jobs" → "job", etc.
 */
function normalizeItemType(raw: string | null | undefined): string {
  if (!raw) return "scheme";
  const lower = raw.toLowerCase().trim();
  if (lower === "schemes") return "scheme";
  if (lower === "scholarships") return "scholarship";
  if (lower === "jobs") return "job";
  if (lower === "exams") return "exam";
  return lower;
}

const PUBLIC_TABLE_NAME_BY_ITEM_TYPE: Record<string, string> = {
  scheme: "schemes",
  scholarship: "scholarships",
  job: "jobs",
  exam: "exams",
  // Update types → content_updates table (handled separately in the publish flow)
  admission: "content_updates",
  notification: "content_updates",
  admit_card: "content_updates",
  result: "content_updates",
  answer_key: "content_updates",
  update: "content_updates",
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
    "organization",
    "state",
    "category",
    "sub_category",
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
    "sub_category",
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
    if (value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        // Save null for empty strings (DB columns are nullable)
        cleaned[key] = null;
        continue;
      }
      cleaned[key] = trimmedValue;
      continue;
    }

    // Allow null values to be saved (for nullable columns)
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
  // Safe fallbacks - save null if no title available (column is nullable after migration)
  const normalizedTitle =
    String(payload.title ?? "").trim() ||
    String(prev.raw_title ?? "").trim() ||
    String(prev.title ?? "").trim() ||
    String((prev as any).name ?? "").trim() ||
    null;

  // Description: save null if empty (column allows null)
  const normalizedDescription = 
    String(payload.description ?? "").trim() ||
    String(payload.summary ?? "").trim() ||
    String(prev.raw_content ?? "").trim() ||
    String(prev.description ?? "").trim() ||
    String(prev.summary ?? "").trim() ||
    String((prev as any).content ?? "").trim() ||
    "";

  // Official URL: save null if empty (column allows null)
  const normalizedOfficialUrl =
    String(payload.official_url ?? "").trim() ||
    String(payload.apply_url ?? "").trim() ||
    String(payload.source_url ?? "").trim() ||
    String(payload.link ?? "").trim() ||
    String(prev.official_url ?? "").trim() ||
    String(prev.apply_url ?? "").trim() ||
    String(prev.source_url ?? "").trim() ||
    String(prev.raw_url ?? "").trim() ||
    "";

  // Apply URL
  const normalizedApplyUrl =
    String(payload.apply_url ?? "").trim() ||
    String(prev.apply_url ?? "").trim() ||
    normalizedOfficialUrl;

  // Source URL: save null if empty
  const normalizedSourceUrl =
    String(payload.source_url ?? "").trim() ||
    String(prev.source_url ?? "").trim() ||
    String(prev.raw_url ?? "").trim() ||
    "";

  const source_id = payload.source_id ?? prev.source_id;
  const now = new Date().toISOString();

  // Category: safe fallback only if column is NOT NULL
  const category = payload.category !== undefined && String(payload.category).trim() !== "" 
    ? String(payload.category).trim() 
    : (prev.category ? String(prev.category).trim() : null);
  const state = payload.state !== undefined && String(payload.state).trim() !== ""
    ? String(payload.state).trim()
    : (prev.state ? String(prev.state).trim() : null);
  const deadline = String(payload.deadline ?? prev.deadline ?? "").trim() || null;

  // Build search_text from available fields, don't fail if empty
  const searchTextParts = [normalizedTitle, normalizedDescription, category || '', state || ''].filter(Boolean);

  const basePayload: Record<string, unknown> = {
    title: normalizedTitle || null,
    description: normalizedDescription || null,
    official_url: normalizedOfficialUrl || null,
    apply_url: normalizedApplyUrl || null,
    source_url: normalizedSourceUrl || null,
    source_id,
    status: "active",
    verification_status: "published",
    approved_by: adminId,
    approved_at: now,
    search_text: searchTextParts.join(' ') || null,
  };

  // Remove null values if DB column accepts them - only keep source_id for integrity
  // Title can be null if DB allows it

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

  // Compute sub_category from payload or prev
  const rawSubCategory = String(payload.sub_category ?? payload.content_action ?? prev.sub_category ?? prev.content_action ?? "").toLowerCase().trim();
  // Must match CONTENT_ACTIONS in constants/status.ts
  const subCategoryMap: Record<string, string> = {
    'apply': 'apply', 'apply now': 'apply', 'apply_now': 'apply',  // normalize legacy apply_now → apply
    'admit_card': 'admit_card', 'admit-card': 'admit_card', 'admit card': 'admit_card',
    'result': 'result', 'results': 'result',
    'answer_key': 'answer_key', 'answer-key': 'answer_key', 'answer key': 'answer_key',
    'notification': 'notification', 'notifications': 'notification',
  };
  const normalizedSubCategory = subCategoryMap[rawSubCategory] ?? null;

  if (itemType === "job") {
    basePayload.department = payload.department ?? payload.organization ?? prev.department ?? prev.organization ?? null;
    basePayload.organization = payload.organization ?? prev.organization ?? payload.department ?? prev.department ?? null;
    basePayload.state = state;
    basePayload.category = category;
    basePayload.sub_category = normalizedSubCategory;
    basePayload.qualification = payload.qualification ?? prev.qualification ?? null;
    basePayload.vacancies = payload.vacancies ?? prev.vacancies ?? null;
    basePayload.deadline = deadline;
  }

  if (itemType === "exam") {
    basePayload.exam_name = payload.exam_name ?? payload.title ?? prev.raw_title ?? null;
    // Note: exams table uses exam_name column, NOT title — don't set basePayload.title
    basePayload.conducting_body =
      payload.conducting_body ?? payload.conductingBody ?? prev.conducting_body ?? prev.conductingBody ?? null;
    basePayload.state = state;
    basePayload.category = category;
    basePayload.sub_category = normalizedSubCategory;
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
    // Check multiple URL fields for a match
    const urlFields = ["official_url", "source_url", "apply_url", "raw_url"];
    for (const urlField of urlFields) {
      try {
        const { data: existingByUrl, error: urlError } = await supabase
          .from(table)
          .select("id")
          .eq(urlField, prev.raw_url)
          .maybeSingle();
        if (!urlError && existingByUrl?.id) {
          return existingByUrl.id;
        }
      } catch {
        // Column may not exist — skip
      }
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

/**
 * Shared helper: Deactivate a public table record when unpublishing or deleting.
 * Sets BOTH status='inactive' AND verification_status='approved' (defense-in-depth).
 * Public APIs filter by status='active' AND verification_status='published',
 * so updating both ensures the item is excluded even if one column update fails.
 *
 * Falls back gracefully if verification_status column doesn't exist.
 *
 * @param table  - Destination table name (e.g. "schemes", "jobs")
 * @param id     - Primary key of the record to update
 * @param prefix - Log prefix ("unpublish" or "delete")
 * @returns true if exactly 1 row was updated
 */
async function deactivatePublicTableRecord(table: string, id: string, prefix: string): Promise<boolean> {
  const statusUpdate: Record<string, unknown> = {
    status: "inactive",
    verification_status: "approved",
    published_at: null,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data: updated, error: updateErr } = await supabase
      .from(table)
      .update(statusUpdate)
      .eq("id", id)
      .select("id, status, verification_status")
      .maybeSingle();

    if (updateErr) {
      console.error(`[${prefix}] update error on ${table}/${id}:`, updateErr.message);
      // If verification_status column doesn't exist, retry without it
      if (updateErr.message?.includes("verification_status")) {
        const { data: retry, error: retryErr } = await supabase
          .from(table)
          .update({ status: "inactive", published_at: null, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select("id, status")
          .maybeSingle();
        if (!retryErr && retry) {
          console.log(`[${prefix}] ✅ Updated ${table}/${id} (without verification_status column)`);
          return true;
        }
        console.error(`[${prefix}] retry also failed:`, retryErr?.message);
      }
      return false;
    }

    if (updated) {
      console.log(`[${prefix}] ✅ Updated ${table}/${id} status=${updated.status} vs=${updated.verification_status}`);
      return true;
    }

    console.error(`[${prefix}] UPDATE returned null for ${table}/${id} (0 rows matched)`);
    return false;
  } catch (e) {
    console.error(`[${prefix}] update exception on ${table}/${id}:`, e);
    return false;
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

export async function approveCollectedData(id: string, adminId: string, adminNotes?: string, edits?: Record<string, unknown>) {
  const prev = await getCollectedDataById(id);
  // eslint-disable-next-line no-console
  console.debug("approveCollectedData called", { id, found: Boolean(prev), hasEdits: Boolean(edits && Object.keys(edits || {}).length > 0) });
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  // Step 1: Apply edits FIRST if provided, before changing status
  if (edits && Object.keys(edits).length > 0) {
    const cleanEdits: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(edits)) {
      if (value !== undefined) {
        cleanEdits[key] = value === "" ? null : value;
      }
    }
    if (Object.keys(cleanEdits).length > 0) {
      await updateCollectedDataWithFallback(id, cleanEdits);
    }
  }

  // Step 2: Fetch the latest data after edits are applied
  const latestPrev = await getCollectedDataById(id);

  // Step 3: Change status to approved with latest data
  const updates: Record<string, unknown> = {
    verification_status: "approved",
    approved_by: adminId,
    approved_at: new Date().toISOString(),
    admin_notes: adminNotes ?? null,
    updated_at: new Date().toISOString(),
  };

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

  const normalizedUpdates: Record<string, unknown> = {
    ...updates,
  };

  // URL fields - save as-is, don't validate. Empty strings become null below.
  // Only warn if invalid URL, don't block
  for (const field of ["official_url", "source_url", "raw_url", "sourceUrl", "link"] as const) {
    const rawValue = updates[field];
    if (rawValue === undefined || rawValue === null) continue;
    const value = String(rawValue).trim();
    if (value && !isValidOptionalUrl(value)) {
      console.warn(`[editCollectedData] Non-blocking warning: ${field} is not a valid URL: ${value}`);
    }
  }

  if (updates.summary && !("description" in updates)) {
    normalizedUpdates.description = updates.summary;
    delete normalizedUpdates.summary;
  }

  if (updates.link && !("official_url" in updates) && !("source_url" in updates)) {
    normalizedUpdates.official_url = updates.link;
    delete normalizedUpdates.link;
  }

  // Keep official_url, source_url, and raw_url as separate columns.

  const cleanedUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(normalizedUpdates)) {
    if (value === undefined) continue;
    cleanedUpdates[key] = value === "" ? null : value;
  }

  const updated = await updateCollectedDataWithFallback(id, cleanedUpdates);

  if (updated && String(prev.verification_status || "").toLowerCase() === "published") {
    const itemType = normalizeItemType(prev.item_type);
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

  // Log admin action for edit
  try {
    await insertAdminAction({
      admin_id: adminId ?? "system",
      item_id: id,
      item_type: "collected_data" as any,
      action: "edit",
      detail: JSON.stringify(Object.keys(normalizedUpdates)),
    });
  } catch (err) {
    console.error("Failed to record admin action for editCollectedData", err);
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

  const rawItemType = String(prev.item_type || "scheme");
  const itemType = normalizeItemType(prev.item_type);
  const publicTable = PUBLIC_TABLE_NAME_BY_ITEM_TYPE[itemType];

  console.log("[EXAM_UNPUBLISH_DEBUG] id=", id, "raw_item_type=", rawItemType, "normalized_item_type=", itemType, "publicTable=", publicTable);
  console.log("[EXAM_UNPUBLISH_DEBUG] before: published_item_id=", prev.published_item_id, "verification_status=", prev.verification_status);

  if (!publicTable) {
    console.error("[EXAM_UNPUBLISH_DEBUG] ❌ FAILED - Unable to resolve public table for item_type:", itemType, "raw:", rawItemType);
    throw new AppError("Unable to resolve public table for unpublish", 500);
  }

  console.log("\n========== UNPUBLISH START ==========");
  console.log("[unpublish] id:", id);
  console.log("[unpublish] raw_item_type:", rawItemType, "normalized:", itemType);
  console.log("[unpublish] publicTable:", publicTable);
  console.log("[unpublish] published_item_id:", prev.published_item_id);
  console.log("[unpublish] raw_title:", prev.raw_title?.substring(0, 80));
  console.log("[unpublish] raw_url:", prev.raw_url?.substring(0, 80));
  console.log("[unpublish] title:", prev.title?.substring(0, 80));

  let destId: string | null = null;

  // ── Method A: Try by published_item_id (direct, no matching needed) ──
  const pid = String(prev.published_item_id || "").trim();
  if (pid) {
    console.log("[unpublish] Method A: Trying published_item_id:", pid);
    // Use table-appropriate select fields (exams table does NOT have title column)
    const { data: found, error: fetchErr } = await (async () => {
      if (publicTable === "exams") {
        return supabase.from(publicTable).select("id, status, verification_status").eq("id", pid).maybeSingle();
      }
      return supabase.from(publicTable).select("id, status, title, verification_status").eq("id", pid).maybeSingle();
    })();

    if (fetchErr) {
      console.error("[unpublish] Method A: fetch error:", fetchErr.message);
    } else if (found) {
      const foundRow = found as Record<string, unknown>;
      console.log("[unpublish] Method A: FOUND in", publicTable,
        "status:", foundRow.status,
        "verification_status:", foundRow.verification_status);
      
      if (await deactivatePublicTableRecord(publicTable, pid, "unpublish")) {
        destId = pid;
      }
    } else {
      console.log("[unpublish] Method A: ID not found in", publicTable);
    }
  } else {
    console.log("[unpublish] Method A: SKIP - published_item_id is null/empty");
  }

  // ── Method B: Try URL matching if Method A failed ──
  if (!destId && prev.raw_url) {
    const urlFields = ["official_url", "source_url", "apply_url", "raw_url"];
    for (const urlField of urlFields) {
      console.log("[unpublish] Method B: Trying", urlField, "=", prev.raw_url?.substring(0, 60));
      try {
        // Use table-appropriate select fields (exams table does NOT have title column)
        const { data: match, error: matchErr } = await (async () => {
          if (publicTable === "exams") {
            return supabase.from(publicTable).select("id, status, verification_status").eq(urlField, prev.raw_url).maybeSingle();
          }
          return supabase.from(publicTable).select("id, status, verification_status, title").eq(urlField, prev.raw_url).maybeSingle();
        })();

        if (matchErr) {
          continue; // Column probably doesn't exist
        }
        if (match) {
          const matchRow = match as Record<string, unknown>;
          console.log("[unpublish] Method B: FOUND by", urlField,
            "id:", matchRow.id,
            "status:", matchRow.status,
            "verification_status:", matchRow.verification_status);
          
          if (await deactivatePublicTableRecord(publicTable, match.id, "unpublish")) {
            destId = match.id;
            break;
          }
        }
      } catch {
        // skip
      }
    }
  }

  // ── Method C: Try title matching if methods A and B failed ──
  if (!destId && prev.raw_title) {
    const titleField = itemType === "exam" ? "exam_name" : "title";
    const exactTitle = prev.raw_title.trim();
    console.log("[unpublish] Method C: Trying title match:", exactTitle.substring(0, 60));
    try {
      // Use table-appropriate select fields (exams table does NOT have title column)
      const { data: match, error: matchErr } = await (async () => {
        if (publicTable === "exams") {
          return supabase.from(publicTable).select("id, status, verification_status").eq(titleField, exactTitle).maybeSingle();
        }
        return supabase.from(publicTable).select("id, status, verification_status, title").eq(titleField, exactTitle).maybeSingle();
      })();

      if (!matchErr && match) {
        const matchRow = match as Record<string, unknown>;
        console.log("[unpublish] Method C: FOUND by title, id:", matchRow.id,
          "status:", matchRow.status,
          "verification_status:", matchRow.verification_status);
        
        if (await deactivatePublicTableRecord(publicTable, match.id, "unpublish")) {
          destId = match.id;
        }
      } else {
        console.log("[unpublish] Method C: No title match for:", exactTitle.substring(0, 60));
      }
    } catch {
      // skip
    }
  }

  if (!destId) {
    console.error("\n========== UNPUBLISH FAILED ==========");
    console.error("[unpublish] ❌ ALL METHODS FAILED — destination record not found or not updated!");
    console.error("[unpublish] Item will REMAIN visible on user pages!");
    console.error("[unpublish] id:", id);
    console.error("[unpublish] item_type:", itemType);
    console.error("[unpublish] publicTable:", publicTable);
    console.error("[unpublish] published_item_id:", prev.published_item_id);
    console.error("[unpublish] raw_url:", prev.raw_url);
    console.error("[unpublish] raw_title:", prev.raw_title);

    // Throw — do NOT update collected_data so admin page still shows the item
    throw new AppError(
      `[CRITICAL] Could not unpublish: no matching record found in ${publicTable} ` +
      `for collected_data item id=${id} type=${itemType}. ` +
      `published_item_id=${prev.published_item_id ?? "null"}. ` +
      `Check server logs for full details.`,
      500
    );
  }

  console.log("[EXAM_UNPUBLISH_DEBUG] after_update: destId=", destId, "status=inactive verification_status=approved");
  console.log("[unpublish] Destination updated, destId:", destId);

  // ── Deactivate linked content_updates (by item_id) ──
  try {
    const { data: deactivated, error: cuError } = await supabase
      .from("content_updates")
      .update({
        status: "approved",
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("item_id", destId)
      .eq("item_type", itemType)
      .eq("status", "published")
      .select("id, item_type, item_id, status");

    if (cuError) {
      console.warn("[unpublish] Failed to deactivate content_updates by item_id:", cuError.message);
    } else {
      console.log(
        `[unpublish] Deactivated ${deactivated?.length ?? 0} content_updates by item_id for ${itemType}/${destId}`
      );
    }
  } catch (e) {
    console.warn("[unpublish] Exception deactivating content_updates by item_id:", e);
  }

  // ── Also deactivate content_updates linked by collected_data_id ──
  try {
    const { data: altDeactivated, error: altCuError } = await supabase
      .from("content_updates")
      .update({
        status: "approved",
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("collected_data_id", id)
      .eq("status", "published")
      .select("id, collected_data_id, status");

    if (altCuError) {
      console.warn("[unpublish] Failed to deactivate content_updates by collected_data_id:", altCuError.message);
    } else {
      console.log(
        `[unpublish] Deactivated ${altDeactivated?.length ?? 0} content_updates by collected_data_id`
      );
    }
  } catch (e) {
    console.warn("[unpublish] Exception deactivating content_updates by collected_data_id:", e);
  }

  // ── Update collected_data pipeline ──
  const updated = await updateCollectedDataWithFallback(id, {
    verification_status: "approved",
    published_item_id: null,
    published_by: null,
    published_at: null,
    unpublished_at: new Date().toISOString(),
  });
  console.log("[unpublish] collected_data updated to approved, new status:", updated?.verification_status);

  // Create content_updates entry for unpublish
  try {
    await createContentUpdate({
      item_id: id,
      item_type: itemType,
      update_type: "unpublished",
      old_status: prev?.verification_status ?? "published",
      new_status: "approved",
      update_message: `${itemType} unpublished: ${prev.raw_title ?? "Untitled"}`,
    });
  } catch (err) {
    console.error("Failed to create content update for unpublish:", err);
  }

  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "unpublish",
      detail: null,
    });
  } catch (err) {
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
    console.error("Failed to write audit log for unpublishCollectedData", err);
  }

  console.log("========== UNPUBLISH COMPLETE ==========\n");
  return updated;
}

export async function deleteCollectedData(id: string, adminId: string) {
  const prev = await getCollectedDataById(id);
  console.log("\n========== DELETE START ==========");
  console.log("[delete] id:", id, "found:", Boolean(prev));
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  const itemType = normalizeItemType(prev.item_type);
  const publicTable = PUBLIC_TABLE_NAME_BY_ITEM_TYPE[itemType];
  console.log("[delete] item_type:", itemType);
  console.log("[delete] publicTable:", publicTable);
  console.log("[delete] published_item_id:", prev.published_item_id);

  // Same direct update logic as unpublish for the destination table
  if (publicTable) {
    let destId: string | null = null;

    // Method A: Try published_item_id
    const pid = String(prev.published_item_id || "").trim();
    if (pid) {
      const { data: found } = await supabase
        .from(publicTable)
        .select("id, status, verification_status")
        .eq("id", pid)
        .maybeSingle();

      if (found) {
        console.log("[delete] Found in", publicTable, "status:", found.status, "vs:", found.verification_status);
        if (await deactivatePublicTableRecord(publicTable, pid, "delete")) {
          destId = pid;
        }
      } else {
        console.log("[delete] published_item_id not found in", publicTable);
      }
    }

    // Method B: URL matching fallback
    if (!destId && prev.raw_url) {
      const urlFields = ["official_url", "source_url", "apply_url", "raw_url"];
      for (const urlField of urlFields) {
        try {
          const { data: match } = await supabase
            .from(publicTable)
            .select("id, status, verification_status")
            .eq(urlField, prev.raw_url)
            .maybeSingle();

          if (match && await deactivatePublicTableRecord(publicTable, match.id, "delete")) {
            destId = match.id;
            console.log("[delete] ✅ Updated via", urlField);
            break;
          }
        } catch { /* skip */ }
      }
    }

    // Method C: Title matching fallback
    if (!destId && prev.raw_title) {
      const titleField = itemType === "exam" ? "exam_name" : "title";
      try {
        const { data: match } = await supabase
          .from(publicTable)
          .select("id, status, verification_status")
          .eq(titleField, prev.raw_title.trim())
          .maybeSingle();

        if (match && await deactivatePublicTableRecord(publicTable, match.id, "delete")) {
          destId = match.id;
          console.log("[delete] ✅ Updated via title");
        }
      } catch { /* skip */ }
    }

    if (!destId) {
      console.warn("[delete] Could not find/update destination record in", publicTable, "- proceeding with pipeline delete only");
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
  console.log("[delete] collected_data updated, deleted:", Boolean(deleted));

  // Create content_updates entry for delete
  try {
    await createContentUpdate({
      item_id: id,
      item_type: itemType,
      update_type: "deleted",
      old_status: prev?.verification_status ?? null,
      new_status: "deleted",
      update_message: `${itemType} deleted: ${prev.raw_title ?? "Untitled"}`,
    });
  } catch (err) {
    console.error("Failed to create content update for delete:", err);
  }

  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "delete",
      detail: null,
    });
  } catch (err) {
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
    console.error("Failed to write audit log for deleteCollectedData", err);
  }

  console.log("[delete] Complete\n");
  return true;
}

// ============================================================
// BULK ACTIONS
// ============================================================

interface BulkActionResult {
  success: boolean;
  processed: number;
  successCount: number;
  failedCount: number;
  failed: Array<{ id: string; reason: string }>;
}

async function processBulkAction(
  ids: string[],
  actionFn: (id: string, adminId: string) => Promise<unknown>,
  adminId: string,
): Promise<BulkActionResult> {
  const failed: Array<{ id: string; reason: string }> = [];
  let successCount = 0;

  for (const id of ids) {
    try {
      await actionFn(id, adminId);
      successCount++;
    } catch (err) {
      failed.push({ id, reason: getErrorMessage(err) });
    }
  }

  return {
    success: failed.length === 0,
    processed: ids.length,
    successCount,
    failedCount: failed.length,
    failed,
  };
}

export async function bulkApproveCollectedData(ids: string[], adminId: string, reason?: string): Promise<BulkActionResult> {
  const result = await processBulkAction(ids, async (id, adminId) => {
    await approveCollectedData(id, adminId, reason);
  }, adminId);

  // Audit log for bulk action
  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "bulk_approve",
      entity_type: "collected_data",
      entity_id: `bulk:${ids.join(",")}`.slice(0, 500),
      previous_status: null,
      new_status: "approved",
      changed_fields: null,
      reason: reason ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record bulk audit log:", err);
  }

  return result;
}

export async function bulkRejectCollectedData(ids: string[], adminId: string, reason?: string): Promise<BulkActionResult> {
  const result = await processBulkAction(ids, async (id, adminId) => {
    await rejectCollectedData(id, adminId, reason || "Bulk rejected by admin");
  }, adminId);

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "bulk_reject",
      entity_type: "collected_data",
      entity_id: `bulk:${ids.join(",")}`.slice(0, 500),
      previous_status: null,
      new_status: "rejected",
      changed_fields: null,
      reason: reason ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record bulk audit log:", err);
  }

  return result;
}

export async function bulkPublishCollectedData(ids: string[], adminId: string): Promise<BulkActionResult> {
  const failed: Array<{ id: string; reason: string }> = [];
  let successCount = 0;

  for (const id of ids) {
    try {
      const prev = await getCollectedDataById(id);
      if (!prev) {
        failed.push({ id, reason: "Item not found" });
        continue;
      }

      const itemType = normalizeItemType(prev.item_type);
      const payload: Record<string, unknown> = {
        title: prev.raw_title || "",
        description: prev.raw_content || "",
        official_url: prev.raw_url || "",
      };
      await publishCollectedData(id, itemType, payload, adminId);
      successCount++;
    } catch (err) {
      failed.push({ id, reason: getErrorMessage(err) });
    }
  }

  const result: BulkActionResult = {
    success: failed.length === 0,
    processed: ids.length,
    successCount,
    failedCount: failed.length,
    failed,
  };

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "bulk_publish",
      entity_type: "collected_data",
      entity_id: `bulk:${ids.join(",")}`.slice(0, 500),
      previous_status: null,
      new_status: "published",
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record bulk audit log:", err);
  }

  return result;
}

export async function bulkUnpublishCollectedData(ids: string[], adminId: string): Promise<BulkActionResult> {
  const result = await processBulkAction(ids, async (id) => {
    await unpublishCollectedData(id, adminId);
  }, adminId);

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "bulk_unpublish",
      entity_type: "collected_data",
      entity_id: `bulk:${ids.join(",")}`.slice(0, 500),
      previous_status: null,
      new_status: "approved",
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record bulk audit log:", err);
  }

  return result;
}

export async function bulkRestoreCollectedData(ids: string[], adminId: string): Promise<BulkActionResult> {
  const failed: Array<{ id: string; reason: string }> = [];
  let successCount = 0;

  for (const id of ids) {
    try {
      const prev = await getCollectedDataById(id);
      if (!prev) {
        failed.push({ id, reason: "Item not found" });
        continue;
      }

      await updateCollectedDataWithFallback(id, {
        verification_status: "pending",
        rejection_reason: null,
        rejected_by: null,
        rejected_at: null,
        updated_at: new Date().toISOString(),
      });

      try {
        await insertAdminAction({
          admin_id: adminId,
          item_id: id,
          item_type: "collected_data" as any,
          action: "restore",
          detail: null,
        });
      } catch (err) {
        console.error("Failed to record admin action for restore:", err);
      }

      successCount++;
    } catch (err) {
      failed.push({ id, reason: getErrorMessage(err) });
    }
  }

  const result: BulkActionResult = {
    success: failed.length === 0,
    processed: ids.length,
    successCount,
    failedCount: failed.length,
    failed,
  };

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "bulk_restore",
      entity_type: "collected_data",
      entity_id: `bulk:${ids.join(",")}`.slice(0, 500),
      previous_status: "rejected",
      new_status: "pending",
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record bulk audit log:", err);
  }

  return result;
}

export async function bulkDeleteCollectedData(ids: string[], adminId: string): Promise<BulkActionResult> {
  const result = await processBulkAction(ids, async (id) => {
    await deleteCollectedData(id, adminId);
  }, adminId);

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "bulk_delete",
      entity_type: "collected_data",
      entity_id: `bulk:${ids.join(",")}`.slice(0, 500),
      previous_status: null,
      new_status: "deleted",
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record bulk audit log:", err);
  }

  return result;
}

export async function bulkProcessAiCollectedData(ids: string[], adminId: string): Promise<BulkActionResult> {
  const failed: Array<{ id: string; reason: string }> = [];
  let successCount = 0;

  for (const id of ids) {
    try {
      const prev = await getCollectedDataById(id);
      if (!prev) {
        failed.push({ id, reason: "Item not found" });
        continue;
      }

      // Mark as ai_processed so the processing pipeline picks it up
      await updateCollectedDataWithFallback(id, {
        processing_status: "pending",
        verification_status: "ai_processed",
        updated_at: new Date().toISOString(),
      });

      try {
        await insertAdminAction({
          admin_id: adminId,
          item_id: id,
          item_type: "collected_data" as any,
          action: "process_ai",
          detail: null,
        });
      } catch (err) {
        console.error("Failed to record admin action:", err);
      }

      successCount++;
    } catch (err) {
      failed.push({ id, reason: getErrorMessage(err) });
    }
  }

  const result: BulkActionResult = {
    success: failed.length === 0,
    processed: ids.length,
    successCount,
    failedCount: failed.length,
    failed,
  };

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "bulk_process_ai",
      entity_type: "collected_data",
      entity_id: `bulk:${ids.join(",")}`.slice(0, 500),
      previous_status: null,
      new_status: "ai_processed",
      changed_fields: null,
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record bulk audit log:", err);
  }

  return result;
}

/**
 * Publish collected_data as a content_updates entry
 * Used for: admit_card, result, answer_key, notification, update types
 */
async function publishAsContentUpdate(
  id: string,
  itemType: string,
  payload: Record<string, any>,
  adminId: string,
) {
  const prev = await getCollectedDataById(id);
  if (!prev) {
    throw new AppError("Collected data item not found", 404);
  }

  const title = String(payload.title ?? prev.raw_title ?? "Update").trim();
  const description = String(payload.description ?? prev.raw_content ?? "").trim();
  const officialUrl = String(payload.official_url ?? payload.apply_url ?? prev.raw_url ?? "").trim();

  // Find the parent content type/id if provided
  const parentContentType = payload.parent_content_type ?? null;
  const parentContentId = payload.parent_content_id ?? null;
  const updateTypeMapping: Record<string, string> = {
    admit_card: "admit_card",
    result: "result",
    answer_key: "answer_key",
    notification: "notification",
    update: "update",
    apply: "apply",
  };

  const updateType = updateTypeMapping[itemType] ?? "notification";

  // Insert into content_updates
  const { error: insertError } = await supabase.from("content_updates").insert({
    item_type: parentContentType ?? itemType,
    item_id: parentContentId ?? id,
    source_id: prev.source_id,
    collected_data_id: id,
    update_type: updateType,
    title,
    description,
    official_url: officialUrl,
    status: "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select().maybeSingle();

  if (insertError) {
    throw new AppError(`Failed to publish update: ${insertError.message}`, 500);
  }

  // Update collected_data status to published
  const updated = await updateCollectedDataWithFallback(id, {
    verification_status: "published",
    published_at: new Date().toISOString(),
  });

  // Audit logging (best-effort, never blocks)
  try {
    await insertAdminAction({
      admin_id: adminId,
      item_id: id,
      item_type: "collected_data" as any,
      action: "publish_update",
      detail: JSON.stringify({ update_type: updateType, content_type: itemType }),
    });
  } catch (err) {
    console.error("Failed to record admin action for publishAsContentUpdate", err);
  }

  try {
    await insertAdminAuditLog({
      admin_id: adminId,
      action: "publish_update",
      entity_type: "content_updates",
      entity_id: id,
      previous_status: prev?.verification_status ?? null,
      new_status: "published",
      changed_fields: { update_type: updateType, content_type: itemType },
      reason: null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to write audit log for publishAsContentUpdate", err);
  }

  return {
    table: "content_updates",
    item: insertError ? null : { id, title, update_type: updateType },
  };
}

export async function publishCollectedData(
  id: string,
  itemType: string,
  payload: Record<string, any>,
  adminId: string,
) {
  // eslint-disable-next-line no-console
  console.debug("publishCollectedData called", { id, itemType });

  // Handle update types (admit_card, result, answer_key, notification, update)
  // by publishing to content_updates table
  if (["admit_card", "result", "answer_key", "notification", "update"].includes(itemType)) {
    return publishAsContentUpdate(id, itemType, payload, adminId);
  }

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

  // No required content fields - everything is optional. Use safe fallbacks.
  // The DB columns are nullable, so empty values are fine.
  // Only keep source_id requirement to maintain data integrity
  // If source_id is missing, try publishing without it
  if (!finalPayload.source_id && !prev.source_id) {
    // Proceed without source_id - don't block publishing
    delete finalPayload.source_id;
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

    // If insert didn't return the record ID (e.g., .select().maybeSingle() returned null),
    // do a follow-up query to find the record by URL or title
    if (!publishedId && prev.raw_url) {
      const urlFields = ["official_url", "source_url", "apply_url", "raw_url"];
      for (const urlField of urlFields) {
        try {
          const { data: foundRecord } = await supabase
            .from(table)
            .select("id")
            .eq(urlField, prev.raw_url)
            .maybeSingle();
          if (foundRecord?.id) {
            publishedId = foundRecord.id;
            console.debug("[publish] Found published record by URL fallback", { urlField, publishedId });
            break;
          }
        } catch { /* skip */ }
      }
    }

    if (!publishedId && prev.raw_title) {
      const titleField = itemType === "exam" ? "exam_name" : "title";
      try {
        const { data: foundRecord } = await supabase
          .from(table)
          .select("id")
          .eq(titleField, prev.raw_title)
          .maybeSingle();
        if (foundRecord?.id) {
          publishedId = foundRecord.id;
          console.debug("[publish] Found published record by title fallback", { publishedId });
        }
      } catch { /* skip */ }
    }
  }

  console.debug("[publish] Saving published_item_id", { publishedId });

  const updated = await updateCollectedDataWithFallback(id, {
    verification_status: "published",
    published_by: adminId,
    published_at: new Date().toISOString(),
    published_item_id: publishedId,
  });

  // Create eligibility_rules entry after publishing
  try {
    await createEligibilityRulesFromPublishedItem(itemType, finalPayload, publishedId ?? id);
  } catch (err) {
    console.error("Failed to create eligibility rules for published item:", err);
  }

  // Create content_updates entry
  try {
    await createContentUpdate({
      item_id: publishedId ?? id,
      item_type: itemType,
      update_type: "new",
      old_status: prev?.verification_status ?? "approved",
      new_status: "published",
      update_message: `${itemType} published: ${finalPayload.title ?? prev.raw_title ?? "Untitled"}`,
    });
  } catch (err) {
    console.error("Failed to create content update for published item:", err);
  }

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


// ============================================================
// Auto-create eligibility_rules after publish
// ============================================================

async function createEligibilityRulesFromPublishedItem(
  itemType: string,
  payload: Record<string, unknown>,
  itemId: string,
): Promise<void> {
  const state = String(payload.state || "All India").trim();
  const category = String(payload.category || "General").trim();
  const education = String(payload.education_level || payload.qualification || "").trim();
  const occupation = String(payload.occupation || "").trim();
  const incomeLimitStr = String(payload.income_limit || payload.income_range || "").trim();
  const ageLimitStr = String(payload.age_limit || "").trim();
  const gender = String(payload.gender || "").trim();
  const userType = String(payload.user_type || "").trim();

  // Parse age limits
  let minAge: number | null = null;
  let maxAge: number | null = null;
  if (ageLimitStr) {
    const ageMatch = ageLimitStr.match(/(\d+)\s*(?:-|to)\s*(\d+)/i);
    if (ageMatch) {
      minAge = parseInt(ageMatch[1], 10);
      maxAge = parseInt(ageMatch[2], 10);
    } else {
      const singleAge = ageLimitStr.match(/(\d+)/);
      if (singleAge) maxAge = parseInt(singleAge[1], 10);
    }
  }

  const insertPayload: Record<string, unknown> = {
    item_id: itemId,
    item_type: itemType,
  };

  // Only add fields that have values — let DB defaults handle rest
  if (state) insertPayload.state = state;
  if (category) insertPayload.category = category;
  if (education) insertPayload.education_level = education;
  if (occupation) insertPayload.occupation = occupation;
  if (incomeLimitStr) insertPayload.income_range = incomeLimitStr;
  if (minAge !== null) insertPayload.min_age = minAge;
  if (maxAge !== null) insertPayload.max_age = maxAge;
  if (gender) insertPayload.gender = gender;
  if (userType) insertPayload.user_type = userType;

  // Use insert with catch for duplicate key - safer than upsert without guaranteed unique constraint
  const { error: insertError } = await supabase
    .from("eligibility_rules")
    .insert(insertPayload);

  if (insertError) {
    // If duplicate key violation, try update instead
    if (insertError.code === "23505") {
      const { error: updateError } = await supabase
        .from("eligibility_rules")
        .update(insertPayload)
        .eq("item_id", itemId)
        .eq("item_type", itemType);

      if (updateError) {
        console.warn(`[eligibility-rules] Could not update rule for ${itemId}: ${updateError.message}`);
      } else {
        console.log(`[eligibility-rules] Updated rule for ${itemType} ${itemId}`);
      }
    } else {
      console.warn(`[eligibility-rules] Could not insert rule for ${itemId}: ${insertError.message}`);
    }
  } else {
    console.log(`[eligibility-rules] Created rule for ${itemType} ${itemId}`);
  }
}

// ============================================================
// Auto-create content_updates after publish/update/unpublish/expire/delete
// ============================================================

interface ContentUpdateInput {
  item_id: string;
  item_type: string;
  update_type: string;
  old_status: string | null;
  new_status: string;
  update_message: string;
}

async function createContentUpdate(input: ContentUpdateInput): Promise<void> {
  const { error } = await supabase.from("content_updates").insert({
    item_id: input.item_id,
    item_type: input.item_type,
    update_type: input.update_type,
    old_status: input.old_status,
    new_status: input.new_status,
    update_message: input.update_message.slice(0, 500),
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.warn(`[content-updates] Could not insert update for ${input.item_id}: ${error.message}`);
  }
}

export async function updateUserRoleInDb(userId: string, newRole: string, adminId: string) {
  if (!["user", "admin", "moderator"].includes(newRole)) {
    throw new AppError("Invalid role", 400);
  }

  return updateUserRole(userId, newRole, adminId);
}
