/**
 * AI Processing Service
 *
 * Orchestrates the full AI pipeline for collected_data items:
 * 1. AI extraction (Gemini with rule-based fallback)
 * 2. Verification scoring
 * 3. Duplicate detection
 * 4. Processing log creation
 *
 * This is the main entry point for all AI processing operations.
 */

import { aiClassifyAndExtract, fallbackExtraction } from "../ai/gemini.service";
import { classifyText } from "../ai/classifier.service";
import { verifyCollectedData } from "./verification.service";
import { checkForDuplicates } from "../ai/duplicate-detector.service";
import {
  getCollectedDataById,
  updateCollectedDataById,
  findExistingContentHashes,
  findExistingNormalizedTitles,
  listCollectedData,
  findCollectedUrls,
} from "../repositories/collected-data.repository";
import {
  insertAiProcessingLog,
  getAiProcessingLogsByDataId,
} from "../repositories/ai-processing-log.repository";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

// ─── Schema-cache resilience ────────────────────────────────────
// When Supabase schema cache hasn't refreshed, column updates fail.
// This helper drops unknown columns and retries, matching the pattern
// used in admin.service.ts for maximum resilience.

function extractMissingColumnName(message: string): string | null {
  const regex1 = /column\s+"?([a-zA-Z0-9_]+)"?\s+does not exist/i;
  const regex2 = /Could not find the '([a-zA-Z0-9_]+)' column/i;
  const match = message.match(regex1) ?? message.match(regex2);
  return match?.[1] ?? null;
}

function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}

async function updateWithFallback(id: string, updates: Record<string, unknown>): Promise<void> {
  const pending = { ...updates };

  while (Object.keys(pending).length > 0) {
    try {
      await updateCollectedDataById(id, pending);
      return;
    } catch (error) {
      const message = getErrorMessage(error);
      const missingColumn = extractMissingColumnName(message);

      if (!missingColumn || !(missingColumn in pending)) {
        console.warn(`[ai-processing] Non-column error updating item ${id}: ${message}`);
        throw error;
      }

      console.warn(`[ai-processing] Column "${missingColumn}" not found in schema, skipping...`);
      delete pending[missingColumn];
    }
  }
}

// Helper: delay for cooldown between Gemini calls
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// Types
// ============================================================

export interface AiProcessingResult {
  id: string;
  success: boolean;
  classification: string;
  confidence: number;
  verification_status: string;
  verification_score: number;
  error?: string;
  fallback_used: boolean;
  processing_time_ms: number;
}

export interface AiProcessingBatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: AiProcessingResult[];
}

// ============================================================
// Process a single collected data item
// ============================================================

/**
 * Run the full AI pipeline on a single collected_data item.
 * Steps:
 * 1. Fetch the item
 * 2. Run AI extraction (Gemini → fallback)
 * 3. Run verification scoring
 * 4. Run duplicate detection
 * 5. Update the item with all results
 * 6. Write processing log
 */
