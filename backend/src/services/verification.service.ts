import { cleanText, isValidUrl } from "../ai/data-cleaner.service";
import { generateContentHash } from "../ai/duplicate-detector.service";
import { findSourceById } from "../repositories/collected-data.repository";

// ============================================================
// Verification Service
// Handles:
// - Required field validation
// - URL format validation
// - Source trust evaluation
// - Verification score calculation (0-100)
// - Verification status assignment
// ============================================================

export type VerificationStatus =
  | "pending"
  | "duplicate"
  | "rejected"
  | "failed"
  | "verified_ready"
  | "approved";

export interface VerificationResult {
  verification_status: VerificationStatus;
  verification_score: number;
  verification_notes: string | null;
  normalized_title: string | null;
  content_hash: string | null;
}

export interface RequiredFieldCheck {
  field: string;
  present: boolean;
  value: string;
}

// ============================================================
// Required Fields
// ============================================================

const REQUIRED_FIELDS = [
  "raw_title",
  "raw_content",
  "raw_url",
  "source_id",
  "collection_method",
] as const;

/**
 * Check that all required fields are present and non-empty.
 */
export function checkRequiredFields(
  record: Record<string, unknown>,
): { checks: RequiredFieldCheck[]; missingCount: number } {
  const checks: RequiredFieldCheck[] = [];
  let missingCount = 0;

  for (const field of REQUIRED_FIELDS) {
    const value = record[field];
    const strValue = typeof value === "string" ? value.trim() : "";
    const present = strValue.length > 0;
    checks.push({ field, present, value: strValue });
    if (!present) missingCount++;
  }

  return { checks, missingCount };
}

// ============================================================
// URL Validation
// ============================================================

/**
 * Validate a URL string — must be http or https.
 * Re-exported from data-cleaner for convenience.
 */
export { isValidUrl } from "../ai/data-cleaner.service";

/**
 * Check the official_url / source_url / raw_url fields.
 */
export function checkUrlFields(
  record: Record<string, unknown>,
): { validUrls: number; invalidUrls: string[] } {
  const urlCandidates = ["official_url", "source_url", "raw_url"];
  const invalidUrls: string[] = [];
  let validUrls = 0;

  for (const field of urlCandidates) {
    const value = record[field];
    const strValue = typeof value === "string" ? value : "";
    if (strValue.trim()) {
      if (isValidUrl(strValue)) {
        validUrls++;
      } else {
        invalidUrls.push(`${field}: ${strValue.slice(0, 80)}`);
      }
    }
  }

  return { validUrls, invalidUrls };
}

// ============================================================
// Source Trust Evaluation
// ============================================================

export interface SourceTrustInfo {
  exists: boolean;
  isVerified: boolean;
  trustScore: number;
  sourceType: string | null;
}

/**
 * Evaluate the trustworthiness of a source.
 */
export async function evaluateSourceTrust(
  sourceId: string | null | undefined,
): Promise<SourceTrustInfo> {
  if (!sourceId) {
    return { exists: false, isVerified: false, trustScore: 0, sourceType: null };
  }

  try {
    // source_id in collected_data is a UUID primary key, not a name
    const source = await findSourceById(sourceId);

    if (!source) {
      return { exists: false, isVerified: false, trustScore: 0, sourceType: null };
    }

    return {
      exists: true,
      isVerified: source.is_verified ?? false,
      trustScore: source.trust_score ?? 0,
      sourceType: source.source_type ?? null,
    };
  } catch {
    return { exists: false, isVerified: false, trustScore: 0, sourceType: null };
  }
}

// ============================================================
// Item Type Classification Confidence
// ============================================================

/**
 * Check if item_type is one of the known types.
 */
export function checkItemType(
  itemType: string | null | undefined,
): { valid: boolean; type: string } {
  const type = (itemType ?? "scheme").trim().toLowerCase();
  const validTypes = ["scheme", "scholarship", "job", "exam", "notification"];
  if (validTypes.includes(type)) {
    return { valid: true, type };
  }
  return { valid: false, type: "unknown" };
}

// ============================================================
// Content Quality Check
// ============================================================

/**
 * Check if content is meaningful (has enough substance).
 */
