import { z } from "zod";

// All valid content types for the admin pipeline
const ALL_VALID_TYPES = [
  "scheme", "scholarship", "job", "exam",
  "admit_card", "result", "answer_key", "notification", "update",
] as const;

const MAIN_CONTENT_TYPES = ["scheme", "scholarship", "job", "exam"] as const;

export const adminItemTypeSchema = z.enum(MAIN_CONTENT_TYPES);

// Full content type schema (includes update types)
export const adminContentTypeSchema = z.enum(ALL_VALID_TYPES);

// Transform function to normalize plural to singular
const normalizeItemType = (data: unknown) => {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;
  const itemType = obj.itemType as string | undefined;

  if (!itemType) return obj;

  // Normalize plural to singular
  let normalized = itemType;
  if (itemType === "schemes") normalized = "scheme";
  else if (itemType === "scholarships") normalized = "scholarship";
  else if (itemType === "jobs") normalized = "job";
  else if (itemType === "exams") normalized = "exam";

  return {
    ...obj,
    itemType: normalized,
  };
};

export const adminItemParamSchema = z
  .object({
    itemType: z.string().min(1, "Item type is required"),
    itemId: z.string().min(1, "Item ID is required").optional(),
    id: z.string().min(1, "Item ID is required").optional(),
  })
  .transform((value) => {
    // Normalize plural to singular
    let itemType = value.itemType;
    if (itemType === "schemes") itemType = "scheme";
    else if (itemType === "scholarships") itemType = "scholarship";
    else if (itemType === "jobs") itemType = "job";
    else if (itemType === "exams") itemType = "exam";

    // Validate the normalized type — accept all valid types
    if (!ALL_VALID_TYPES.includes(itemType as any)) {
      throw new Error(`Invalid item type: ${itemType}`);
    }

    return {
      itemType,
      itemId: value.itemId ?? value.id ?? "",
    };
  })
  .refine((value) => value.itemId.length > 0, {
    message: "Item ID is required",
    path: ["id"],
  });

export const adminReviewBodySchema = z.object({
  rejection_reason: z.string().trim().optional(),
  reason: z.string().trim().optional(),
  admin_notes: z.string().trim().optional(),
}).transform((data) => ({
  rejection_reason: data.rejection_reason || data.reason || data.admin_notes || "",
  admin_notes: data.admin_notes,
}));

// ─── Sub-category normalization helper ───────────────────────────
// Normalizes display labels to internal values
// Must match CONTENT_ACTIONS in constants/status.ts:
// notification, apply, admit_card, result, answer_key
// Note: 'apply_now' is NOT a valid value — use 'apply' instead
const VALID_SUB_CATEGORIES = ['apply', 'admit_card', 'result', 'answer_key', 'notification'] as const;

function normalizeSubCategory(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  const map: Record<string, string> = {
    'apply now': 'apply',
    'apply': 'apply',
    'apply_now': 'apply',  // normalize legacy value
    'admit card': 'admit_card',
    'admit_card': 'admit_card',
    'admit-card': 'admit_card',
    'result': 'result',
    'results': 'result',
    'answer key': 'answer_key',
    'answer_key': 'answer_key',
    'answer-key': 'answer_key',
    'answerkey': 'answer_key',
    'notification': 'notification',
    'notifications': 'notification',
    'new notification': 'notification',
  };
  const normalized = map[v];
  if (!normalized && v.length > 0) {
    // Non-blocking: log but return null instead of throwing
    console.warn(`Invalid sub_category value: "${value}". Returning null.`);
  }
  return normalized ?? null;
}

export const adminNotesBodySchema = z.object({
  admin_notes: z.string().trim().optional(),
  // Editable fields that can be sent along with approve/reject
  title: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  sub_category: z.string().trim().optional().nullable(),
  content_action: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  item_type: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  deadline: z.string().trim().optional().nullable(),
  official_url: z.string().trim().optional().nullable(),
  source_url: z.string().trim().optional().nullable(),
  eligibility: z.string().trim().optional().nullable(),
  benefits: z.string().trim().optional().nullable(),
  organization: z.string().trim().optional().nullable(),
  vacancies: z.string().trim().optional().nullable(),
  education: z.string().trim().optional().nullable(),
  age_limit: z.string().trim().optional().nullable(),
  salary: z.string().trim().optional().nullable(),
  application_fee: z.string().trim().optional().nullable(),
  selection_process: z.string().trim().optional().nullable(),
  conducting_body: z.string().trim().optional().nullable(),
  exam_date: z.string().trim().optional().nullable(),
  amount: z.string().trim().optional().nullable(),
  income_limit: z.string().trim().optional().nullable(),
  education_level: z.string().trim().optional().nullable(),
  required_documents: z.string().trim().optional().nullable(),
  start_date: z.string().trim().optional().nullable(),
}).transform((data) => {
  // Normalize sub_category if provided
  if (data.sub_category) {
    const normalized = normalizeSubCategory(data.sub_category);
    return { ...data, sub_category: normalized, content_action: normalized };
  }
  // Also normalize content_action if provided
  if (data.content_action) {
    const normalized = normalizeSubCategory(data.content_action);
    return { ...data, sub_category: normalized, content_action: normalized };
  }
  return data;
});