export async function processSingleItem(itemId: string): Promise<AiProcessingResult> {
  const startTime = Date.now();
  const item = await getCollectedDataById(itemId);

  if (!item) {
    throw new AppError(`Collected data item ${itemId} not found`, 404);
  }

  // Skip already-published items
  if (item.verification_status === "published") {
    return {
      id: itemId,
      success: true,
      classification: item.item_type ?? "unknown",
      confidence: item.ai_confidence ?? 0,
      verification_status: "published",
      verification_score: item.verification_score ?? 0,
      fallback_used: false,
      processing_time_ms: 0,
    };
  }

  const rawTitle = item.raw_title ?? "";
  const rawContent = item.raw_content ?? "";
  const rawUrl = item.raw_url ?? "";

  let aiResult;
  let aiError: string | null = null;
  let fallbackUsed = false;

  // Step 1: AI extraction
  try {
    aiResult = await aiClassifyAndExtract(rawTitle, rawContent);
    fallbackUsed = aiResult.fallback_used;
  } catch (error) {
    aiError = error instanceof Error ? error.message : String(error);
    console.error(`[ai-processing] AI extraction failed for ${itemId}:`, aiError);
    // Use fallback classification (imported at top of file)
    const fallbackClassification = classifyText(`${rawTitle} ${rawContent}`);
    const fallbackResult = fallbackExtraction(rawTitle, rawContent, fallbackClassification);
    aiResult = fallbackResult ?? {
      classification: "unknown" as const,
      confidence: 10,
      extracted: {
        title: rawTitle || null,
        summary: rawContent?.slice(0, 500) || null,
        category: null,
        item_type: null,
        eligibility: null,
        age_limit: null,
        income_limit: null,
        education_level: null,
        state: null,
        deadline: null,
        documents_required: null,
        keywords: [],
        official_url: null,
      },
      raw_response: null,
      fallback_used: true,
    };
    fallbackUsed = true;
  }

  // Step 2: Verification scoring
  let verificationResult;
  try {
    verificationResult = await verifyCollectedData({
      ...item,
      ...aiResult.extracted,
      item_type: aiResult.classification,
    });
  } catch (error) {
    console.error(`[ai-processing] Verification failed for ${itemId}:`, error);
    verificationResult = {
      verification_status: "failed" as const,
      verification_score: 0,
      verification_notes: "Verification engine error",
      normalized_title: null,
      content_hash: null,
    };
  }

  // Step 3: Duplicate detection
  let duplicateResult: {
    isDuplicate: boolean;
    strategy: string;
    matchedById?: string;
    similarity?: number;
    reason?: string;
  } = { isDuplicate: false, strategy: "none" };

  try {
    const [existingUrls, contentHashes, existingTitles] = await Promise.all([
      findCollectedUrls([rawUrl]).catch(() => [] as string[]),
      findExistingContentHashes().catch(() => [] as string[]),
      findExistingNormalizedTitles().catch(() => [] as Array<{ id: string; normalized_title: string }>),
    ]);

    duplicateResult = await checkForDuplicates(
      rawUrl,
      rawTitle,
      rawContent,
      {
        existingUrls,
        existingContentHashes: contentHashes,
        existingNormalizedTitles: existingTitles.map((t) => ({
          id: t.id,
          normalizedTitle: t.normalized_title,
        })),
      },
    );
  } catch (error) {
    console.error(`[ai-processing] Duplicate detection failed for ${itemId}:`, error);
  }

  // Step 4: Determine final status
  let finalStatus = verificationResult.verification_status;
  if (duplicateResult.isDuplicate) {
    finalStatus = "duplicate";
  } else if (verificationResult.verification_score >= 70) {
    finalStatus = "verified_ready";
  } else if (verificationResult.verification_score < 30) {
    finalStatus = "rejected";
  } else {
    finalStatus = "pending";
  }

  // Override: If fallback was used but Gemini was available and just rate-limited,
  // keep as pending for admin review rather than auto-rejecting
  if (finalStatus === "pending" && aiResult.fallback_used && aiResult.confidence < 30) {
    finalStatus = "pending";
  }

  // Cap verification score
  let finalScore = verificationResult.verification_score;
  if (finalStatus === "verified_ready" && finalScore < 70) {
    finalScore = Math.max(70, finalScore);
  }

  // Store processing notes
  const processingNotes = verificationResult.verification_notes
    ? verificationResult.verification_notes
    : (finalStatus === "verified_ready"
        ? "Auto-verified: meets quality criteria"
        : "Requires manual review");

  // Step 5: Build updates
  const aiOutput = {
    classification: aiResult.classification,
    confidence: aiResult.confidence,
    title: aiResult.extracted.title,
    summary: aiResult.extracted.summary,
    category: aiResult.extracted.category,
    item_type: aiResult.extracted.item_type,
    eligibility: aiResult.extracted.eligibility,
    age_limit: aiResult.extracted.age_limit,
    income_limit: aiResult.extracted.income_limit,
    education_level: aiResult.extracted.education_level,
    state: aiResult.extracted.state,
    deadline: aiResult.extracted.deadline,
    documents_required: aiResult.extracted.documents_required,
    keywords: aiResult.extracted.keywords,
    official_url: aiResult.extracted.official_url,
  };

  const updates: Record<string, unknown> = {
    ai_output: aiOutput,
    ai_confidence: aiResult.confidence,
    processed_at: new Date().toISOString(),
    verification_status: finalStatus,
    verification_score: finalScore,
    verification_notes: processingNotes,
    normalized_title: verificationResult.normalized_title ?? (rawTitle.toLowerCase().trim().slice(0, 256) || null),
    content_hash: verificationResult.content_hash,
  };

  // Sync extracted fields to the main columns
  if (aiResult.extracted.title) {
    updates.title = aiResult.extracted.title;
  }
  if (aiResult.extracted.summary) {
    updates.description = aiResult.extracted.summary;
  }
  if (aiResult.extracted.category) {
    updates.category = aiResult.extracted.category;
  }
  if (aiResult.extracted.state) {
    updates.state = aiResult.extracted.state;
  }
  if (aiResult.extracted.deadline) {
    updates.deadline = aiResult.extracted.deadline;
  }
  if (aiResult.extracted.official_url) {
    updates.official_url = aiResult.extracted.official_url;
  }
  if (aiResult.extracted.item_type) {
    updates.item_type = aiResult.extracted.item_type;
  }

  // If duplicate, store reason
  if (duplicateResult.isDuplicate) {
    updates.duplicate_reason = duplicateResult.reason ?? "Duplicate detected";
    updates.duplicate_of_id = duplicateResult.matchedById ?? null;
  }

  // Step 6: Update the item (with schema-cache resilience)
  try {
    await updateWithFallback(itemId, updates);
  } catch (error) {
    console.error(`[ai-processing] Failed to update item ${itemId}:`, error);
    throw new AppError(`Failed to save AI processing results for ${itemId}`, 500);
  }

  // Step 7: Write processing log
  const processingTime = Date.now() - startTime;
  try {
    await insertAiProcessingLog({
      collected_data_id: itemId,
      input_item: {
        raw_title: rawTitle,
        raw_content: rawContent.slice(0, 500),
        raw_url: rawUrl,
      },
      ai_output: aiOutput as Record<string, unknown>,
      confidence: aiResult.confidence,
      processing_time_ms: processingTime,
      error_message: aiError,
      fallback_used: fallbackUsed,
      status: aiError ? "error" : "success",
    });
  } catch (error) {
    console.error(`[ai-processing] Failed to write processing log for ${itemId}:`, error);
  }

  return {
    id: itemId,
    success: !aiError,
    classification: aiResult.classification,
    confidence: aiResult.confidence,
    verification_status: finalStatus,
    verification_score: finalScore,
    error: aiError ?? undefined,
    fallback_used: fallbackUsed,
    processing_time_ms: processingTime,
  };
}

