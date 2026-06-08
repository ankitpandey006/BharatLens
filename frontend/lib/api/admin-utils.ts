/**
 * Shared admin utility functions for mapping backend content items to AdminItem.
 * Consolidates duplicated mapToAdminItem logic across admin pages.
 */
import type { AdminItem, ItemCategory, ItemStatus, ItemType } from "@/types/admin";
import type { BackendAdminContentItem } from "./admin";

const statusMap: Record<string, ItemStatus> = {
  collected: "pending_verification",
  processed: "published",
  processing: "approved",
  failed: "rejected",
  pending: "pending_verification",
  pending_verification: "pending_verification",
  approved: "approved",
  rejected: "rejected",
  published: "published",
};

function normalizeItemType(rawType: unknown): ItemType {
  const type = String(rawType ?? "").toLowerCase();
  if (type === "scheme" || type === "scholarship" || type === "job" || type === "exam") {
    return type;
  }
  return "update";
}

export function mapBackendItemToAdminItem(it: BackendAdminContentItem): AdminItem {
  const rawStatus = (
    String(it.verification_status ?? "") ||
    String(it.processing_status ?? "") ||
    String(it.status ?? "") ||
    ""
  ).toLowerCase();

  const status: ItemStatus = (statusMap[rawStatus] as ItemStatus) || "ai_processed";

  return {
    id: it.id,
    title: it.title || (it as Record<string, unknown>).raw_title as string || "Untitled",
    type: normalizeItemType(it.item_type),
    category: (String(it.category || "general") as ItemCategory),
    sourceName: it.source_name || it.sourceName || "",
    sourceUrl: it.source_url || (it as Record<string, unknown>).raw_url as string || it.sourceUrl || it.rawUrl || "",
    summary: String(it.description ?? (it as Record<string, unknown>).rawContent ?? (it as Record<string, unknown>).raw_content ?? ""),
    eligibility: String(it.eligibility ?? ""),
    benefits: String(it.benefits ?? ""),
    deadline: it.deadline ?? null,
    state: String(it.state ?? ""),
    status,
    aiConfidenceScore: Number(
      (it as Record<string, unknown>).ai_confidence ??
      (it as Record<string, unknown>).confidence ??
      0
    ),
    sourceTrustScore: Number(
      (it as Record<string, unknown>).source_trust ?? 0
    ),
    aiNotes: String(
      (it as Record<string, unknown>).ai_notes ?? it.admin_notes ?? ""
    ),
    adminNotes: it.admin_notes || "",
    lastUpdated: String(it.updated_at || it.created_at || ""),
    publishedAt: it.published_at ?? null,
    tags: [],
    rawUrl: (it as Record<string, unknown>).raw_url as string || it.rawUrl || "",
    rawContent: (it as Record<string, unknown>).raw_content as string || it.rawContent || "",
    collectionMethod: (it as Record<string, unknown>).collection_method as string || it.collectionMethod || "",
  };
}
