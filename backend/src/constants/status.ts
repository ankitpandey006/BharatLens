/**
 * Standardized Verification Statuses
 * Single source of truth — must match content-types.ts VERIFICATION_STATUSES
 */

/** All possible verification statuses for the pipeline */
export const VERIFICATION_STATUSES = [
  "pending",
  "verified_ready",
  "approved",
  "rejected",
  "published",
  "duplicate",
  "failed",
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUSES[number];

/** Convenience constants */
export const PENDING_STATUS: VerificationStatus = "pending";
export const VERIFIED_READY_STATUS: VerificationStatus = "verified_ready";
export const APPROVED_STATUS: VerificationStatus = "approved";
export const REJECTED_STATUS: VerificationStatus = "rejected";
export const PUBLISHED_STATUS: VerificationStatus = "published";
export const DUPLICATE_STATUS: VerificationStatus = "duplicate";
export const FAILED_STATUS: VerificationStatus = "failed";

/** Map to human-readable labels */
export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  verified_ready: "Verified Ready",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
  duplicate: "Duplicate",
  failed: "Failed",
};

/** 
 * Content Action types for job/exam items 
 * notification | apply | admit_card | result | answer_key 
 */
export const CONTENT_ACTIONS = [
  "notification",
  "apply",
  "admit_card",
  "result",
  "answer_key",
] as const;

export type ContentAction = typeof CONTENT_ACTIONS[number];

export const CONTENT_ACTION_LABELS: Record<string, string> = {
  notification: "Notification",
  apply: "Apply Now",
  admit_card: "Admit Card",
  result: "Result",
  answer_key: "Answer Key",
};
