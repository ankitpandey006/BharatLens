export type ItemType = "scheme" | "scholarship" | "job" | "exam" | "update";
export type ItemStatus =
  | "ai_processed"
  | "pending"
  | "pending_verification"
  | "approved"
  | "rejected"
  | "published";
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
