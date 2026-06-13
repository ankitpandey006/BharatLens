/**
 * Shared admin utility functions for mapping backend content items to AdminItem.
 * Consolidates duplicated mapToAdminItem logic across admin pages.
 */
import type { AdminItem, ItemCategory, ItemStatus, ItemType } from "@/types/admin";
import type { BackendAdminContentItem } from "./admin";

const statusMap: Record<string, ItemStatus> = {
  collected: "pending",
  processing: "pending",
  processed: "verified_ready",
  pending: "pending",
  pending_verification: "pending",
  verified_ready: "verified_ready",
  approved: "approved",
  rejected: "rejected",
  published: "published",
  duplicate: "duplicate",
  failed: "failed",
};

/** Normalize any type string to our standardized ItemType */
function normalizeItemType(rawType: unknown): ItemType {
  const type = String(rawType ?? "").toLowerCase().trim();

  const VALID_TYPES = [
    "scheme",
    "scholarship",
    "job",
    "exam",
    "admit_card",
    "result",
    "answer_key",
    "notification",
    "update",
  ];

  if (VALID_TYPES.includes(type)) {
    return type as ItemType;
  }

  // Map common variations
  if (["admitcard", "admit-card"].includes(type)) return "admit_card";
  if (["answerkey", "answer-key"].includes(type)) return "answer_key";

  return "scheme";
}

export function mapBackendItemToAdminItem(it: BackendAdminContentItem): AdminItem {
  const rawStatus = (
    String(it.verification_status ?? "") ||
    String(it.processing_status ?? "") ||
    String(it.status ?? "") ||
    ""
  ).toLowerCase();

  const status: ItemStatus = (statusMap[rawStatus] as ItemStatus) || "pending";

  const record = it as Record<string, unknown>;

  return {
    id: it.id,
    title: it.title || record.raw_title as string || "Untitled",
    type: normalizeItemType(it.item_type || record.content_type as string),
    category: (String(it.category || "general") as ItemCategory),
    sourceName: it.source_name || it.sourceName || "",
    sourceUrl: it.source_url || record.raw_url as string || it.sourceUrl || it.rawUrl || "",
    summary: String(it.description ?? record.rawContent ?? record.raw_content ?? ""),
    eligibility: String(it.eligibility ?? ""),
    benefits: String(it.benefits ?? ""),
    deadline: it.deadline ?? null,
    state: String(it.state ?? ""),
    status,
    aiConfidenceScore: Number(
      record.ai_confidence ??
      record.confidence ??
      0
    ),
    sourceTrustScore: Number(
      record.source_trust ?? 0
    ),
    aiNotes: String(
      record.ai_notes ?? it.admin_notes ?? ""
    ),
    adminNotes: it.admin_notes || "",
    lastUpdated: String(it.updated_at || it.created_at || ""),
    publishedAt: it.published_at ?? null,
    tags: [],
    rawUrl: record.raw_url as string || it.rawUrl || "",
    rawContent: record.raw_content as string || it.rawContent || "",
    collectionMethod: record.collection_method as string || it.collectionMethod || "",
    // Map AI processing fields
    aiConfidence: Number(record.ai_confidence ?? record.confidence ?? 0),
    aiOutput: record.ai_output as Record<string, unknown> | undefined,
    processedAt: record.processed_at as string | null ?? null,
    verificationScore: Number(record.verification_score ?? 0),
    verificationNotes: record.verification_notes as string | null ?? null,
    contentAction: (record.content_action as string) || (record.sub_category as string) || undefined,
    subCategory: (record.sub_category as string) || (record.content_action as string) || undefined,
    duplicateReason: record.duplicate_reason as string | null ?? null,
    normalizedTitle: record.normalized_title as string | null ?? null,
    duplicateOfId: record.duplicate_of_id as string | null ?? null,
  };
}
