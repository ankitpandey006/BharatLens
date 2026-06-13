import { createHash } from "node:crypto";
import { cleanText } from "./data-cleaner.service";
import { normalizeTitle } from "./data-cleaner.service";

// Re-export normalizeTitle so consumers importing from duplicate-detector still get it
export { normalizeTitle };

// ============================================================
// Duplicate Detection Service
// Supports multiple strategies: exact URL, content hash,
// normalized title, and similarity scoring.
// ============================================================

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  strategy: "exact_url" | "content_hash" | "normalized_title" | "similar_title" | "none";
  matchedById?: string; // ID of the existing duplicate record
  similarity?: number;  // 0-100 similarity score for title-based matches
  reason?: string;
}

/**
 * Check if a raw_url exactly matches an existing URL.
 */
export function isExactDuplicate(rawUrl: string, existingUrls: string[]): boolean {
  return existingUrls.includes(rawUrl);
}

// ============================================================
// Content hash generation
// ============================================================

/**
 * Generate a SHA-256 content hash from combined title + content.
 */
export function generateContentHash(rawTitle: string, rawContent: string): string {
  const normalized = cleanText(`${rawTitle} ${rawContent}`.toLowerCase().trim());
  if (!normalized) return "";
  return createHash("sha256").update(normalized, "utf-8").digest("hex");
}

/**
 * Check if a content hash matches any existing record.
 */
export function isContentHashDuplicate(
  contentHash: string,
  existingHashes: string[],
): { isDuplicate: boolean; matchedIndex?: number } {
  if (!contentHash || existingHashes.length === 0) {
    return { isDuplicate: false };
  }
  const idx = existingHashes.indexOf(contentHash);
  if (idx !== -1) {
    return { isDuplicate: true, matchedIndex: idx };
  }
  return { isDuplicate: false };
}

/**
 * Check if normalized title matches exactly.
 */
export function isNormalizedTitleDuplicate(
  normalizedTitle: string,
  existingNormalizedTitles: string[],
): { isDuplicate: boolean; matchedIndex?: number } {
  if (!normalizedTitle || existingNormalizedTitles.length === 0) {
    return { isDuplicate: false };
  }
  const idx = existingNormalizedTitles.indexOf(normalizedTitle);
  if (idx !== -1) {
    return { isDuplicate: true, matchedIndex: idx };
  }
  return { isDuplicate: false };
}

// ============================================================
// Title similarity (fuzzy matching via Levenshtein / bigram)
// ============================================================

function wordBigrams(text: string): Set<string> {
  const words = text.split(/\s+/).filter(Boolean);
  const bigrams = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]} ${words[i + 1]}`);
  }
  // Also add unigrams for short titles
  if (words.length <= 2) {
    for (const w of words) {
      bigrams.add(w);
    }
  }
  return bigrams;
}

/**
 * Compute Jaccard similarity (0-1) between two strings using word bigrams.
 */
export function computeTitleSimilarity(titleA: string, titleB: string): number {
  const a = normalizeTitle(titleA);
  const b = normalizeTitle(titleB);

  if (!a || !b) return 0;
  if (a === b) return 1;

  const bigramsA = wordBigrams(a);
  const bigramsB = wordBigrams(b);

  let intersection = 0;
  let union = 0;

  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) intersection++;
  }

  union = bigramsA.size + bigramsB.size - intersection;
  if (union === 0) return 0;

  return intersection / union;
}

/**
 * Find the best similar title match among a list of existing titles.
 * Returns the match with similarity above the threshold.
 */
export function findSimilarTitleMatch(
  title: string,
  existingTitles: Array<{ id: string; normalizedTitle: string }>,
  threshold = 0.8,
): { isDuplicate: boolean; matchedById?: string; similarity?: number } {
  if (!title || existingTitles.length === 0) {
    return { isDuplicate: false };
  }

  const normalized = normalizeTitle(title);
  if (!normalized) return { isDuplicate: false };

  let bestMatch: { id: string; similarity: number } | null = null;

  for (const existing of existingTitles) {
    if (!existing.normalizedTitle) continue;
    const similarity = computeTitleSimilarity(normalized, existing.normalizedTitle);
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { id: existing.id, similarity };
    }
  }

  if (bestMatch) {
    return {
      isDuplicate: true,
      matchedById: bestMatch.id,
      similarity: Math.round(bestMatch.similarity * 100),
    };
  }

  return { isDuplicate: false };
}

/**
 * Full duplicate check — runs all strategies and returns the first match.
 */
export async function checkForDuplicates(
  rawUrl: string,
  rawTitle: string,
  rawContent: string,
  context: {
    existingUrls: string[];
    existingContentHashes: string[];
    existingNormalizedTitles: Array<{ id: string; normalizedTitle: string }>;
  },
): Promise<DuplicateCheckResult> {
  // 1. Exact URL check (fastest)
  if (isExactDuplicate(rawUrl, context.existingUrls)) {
    return {
      isDuplicate: true,
      strategy: "exact_url",
      reason: "Duplicate raw_url",
    };
  }

  // 2. Content hash check
  const contentHash = generateContentHash(rawTitle, rawContent);
  if (contentHash) {
    const hashResult = isContentHashDuplicate(contentHash, context.existingContentHashes);
    if (hashResult.isDuplicate) {
      const matchedId =
        context.existingNormalizedTitles[hashResult.matchedIndex!]?.id;
      return {
        isDuplicate: true,
        strategy: "content_hash",
        matchedById: matchedId,
        reason: "Duplicate content hash",
      };
    }
  }

  // 3. Normalized title exact match
  const normalizedTitle = normalizeTitle(rawTitle);
  if (normalizedTitle) {
    const titleResult = isNormalizedTitleDuplicate(normalizedTitle, context.existingNormalizedTitles.map((t) => t.normalizedTitle));
    if (titleResult.isDuplicate) {
      const matchedId =
        context.existingNormalizedTitles[titleResult.matchedIndex!]?.id;
      return {
        isDuplicate: true,
        strategy: "normalized_title",
        matchedById: matchedId,
        reason: "Duplicate after title normalization",
      };
    }
  }

  // 4. Fuzzy title similarity (catch near-duplicates)
  const similarMatch = findSimilarTitleMatch(
    rawTitle,
    context.existingNormalizedTitles.filter((t) => t.normalizedTitle),
    0.85,
  );
  if (similarMatch.isDuplicate) {
    return {
      isDuplicate: true,
      strategy: "similar_title",
      matchedById: similarMatch.matchedById,
      similarity: similarMatch.similarity,
      reason: `Similar title (${similarMatch.similarity}% match)`,
    };
  }

  return { isDuplicate: false, strategy: "none" };
}