export const adminPublishBodySchema = z.object({
  itemType: adminContentTypeSchema.catch("scheme").default("scheme"),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

const normalizeCollectedDataItemType = (data: unknown) => {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;
  const itemType = (obj.itemType as string | undefined) ?? (obj.item_type as string | undefined);

  if (!itemType) return obj;

  let normalized = itemType;
  if (itemType === "schemes") normalized = "scheme";
  else if (itemType === "scholarships") normalized = "scholarship";
  else if (itemType === "jobs") normalized = "job";
  else if (itemType === "exams") normalized = "exam";

  return {
    ...obj,
    item_type: normalized,
  };
};

export const adminCollectedDataEditSchema = z
  .object({
    title: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    summary: z.string().trim().optional().nullable(),
    sub_category: z.string().trim().optional().nullable(),
    content_action: z.string().trim().optional().nullable(),
    category: z.string().trim().optional().nullable(),
    item_type: z.string().trim().optional().nullable(),
    itemType: z.string().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    deadline: z.string().trim().optional().nullable(),
    official_url: z.string().trim().optional().nullable(),
    source_url: z.string().trim().optional().nullable(),
    link: z.string().trim().optional().nullable(),
    source_id: z.string().trim().optional().nullable(),
    eligibility: z.string().trim().optional().nullable(),
    benefits: z.string().trim().optional().nullable(),
    organization: z.string().trim().optional().nullable(),
    vacancies: z.string().trim().optional().nullable(),
    education: z.string().trim().optional().nullable(),
    age_limit: z.string().trim().optional().nullable(),
    salary: z.string().trim().optional().nullable(),
    application_fee: z.string().trim().optional().nullable(),
    selection_process: z.string().trim().optional().nullable(),
    conducting_body: z.string().trim().optional().nullable(),
    exam_date: z.string().trim().optional().nullable(),
    amount: z.string().trim().optional().nullable(),
    income_limit: z.string().trim().optional().nullable(),
    education_level: z.string().trim().optional().nullable(),
    required_documents: z.string().trim().optional().nullable(),
    start_date: z.string().trim().optional().nullable(),
    admin_notes: z.string().trim().optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    rejection_reason: z.string().trim().optional().nullable(),
  })
  .transform((data) => {
    // Normalize sub_category / content_action
    const result = { ...data };
    if (result.sub_category) {
      const normalized = normalizeSubCategory(result.sub_category as string);
      result.sub_category = normalized;
      result.content_action = normalized;
    } else if (result.content_action) {
      const normalized = normalizeSubCategory(result.content_action as string);
      result.sub_category = normalized;
      result.content_action = normalized;
    }
    return normalizeCollectedDataItemType(result);
  });

export const adminUpdateBodySchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    provider: z.string().trim().min(1).optional(),
    department: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1).optional(),
    status: z.string().trim().min(1).optional(),
    verification_status: z.string().trim().min(1).optional(),
    rejection_reason: z.string().trim().optional(),
    is_expired: z.boolean().optional(),
  })
  .passthrough()
  .refine((value) => Object.keys(value).length > 0, "Update body cannot be empty")
  .refine((value) => !("id" in value), "ID cannot be updated");

export const adminStatusQuerySchema = z.object({
  itemType: adminContentTypeSchema.optional(),
});

export const adminSourceParamSchema = z.object({
  id: z.string().min(1, "Source ID is required"),
});

export const adminQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  status: z.string().trim().optional(),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["user", "admin", "moderator"]),
  confirm: z.boolean().optional(),
});

export const adminUserParamSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// ─── Bulk Action Schema ───────────────────────────────────────────
export const adminBulkActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
  reason: z.string().trim().optional(),
  targetStatus: z.string().trim().optional(),
});

export const adminBulkAiProcessSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
});
