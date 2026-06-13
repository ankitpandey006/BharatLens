/**
 * Pipeline Orchestration Service
 * Orchestrates: collect → clean → verify → dedup → classify → log
 * Provides detailed per-run logging and status tracking.
 */

import { cleanText, normalizeUrl, normalizeDeadline } from "../ai/data-cleaner.service";
import { verifyCollectedData } from "./verification.service";
import { checkForDuplicates, generateContentHash, normalizeTitle } from "../ai/duplicate-detector.service";
import { classifyText } from "../ai/classifier.service";
import { aiClassifyAndExtract } from "../ai/gemini.service";
import {
  listCollectedData,
  updateCollectedDataById,
  findExistingContentHashes,
  findExistingNormalizedTitles,
  getCollectedDataById,
  insertCollectedData,
} from "../repositories/collected-data.repository";
import { insertAiProcessingLog } from "../repositories/ai-processing-log.repository";
import { supabase } from "../config/supabase";
import { env } from "../config/env";
import { runAllCollectors } from "./collector.service";
import type { CollectedDataRow } from "../repositories/collected-data.repository";

// ============================================================
// Types
// ============================================================

export interface PipelineRunResult {
  totalFetched: number;
  cleaned: number;
  fakeRemoved: number;
  duplicateRemoved: number;
  suspicious: number;
  pendingVerification: number;
  failed: number;
  sourceWise: Record<string, SourceResult>;
  durationMs: number;
}

export interface SourceResult {
  fetched: number;
  inserted: number;
  cleaned: number;
  verified: number;
  duplicates: number;
  failed: number;
}

export interface PipelineLogEntry {
  collected_data_id: string;
  processing_type: string;
  status: string;
  reason: string | null;
  confidence_score: number;
  source_name: string;
  items_processed: number;
  items_failed: number;
  items_duplicate: number;
}

// ============================================================
// Update helper with schema resilience
// ============================================================

function extractMissingColumnName(message: string): string | null {
  const regex1 = /column\s+"?([a-zA-Z0-9_]+)"?\s+does not exist/i;
  const regex2 = /Could not find the '([a-zA-Z0-9_]+)' column/i;
  const match = message.match(regex1) ?? message.match(regex2);
  return match?.[1] ?? null;
}

async function updateWithFallback(
  id: string,
  updates: Record<string, unknown>,
): Promise<CollectedDataRow | null> {
  const pending = { ...updates };

  while (Object.keys(pending).length > 0) {
    try {
      return await updateCollectedDataById(id, pending);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const missingColumn = extractMissingColumnName(message);

      if (!missingColumn || !(missingColumn in pending)) {
        throw error;
      }

      delete pending[missingColumn];
    }
  }

  return getCollectedDataById(id);
}

// ============================================================
// 1. Run Collection → returns CollectorResult
// ============================================================

/**
 * Run just the collection phase (without internal verification).
 * The collectors do their own dedup on insert, but we skip the
 * Phase 4 verification inside runAllCollectors to avoid double-processing.
 */
export async function runPipelineCollection(): Promise<{
  totalFetched: number;
  totalInserted: number;
  sourceWise: Record<string, SourceResult>;
}> {
  console.log("[pipeline] Phase 1/6: Running collectors...");
  const result = await runAllCollectors();

  const sourceWise: Record<string, SourceResult> = {};

  // Map RSS results
  for (const [name, r] of Object.entries(result.rss)) {
    sourceWise[name] = {
      fetched: r.fetched ?? 0,
      inserted: r.inserted ?? 0,
      cleaned: 0,
      verified: 0,
      duplicates: 0,
      failed: r.failed ?? 0,
    };
  }

  // Map scraping results
  for (const [name, r] of Object.entries(result.scraping)) {
    sourceWise[name] = {
      fetched: r.fetched ?? 0,
      inserted: r.inserted ?? 0,
      cleaned: 0,
      verified: 0,
      duplicates: 0,
      failed: r.failed ?? 0,
    };
  }

  console.log(`[pipeline] Collection complete: ${result.totalFetched} fetched, ${result.totalInserted} inserted`);

  return {
    totalFetched: result.totalFetched,
    totalInserted: result.totalInserted,
    sourceWise,
  };
}

// ============================================================
// 2. Clean Data — cleans all pending items
// ============================================================