// ============================================================
// Process pending items (batch)
// ============================================================

/**
 * Process all pending collected_data items with a safe batch limit.
 * Default limit is 10 to avoid overloading the system.
 */
export async function processPendingItems(
  batchSize?: number,
): Promise<AiProcessingBatchResult> {
  // Use env default if not provided, cap at 50 max
  const effectiveBatchSize = batchSize ?? env.AI_BATCH_LIMIT;
  const safeBatchSize = Math.min(Math.max(1, effectiveBatchSize), 50);

  const { items } = await listCollectedData(1, safeBatchSize, "pending");

  if (items.length === 0) {
    return { total: 0, succeeded: 0, failed: 0, results: [] };
  }

  const results: AiProcessingResult[] = [];
  let succeeded = 0;
  let failed = 0;
  const requestDelayMs = env.GEMINI_REQUEST_DELAY_MS;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Add cooldown between items (but not before first)
    if (i > 0 && requestDelayMs > 0) {
      console.log(`[ai-processing] Cooldown ${requestDelayMs}ms before processing next item...`);
      await delay(requestDelayMs);
    }

    try {
      const result = await processSingleItem(item.id);
      results.push(result);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      results.push({
        id: item.id,
        success: false,
        classification: "unknown",
        confidence: 0,
        verification_status: "failed",
        verification_score: 0,
        error: error instanceof Error ? error.message : String(error),
        fallback_used: true,
        processing_time_ms: 0,
      });
    }
  }

  return {
    total: items.length,
    succeeded,
    failed,
    results,
  };
}

