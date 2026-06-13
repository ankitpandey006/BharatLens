/**
 * Standardized Content Types
 * Single source of truth for all content types across frontend and backend.
 * Must match backend/src/constants/content-types.ts
 */

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

export const MAIN_CONTENT_TYPES = [
  "scheme",
  "scholarship",
  "job",
  "exam",
] as const;

export const UPDATE_CONTENT_TYPES = [
  "admit_card",
  "result",
  "answer_key",
  "notification",
  "update",
] as const;

// Standard + legacy status values that may appear from the backend
const ALL_STATUSES = [
  "pending",
  "ai_processed",
  "pending_verification",
  "verified_ready",
  "approved",
  "rejected",
  "published",
  "duplicate",
  "failed",
] as const;

export const VERIFICATION_STATUSES = ALL_STATUSES;

export type ItemType = typeof CONTENT_TYPES[number];
export type MainContentType = typeof MAIN_CONTENT_TYPES[number];
export type UpdateContentType = typeof UPDATE_CONTENT_TYPES[number];
export type ItemStatus = typeof ALL_STATUSES[number];

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  ai_processed: "Processing",
  pending_verification: "Pending",
  verified_ready: "Verified Ready",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
  duplicate: "Duplicate",
  failed: "Failed",
};

export type ItemCategory =
  | "general"
  | "obc"
  | "sc"
  | "st"
  | "ebc"
  | "women"
  | "minority"
  | "ews"
  | "disability"
  | "agriculture"
  | "student"
  | "job_seeker";

export interface AdminItem {
  id: string;
  title: string;
  type: ItemType;
  category: ItemCategory;
  sourceName: string;
  sourceUrl: string;
  description?: string;
  summary: string;
  eligibility: string;
  benefits: string;
  deadline: string | null;
  state: string;
  status: ItemStatus;
  aiConfidenceScore: number; // 0-100
  sourceTrustScore: number; // 0-100
  aiNotes: string;
  adminNotes: string;
  lastUpdated: string; // ISO date
  publishedAt: string | null; // ISO date
  tags: string[];
  matchedUsersCount?: number;
  recommendationEligible?: boolean;
  rawUrl?: string;
  rawContent?: string;
  collectionMethod?: string;
  // AI Processing fields
  aiConfidence?: number; // 0-100
  aiOutput?: Record<string, unknown>;
  processedAt?: string | null;
  // Content action for job/exam items (notification | apply_now | admit_card | result | answer_key)
  contentAction?: string;
  // Consistent sub_category field
  subCategory?: string;
  // Verification fields
  verificationScore?: number; // 0-100
  verificationNotes?: string | null;
  duplicateReason?: string | null;
  normalizedTitle?: string | null;
  duplicateOfId?: string | null;
}

export interface AdminStats {
  totalAiItems: number;
  pendingVerification: number;
  approved: number;
  rejected: number;
  published: number;
  highPriorityAlerts: number;
}

export interface FilterState {
  search: string;
  type: ItemType | "all";
  status: ItemStatus | "all";
  state: string;
  source: string;
  sortBy: "confidence" | "trust" | "latest" | "deadline";
  sortOrder: "asc" | "desc";
}

export interface VerificationPanelData extends AdminItem {
  originalTitle?: string;
  originalSummary?: string;
  editMode?: boolean;
}