export async function runPipelineClean(): Promise<{
  cleaned: number;
  failed: number;
  itemIds: string[];
}> {
  console.log("[pipeline] Phase 2/6: Cleaning collected data...");

  // Fetch items that are still in "collected" state (not yet cleaned)
  const batchLimit = env.AI_BATCH_LIMIT * 10; // Allow larger batch for cleaning
  const { items } = await listCollectedData(1, batchLimit);
  // Filter to items that haven't been cleaned yet
  const pendingItems = items.filter(
    (it) => !it.pipeline_status || it.pipeline_status === "collected" || it.pipeline_status === "pending"
  ).slice(0, batchLimit);
  let cleaned = 0;
  let failed = 0;
  const itemIds: string[] = [];

  for (const item of pendingItems) {
    try {
      const cleanedTitle = cleanText(item.raw_title ?? "");
      const cleanedContent = cleanText(item.raw_content ?? "");
      const cleanedUrl = normalizeUrl(item.raw_url ?? "");
      const cleanedDeadline = item.deadline ? normalizeDeadline(item.deadline) : null;

      const updates: Record<string, unknown> = {
        title: cleanedTitle || null,
        description: cleanedContent || null,
        raw_url: cleanedUrl || item.raw_url,
        cleaned_at: new Date().toISOString(),
        pipeline_status: "cleaned",
      };

      if (cleanedDeadline) {
        updates.deadline = cleanedDeadline;
      }

      // Normalize category
      if (item.category && typeof item.category === "string") {
        updates.category = cleanText(item.category);
      }

      // Normalize state
      if (item.state && typeof item.state === "string") {
        updates.state = cleanText(item.state);
      }

      // Generate normalized title and content hash for later dedup
      const normalizedTitle = normalizeTitle(item.raw_title ?? "");
      const contentHash = generateContentHash(item.raw_title ?? "", item.raw_content ?? "");
      if (normalizedTitle) updates.normalized_title = normalizedTitle;
      if (contentHash) updates.content_hash = contentHash;

      await updateWithFallback(item.id, updates);
      cleaned++;
      itemIds.push(item.id);
    } catch (err) {
      console.error(`[pipeline] Clean failed for item ${item.id}:`, err);
      await updateWithFallback(item.id, {
        pipeline_status: "failed",
        pipeline_error: `Clean failed: ${err instanceof Error ? err.message : String(err)}`,
      }).catch(() => {});
      failed++;
    }
  }

  console.log(`[pipeline] Cleaning complete: ${cleaned} cleaned, ${failed} failed`);
  return { cleaned, failed, itemIds };
}

// ============================================================
// Detect content_action for job/exam items
// ============================================================

/**
 * Classify content_action based on job/exam content.
 * notification | apply | admit_card | result | answer_key
 */
function detectContentAction(
  rawTitle: string,
  rawContent: string,
  itemType: string,
): string {
  if (itemType !== "job" && itemType !== "exam") {
    return "notification";
  }

  const text = `${rawTitle} ${rawContent}`.toLowerCase();

  // Order matters: more specific matches first
  if (/admit\s*card|hall\s*ticket|call\s*letter|examination\s*ticket/i.test(text)) {
    return "admit_card";
  }
  if (/(?:declared|announced|released)\s+(?:result|outcome|merit|score)|result\s*(?:declared|out|announced)/i.test(text)) {
    return "result";
  }
  if (/answer\s*key|solution|key\s*answer|response\s*sheet/i.test(text)) {
    return "answer_key";
  }
  if (/apply|recruitment|application|vacancy|hiring|online\s*form|registration/i.test(text) && !/result|admit|key/i.test(text)) {
    return "apply";
  }

  return "notification";
}

// ============================================================
// 3. Verify/Classify Data — run AI + verification + dedup
// ============================================================

