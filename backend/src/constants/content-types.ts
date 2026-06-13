/**
 * Standardized Content Types
 * Single source of truth for all content types used across the system.
 * This ensures consistency between frontend, backend, validation, and database.
 */

/** All valid content type values for the admin/content pipeline */
export const CONTENT_TYPES = [
  "scheme",
  "scholarship",
  "job",
  "exam",
  "admit_card",
  "result",
  "answer_key",
  "notification",
  "update",
] as const;

/** More specific type for the main content tables (schemes, scholarships, jobs, exams) */
export const MAIN_CONTENT_TYPES = [
  "scheme",
  "scholarship",
  "job",
  "exam",
] as const;

/** Update types — content that is attached to a parent via content_updates */
export const UPDATE_CONTENT_TYPES = [
  "admit_card",
  "result",
  "answer_key",
  "notification",
  "update",
] as const;

/** All possible verification statuses for collected_data */
export const VERIFICATION_STATUSES = [
  "pending",
  "verified_ready",
  "approved",
  "rejected",
  "published",
  "duplicate",
  "failed",
] as const;

/** Map: content type -> public table name */
export const CONTENT_TYPE_TO_TABLE: Record<string, string> = {
  scheme: "schemes",
  scholarship: "scholarships",
  job: "jobs",
  exam: "exams",
};

/** Allowed columns per public table for publishing */
export const PUBLIC_TABLE_ALLOWED_COLUMNS: Record<string, string[]> = {
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

/** Update type enum values for content_updates */
export const UPDATE_TYPES = [
  "notification",
  "apply",
  "admit_card",
  "result",
  "answer_key",
  "update",
  "new",
  "unpublished",
  "deleted",
] as const;

export type ContentType = typeof CONTENT_TYPES[number];
export type MainContentType = typeof MAIN_CONTENT_TYPES[number];
export type UpdateContentType = typeof UPDATE_CONTENT_TYPES[number];
export type VerificationStatus = typeof VERIFICATION_STATUSES[number];
export type UpdateType = typeof UPDATE_TYPES[number];