export function checkContentQuality(
  rawTitle: string,
  rawContent: string,
): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 100;

  const title = cleanText(rawTitle);
  const content = cleanText(rawContent);

  if (!title || title.length < 3) {
    score -= 30;
    notes.push("Missing or very short title");
  } else if (title.length < 15) {
    score -= 10;
    notes.push("Short title");
  }

  if (!content || content.length < 10) {
    score -= 30;
    notes.push("Missing or very short content");
  } else if (content.length < 100) {
    score -= 10;
    notes.push("Short content");
  }

  // Check for gibberish (very low word diversity)
  if (content) {
    const words = content.toLowerCase().split(/\s+/).filter(Boolean);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size < words.length * 0.3) {
      score -= 20;
      notes.push("Low word diversity — possible spam or boilerplate");
    }
  }

  return { score: Math.max(0, score), notes };
}

// ============================================================
// Main Verification Function
// ============================================================

/**
 * Run full verification on a collected data record.
 *
 * Scoring logic (out of 100):
 * - Required fields present: +40 (deduct 10 per missing)
 * - Source is verified: +20
 * - Source trust score: +10 (if above threshold)
 * - URL valid: +10
 * - Item type valid: +10
 * - Content quality: +10
 */
export async function verifyCollectedData(
  record: Record<string, unknown>,
): Promise<VerificationResult> {
  const notes: string[] = [];
  let score = 0;

  // 1. Required fields check (+40 max, -10 per missing)
  const { checks, missingCount } = checkRequiredFields(record);
  score += Math.max(0, 40 - missingCount * 10);
  if (missingCount > 0) {
    const missing = checks.filter((c) => !c.present).map((c) => c.field);
    notes.push(`Missing fields: ${missing.join(", ")}`);
  }

  // 2. URL validation (+10)
  const { validUrls, invalidUrls } = checkUrlFields(record);
  if (validUrls > 0) {
    score += 10;
  } else {
    notes.push("No valid URLs found");
  }
  if (invalidUrls.length > 0) {
    notes.push(`Invalid URLs: ${invalidUrls.join("; ")}`);
  }

  // 3. Source trust evaluation (+30 max)
  const sourceId = record.source_id as string | null | undefined;
  if (sourceId) {
    const sourceInfo = await evaluateSourceTrust(sourceId);
    if (sourceInfo.isVerified) {
      score += 20;
    } else if (sourceInfo.exists) {
      score += 10;
      notes.push("Source exists but not verified");
    } else {
      notes.push("Source not found in sources table");
    }

    if (sourceInfo.trustScore >= 50) {
      score += 10;
    } else if (sourceInfo.trustScore > 0) {
      score += 5;
      notes.push(`Low source trust score (${sourceInfo.trustScore})`);
    }
  } else {
    notes.push("No source_id provided");
  }

  // 4. Item type check (+10)
  const itemType = record.item_type as string | null | undefined;
  const { valid: typeValid, type } = checkItemType(itemType);
  if (typeValid) {
    score += 10;
  } else {
    notes.push(`Unknown item_type: ${type}`);
  }

  // 5. Content quality (+10)
  const rawTitle = record.raw_title as string | null | undefined ?? "";
  const rawContent = record.raw_content as string | null | undefined ?? "";
  const { score: qualityScore, notes: qualityNotes } = checkContentQuality(
    rawTitle,
    rawContent,
  );
  if (qualityScore >= 80) {
    score += 10;
  } else if (qualityScore >= 50) {
    score += 5;
    notes.push(...qualityNotes);
  } else {
    notes.push(...qualityNotes);
  }

  // Determine verification_status based on score
  let verification_status: VerificationStatus;
  if (score < 30) {
    verification_status = "rejected";
    notes.push("Low quality — rejected by automatic verification");
  } else if (score < 60) {
    verification_status = "pending";
    notes.push("Medium quality — requires manual review");
  } else {
    verification_status = "verified_ready";
    notes.push("Verified — ready for admin review");
  }

  // Generate normalized_title and content_hash
  const normalized_title = rawTitle ? cleanText(rawTitle).toLowerCase().slice(0, 256) : null;
  const titleStr = typeof rawTitle === "string" ? rawTitle : "";
  const contentStr = typeof rawContent === "string" ? rawContent : "";
  const content_hash = (titleStr || contentStr)
    ? generateContentHash(titleStr, contentStr)
    : null;

  return {
    verification_status,
    verification_score: Math.min(100, Math.max(0, score)),
    verification_notes: notes.length > 0 ? notes.join("; ") : null,
    normalized_title,
    content_hash,
  };
}