export async function runPipelineVerify(): Promise<{
  verified: number;
  fakeRemoved: number;
  duplicateRemoved: number;
  suspicious: number;
  pendingVerification: number;
  failed: number;
}> {
  console.log("[pipeline] Phase 3/6: Verifying, deduplicating & classifying...");

  // Fetch items that have been cleaned but not yet verified
  const batchLimit = env.AI_BATCH_LIMIT * 10;
  const { items } = await listCollectedData(1, batchLimit);
  const pendingItems = items.filter(
    (it) => it.pipeline_status === "cleaned" || it.pipeline_status === "collected"
  ).slice(0, batchLimit);
  const contentHashes = await findExistingContentHashes();
  const existingTitles = await findExistingNormalizedTitles();
  const existingUrls = (await supabase.from("collected_data").select("raw_url").not("raw_url", "is", null))
    .data?.map((r: { raw_url: string }) => r.raw_url) ?? [];

  let verified = 0;
  let fakeRemoved = 0;
  let duplicateRemoved = 0;
  let suspicious = 0;
  let pendingVerification = 0;
  let failed = 0;

  for (const item of pendingItems) {
    try {
      // Step A: Run verification engine
      const verificationResult = await verifyCollectedData(item as unknown as Record<string, unknown>);

      // Step B: Check for duplicates
      const dupResult = await checkForDuplicates(
        item.raw_url ?? "",
        item.raw_title ?? "",
        item.raw_content ?? "",
        {
          existingUrls,
          existingContentHashes: contentHashes,
          existingNormalizedTitles: existingTitles.map((t) => ({
            id: t.id,
            normalizedTitle: t.normalized_title,
          })),
        },
      );

      // Step C: Classify the item
      const classification = classifyText(`${item.raw_title ?? ""} ${item.raw_content ?? ""}`);

      // Step C.2: Detect content_action for jobs/exams
      const contentAction = detectContentAction(
        item.raw_title ?? "",
        item.raw_content ?? "",
        classification,
      );

      // Step D: Determine AI verification status
      const trustScore = verificationResult.verification_score;
      let aiVerificationStatus: string;
      let aiReason: string;
      let pipelineStatus: string;

      if (dupResult.isDuplicate) {
        aiVerificationStatus = "duplicate";
        aiReason = dupResult.reason ?? "Duplicate detected";
        pipelineStatus = "duplicate";
        duplicateRemoved++;
      } else if (verificationResult.verification_status === "rejected") {
        // Low-quality content → mark as fake
        aiVerificationStatus = "fake";
        aiReason = verificationResult.verification_notes ?? "Low quality content";
        pipelineStatus = "rejected";
        fakeRemoved++;
      } else if (trustScore >= 70) {
        aiVerificationStatus = "trusted";
        aiReason = "Passed all verification checks";
        pipelineStatus = "verified";
        pendingVerification++;
      } else if (trustScore >= 40) {
        aiVerificationStatus = "suspicious";
        aiReason = verificationResult.verification_notes ?? "Medium quality — requires manual review";
        pipelineStatus = "pending";
        suspicious++;
      } else {
        aiVerificationStatus = "suspicious";
        aiReason = verificationResult.verification_notes ?? "Low confidence — requires manual review";
        pipelineStatus = "pending";
        suspicious++;
      }

      // Step E: Build updates
      const updates: Record<string, unknown> = {
        verification_status: pipelineStatus === "verified" ? "verified_ready" : pipelineStatus,
        verification_score: trustScore,
        verification_notes: verificationResult.verification_notes,
        normalized_title: verificationResult.normalized_title ?? item.raw_title?.toLowerCase().trim() ?? null,
        content_hash: verificationResult.content_hash,
        last_verified_at: new Date().toISOString(),
        item_type: classification !== "unknown" ? classification : item.item_type ?? "scheme",
        content_action: contentAction,
        pipeline_status: pipelineStatus,
        trust_score: trustScore,
        ai_verification_status: aiVerificationStatus,
        ai_confidence_score: trustScore,
        ai_reason: aiReason,
        ai_verified_at: new Date().toISOString(),
      };

      if (dupResult.isDuplicate) {
        updates.duplicate_reason = dupResult.reason ?? "Duplicate detected";
        updates.duplicate_of = dupResult.matchedById ?? null;
        updates.duplicate_count = 1;
      }

      // Step F: Save to database
      await updateWithFallback(item.id, updates);

      // Step G: Log to ai_processing_logs
      const source = item.source_id ? (await supabase.from("sources").select("source_name").eq("id", item.source_id).maybeSingle()).data?.source_name ?? "unknown" : "unknown";

      await insertAiProcessingLog({
        collected_data_id: item.id,
        processing_type: "pipeline",
        status: aiVerificationStatus === "fake" || pipelineStatus === "duplicate" ? "skipped" : "success",
        reason: aiReason,
        confidence_score: trustScore,
        source_name: source,
        items_processed: 1,
        items_failed: 0,
        items_duplicate: dupResult.isDuplicate ? 1 : 0,
      }).catch((err) => {
        console.error(`[pipeline] Failed to log processing for item ${item.id}:`, err);
      });

      verified++;
    } catch (err) {
      console.error(`[pipeline] Verify/classify failed for item ${item.id}:`, err);
      await updateWithFallback(item.id, {
        pipeline_status: "failed",
        pipeline_error: `Verify failed: ${err instanceof Error ? err.message : String(err)}`,
      }).catch(() => {});
      failed++;
    }
  }

  console.log(`[pipeline] Verification complete: ${verified} processed, ${fakeRemoved} fake, ${duplicateRemoved} duplicate, ${suspicious} suspicious, ${pendingVerification} ready, ${failed} failed`);

  return {
    verified,
    fakeRemoved,
    duplicateRemoved,
    suspicious,
    pendingVerification,
    failed,
  };
}