// ============================================================
// Re-check verification for an item
// ============================================================

/**
 * Re-run verification and duplicate detection on an already-processed item.
 * Does NOT re-run AI extraction — only re-scores verification.
 */
export async function recheckVerification(itemId: string): Promise<AiProcessingResult> {
  const startTime = Date.now();
  const item = await getCollectedDataById(itemId);

  if (!item) {
    throw new AppError(`Collected data item ${itemId} not found`, 404);
  }

  // Use existing AI output if available, or raw data
  const aiOutput = item.ai_output as Record<string, unknown> | null;

  const verificationInput = {
    ...item,
    item_type: aiOutput?.item_type ?? item.item_type,
    title: aiOutput?.title ?? item.title ?? item.raw_title,
    description: aiOutput?.summary ?? item.description ?? item.raw_content,
    official_url: aiOutput?.official_url ?? item.official_url ?? item.raw_url,
  };

  const verificationResult = await verifyCollectedData(verificationInput);

  const rawTitle = item.raw_title ?? "";
  const rawContent = item.raw_content ?? "";
  const rawUrl = item.raw_url ?? "";

  let duplicateResult: {
    isDuplicate: boolean;
    strategy: string;
    matchedById?: string;
    similarity?: number;
    reason?: string;
  } = { isDuplicate: false, strategy: "none" };

  try {
    const contentHashes = await findExistingContentHashes();
    const existingTitles = await findExistingNormalizedTitles();
    const existingUrls = await findCollectedUrls([rawUrl]);

    duplicateResult = await checkForDuplicates(rawUrl, rawTitle, rawContent, {
      existingUrls,
      existingContentHashes: contentHashes,
      existingNormalizedTitles: existingTitles.map((t) => ({
        id: t.id,
        normalizedTitle: t.normalized_title,
      })),
    });
  } catch (error) {
    console.error(`[ai-processing] Recheck duplicate detection failed for ${itemId}:`, error);
  }

  let finalStatus = verificationResult.verification_status;
  if (duplicateResult.isDuplicate) {
    finalStatus = "duplicate";
  }

  const updates: Record<string, unknown> = {
    verification_status: finalStatus,
    verification_score: verificationResult.verification_score,
    verification_notes: verificationResult.verification_notes,
    normalized_title: verificationResult.normalized_title,
    content_hash: verificationResult.content_hash,
    last_verified_at: new Date().toISOString(),
  };

  if (duplicateResult.isDuplicate) {
    updates.duplicate_reason = duplicateResult.reason ?? "Duplicate detected";
    updates.duplicate_of_id = duplicateResult.matchedById ?? null;
  }

  await updateWithFallback(itemId, updates);

  return {
    id: itemId,
    success: true,
    classification: item.item_type ?? "unknown",
    confidence: item.ai_confidence ?? 0,
    verification_status: finalStatus,
    verification_score: verificationResult.verification_score,
    fallback_used: false,
    processing_time_ms: Date.now() - startTime,
  };
}

// ============================================================
// Get processing logs for an item
// ============================================================

export async function getProcessingLogs(itemId: string) {
  return getAiProcessingLogsByDataId(itemId);
}