// ============================================================
// Full Pipeline Run
// ============================================================

export async function runFullPipeline(): Promise<PipelineRunResult> {
  const start = Date.now();
  console.log("[pipeline] ====== Starting full pipeline ======");

  // Phase 1: Collect
  const collection = await runPipelineCollection();

  // Phase 2: Clean
  const clean = await runPipelineClean();

  // Phase 3-5: Verify + Dedup + Classify
  const verify = await runPipelineVerify();

  const durationMs = Date.now() - start;

  const result: PipelineRunResult = {
    totalFetched: collection.totalFetched,
    cleaned: clean.cleaned,
    fakeRemoved: verify.fakeRemoved,
    duplicateRemoved: verify.duplicateRemoved,
    suspicious: verify.suspicious,
    pendingVerification: verify.pendingVerification,
    failed: clean.failed + verify.failed,
    sourceWise: collection.sourceWise,
    durationMs,
  };

  console.log("[pipeline] ====== Pipeline complete ======");
  console.log(`[pipeline] Summary: ${result.totalFetched} fetched, ${result.cleaned} cleaned, ${result.fakeRemoved} fake removed, ${result.duplicateRemoved} duplicate removed, ${result.suspicious} suspicious, ${result.pendingVerification} pending verification, ${result.failed} failed, ${result.durationMs}ms`);

  return result;
}

// ============================================================
// Process Collected Data — AI pipeline for admin-triggered processing
// ============================================================

export async function processCollectedData(limit = 10): Promise<{
  succeeded: number;
  failed: number;
  total: number;
  details: Array<{ id: string; status: string; reason?: string }>;
}> {
  const { items } = await listCollectedData(1, limit, "pending");
  const details: Array<{ id: string; status: string; reason?: string }> = [];
  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    try {
      // Clean
      const cleanedTitle = cleanText(item.raw_title ?? "");
      const cleanedContent = cleanText(item.raw_content ?? "");

      // Verify
      const verificationResult = await verifyCollectedData(item as unknown as Record<string, unknown>);

      // Dedup
      const contentHashes = await findExistingContentHashes();
      const existingTitles = await findExistingNormalizedTitles();

      const dupResult = await checkForDuplicates(
        item.raw_url ?? "",
        item.raw_title ?? "",
        item.raw_content ?? "",
        {
          existingUrls: [],
          existingContentHashes: contentHashes,
          existingNormalizedTitles: existingTitles.map((t) => ({
            id: t.id,
            normalizedTitle: t.normalized_title,
          })),
        },
      );

      // Classify
      const classification = classifyText(`${cleanedTitle} ${cleanedContent}`);

      // Detect content_action for jobs/exams
      const contentAction = detectContentAction(
        item.raw_title ?? "",
        item.raw_content ?? "",
        classification !== "unknown" ? classification : item.item_type ?? "scheme",
      );

      const updates: Record<string, unknown> = {
        title: cleanedTitle || null,
        description: cleanedContent || null,
        verification_status: verificationResult.verification_status,
        verification_score: verificationResult.verification_score,
        verification_notes: verificationResult.verification_notes,
        normalized_title: verificationResult.normalized_title,
        content_hash: verificationResult.content_hash,
        item_type: classification !== "unknown" ? classification : item.item_type ?? "scheme",
        content_action: contentAction,
        pipeline_status: verificationResult.verification_status === "verified_ready" ? "verified" : "pending",
        trust_score: verificationResult.verification_score,
        ai_verification_status: verificationResult.verification_score >= 70 ? "trusted" : verificationResult.verification_score >= 40 ? "suspicious" : "fake",
        ai_confidence_score: verificationResult.verification_score,
        ai_reason: verificationResult.verification_notes,
        ai_verified_at: new Date().toISOString(),
      };

      if (dupResult.isDuplicate) {
        updates.verification_status = "duplicate";
        updates.duplicate_reason = dupResult.reason ?? "Duplicate detected";
        updates.duplicate_of = dupResult.matchedById ?? null;
        updates.duplicate_count = 1;
      }

      await updateWithFallback(item.id, updates);
      succeeded++;
      details.push({
        id: item.id,
        status: String(updates.verification_status),
        reason: updates.duplicate_reason as string | undefined,
      });
    } catch (err) {
      console.error(`[processCollectedData] Failed to process item ${item.id}:`, err);
      failed++;
      details.push({
        id: item.id,
        status: "failed",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { succeeded, failed, total: items.length, details };
}
