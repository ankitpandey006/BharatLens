
import { AppError } from "../utils/app-error";
import { collectorConfig } from "../config/collector.config";
import { collectPibRss } from "../collectors/rss/pib.collector";
import { collectEmploymentRss } from "../collectors/rss/employment.collector";
import { collectMyGovRss, collectIndiaGovRss } from "../collectors/rss/mygov.collector";
import { collectRssFeed } from "../collectors/rss/base-rss.collector";
import { scrapeWebsiteSource } from "../collectors/scraping/website-scraper.service";
import { extractPdfDocument } from "../collectors/pdf/pdf-extractor.service";
import { cleanText } from "../ai/data-cleaner.service";
import { classifyText } from "../ai/classifier.service";
import { checkForDuplicates, generateContentHash, normalizeTitle } from "../ai/duplicate-detector.service";
import { verifyCollectedData } from "../services/verification.service";
import { aiClassifyAndExtract } from "../ai/gemini.service";
import { supabase } from "../config/supabase";
import {
  countCollectedData,
  countCollectedDataByMethod,
  getCollectorStatuses,
  listCollectedData,
  findSourceByName,
  updateCollectedDataById,
  findExistingContentHashes,
  findExistingNormalizedTitles,
} from "../repositories/collected-data.repository";
import type {
  CollectedDataRow,
} from "../repositories/collected-data.repository";
import type {
  CollectorResult,
  CollectorStatus,
  RunAllCollectorsResult,
  ScraperResult,
  PdfExtractResult,
} from "../types/collector.types";

// ---------------------------------------------------------------------------
// Timeout wrapper — ensures any single collector task returns within maxWait ms
// ---------------------------------------------------------------------------
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[${label}] Timed out after ${ms}ms`));
    }, ms);
  });
  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timer!);
    return result;
  } catch (error) {
    clearTimeout(timer!);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Timed collector helper — wraps a collector function with logging + timeout
// ---------------------------------------------------------------------------
async function timedCollector(
  label: string,
  type: string,
  fn: () => Promise<CollectorResult>,
): Promise<CollectorResult> {
  const start = Date.now();
  console.log(`[run-all] Starting ${type} collector: ${label}`);
  try {
    const result = await withTimeout(fn(), 15_000, label);
    result.durationMs = Date.now() - start;
    result.type = type;
    result.success = result.failed === 0 && !result.skipped;
    console.log(
      `[run-all] Completed ${type} collector: ${label} (${result.durationMs}ms, fetched=${result.fetched}, inserted=${result.inserted}, skipped=${result.skipped ?? false})`,
    );
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[run-all] Failed ${type} collector: ${label} (${durationMs}ms, error=${errorMsg})`);
    return {
      source: label,
      type,
      success: false,
      fetched: 0,
      inserted: 0,
      duplicates: 0,
      failed: 1,
      skipped: true,
      reason: errorMsg,
      error: errorMsg,
      durationMs,
    };
  }
}

function normalizeRssSourceName(sourceName: string): string | null {
  const normalized = sourceName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normalized === "pib") {
    return "PIB";
  }

  if (normalized === "employmentnews" || normalized === "employment") {
    return "Employment News";
  }

  if (normalized === "mygov") {
    return "MyGov";
  }

  if (normalized === "indiagov" || normalized === "india") {
    return "India.gov";
  }

  return null;
}

export async function runPibRssCollection(): Promise<CollectorResult> {
  return collectPibRss();
}

export async function runEmploymentRssCollection(): Promise<CollectorResult> {
  return collectEmploymentRss();
}

export async function runGenericRssCollection(sourceName: string): Promise<CollectorResult> {
  const normalized = normalizeRssSourceName(sourceName);

  if (!normalized) {
    throw new AppError(`Unsupported RSS source name: ${sourceName}`, 400);
  }

  const sourceConfig = collectorConfig.rssSources.find((item) => item.sourceName === normalized);

  if (!sourceConfig) {
    throw new AppError(`RSS configuration missing for ${normalized}`, 500);
  }

  return collectRssFeed(normalized, sourceConfig.defaultUrl);
}

export async function runAllRssCollectors(): Promise<Record<string, CollectorResult>> {
  console.log("[run-all-rss] Starting all RSS collectors");
  const rssSources = collectorConfig.rssSources;

  // Build collector functions for each RSS source
  const collectorTasks = rssSources.map((source) => {
    let collectorFn: () => Promise<CollectorResult>;
    switch (source.sourceName) {
      case "PIB":
        collectorFn = () => collectPibRss();
        break;
      case "Employment News":
        collectorFn = () => collectEmploymentRss();
        break;
      case "MyGov":
        collectorFn = () => collectMyGovRss();
        break;
      case "India.gov":
        collectorFn = () => collectIndiaGovRss();
        break;
      default:
        collectorFn = () => collectEmploymentRss();
        break;
    }
    return timedCollector(source.sourceName, "rss", collectorFn);
  });

  const settled = await Promise.allSettled(collectorTasks);
  const results: Record<string, CollectorResult> = {};

  for (const settledResult of settled) {
    if (settledResult.status === "fulfilled") {
      results[settledResult.value.source] = settledResult.value;
    }
    // fulfilled cases are already handled by timedCollector, so status === "rejected" should not happen
    // but handle it just in case:
    if (settledResult.status === "rejected") {
      const reason = settledResult.reason instanceof Error ? settledResult.reason.message : String(settledResult.reason);
      console.error(`[run-all-rss] Unexpected rejection: ${reason}`);
    }
  }

  console.log("[run-all-rss] All RSS collectors completed");
  return results;
}

export async function getCollectorStatus(): Promise<CollectorStatus[]> {
  const uniqueSourceNames = Array.from(
    new Set([...collectorConfig.rssSources.map((item) => item.sourceName), ...collectorConfig.scraperSources]),
  );

  return getCollectorStatuses(uniqueSourceNames).then((sources) =>
    sources.map((source) => ({
      source: source.source_name,
      sourceUrl: source.source_url,
      sourceType: source.source_type,
      isVerified: source.is_verified,
      trustScore: source.trust_score,
      lastCheckedAt: source.last_checked_at,
    })),
  );
}

export async function getCollectorStats(): Promise<{ total: number; rssCount: number; scrapingCount: number; pdfCount: number; countsByMethod: Record<string, number>; status: CollectorStatus[] }> {
  const total = await countCollectedData();
  const rssCount = await countCollectedDataByMethod("rss");
  const scrapingCount = await countCollectedDataByMethod("scraping");
  const pdfCount = await countCollectedDataByMethod("pdf");
  const collectorStatus = await getCollectorStatus();

  return {
    total,
    rssCount,
    scrapingCount,
    pdfCount,
    countsByMethod: {
      rss: rssCount,
      scraping: scrapingCount,
      pdf: pdfCount,
    },
    status: collectorStatus,
  };
}

export async function getCollectedData(page: number, limit: number): Promise<{ items: CollectedDataRow[]; total: number }> {
  return listCollectedData(page, limit);
}

export async function cleanCollectorText(text: string): Promise<string> {
  return cleanText(text);
}

export async function classifyCollectorText(text: string): Promise<string> {
  return classifyText(text);
}

export async function processCollectorData(rawTitle: string, rawContent: string): Promise<{ cleanTitle: string; cleanContent: string; classification: string }> {
  const cleanTitle = cleanText(rawTitle ?? "");
  const cleanContent = cleanText(rawContent ?? "");
  const classification = classifyText(`${cleanTitle} ${cleanContent}`);

  return {
    cleanTitle,
    cleanContent,
    classification,
  };
}

export async function runWebsiteScraper(sourceName: string): Promise<ScraperResult> {
  if (!collectorConfig.scraperSources.includes(sourceName)) {
    throw new AppError(`${sourceName} scraping is not supported`, 400);
  }

  return scrapeWebsiteSource(sourceName);
}

export async function runPdfExtractor(pdfUrl: string, sourceName: string): Promise<PdfExtractResult> {
  return extractPdfDocument(pdfUrl, sourceName);
}

export async function runAllCollectors(): Promise<RunAllCollectorsResult> {
  const overallStart = Date.now();
  console.log("[run-all] ====== Starting ALL collectors ======");

  // ---- Phase 1: RSS collectors (parallel, each with 15s timeout) ----
  console.log("[run-all] Phase 1/3: Starting RSS collectors");
  const rssStart = Date.now();
  const rssResults = await runAllRssCollectors();
  console.log(`[run-all] Phase 1/3: RSS collectors completed in ${Date.now() - rssStart}ms`);

  // ---- Phase 2: Scraper collectors (parallel, each with 15s timeout) ----
  console.log("[run-all] Phase 2/3: Starting scraper collectors");
  const scraperStart = Date.now();

  const scraperTasks = collectorConfig.scraperSources.map((sourceName) =>
    timedCollector(sourceName, "scraping", async () => {
      // Gracefully skip sources not found in DB instead of throwing
      const source = await findSourceByName(sourceName);
      if (!source) {
        console.log(`[run-all] Scraper source "${sourceName}" not found in DB — skipping`);
        return {
          source: sourceName,
          type: "scraping",
          success: false,
          fetched: 0,
          inserted: 0,
          duplicates: 0,
          failed: 0,
          skipped: true,
          reason: `Source "${sourceName}" not found in DB`,
        };
      }
      return scrapeWebsiteSource(sourceName);
    }),
  );

  const scraperSettled = await Promise.allSettled(scraperTasks);
  const scrapingResults: Record<string, ScraperResult> = {};

  for (const settledResult of scraperSettled) {
    if (settledResult.status === "fulfilled") {
      scrapingResults[settledResult.value.source] = settledResult.value as ScraperResult;
    }
  }

  console.log(`[run-all] Phase 2/3: Scraper collectors completed in ${Date.now() - scraperStart}ms`);

  // ---- Phase 3: PDF collector — always skipped for run-all ----
  console.log("[run-all] Phase 3/3: Skipping PDF collector (requires explicit URL/source)");
  const pdfResult: CollectorResult = {
    source: "pdf-extractor",
    type: "pdf",
    success: false,
    fetched: 0,
    inserted: 0,
    duplicates: 0,
    failed: 0,
    skipped: true,
    reason: "PDF extraction requires a PDF URL and source name — not applicable for run-all",
  };

  // ---- Calculate totals ----
  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  Object.values(rssResults).forEach((result) => {
    totalFetched += result.fetched;
    totalInserted += result.inserted;
    totalDuplicates += result.duplicates;
    totalFailed += result.failed;
    if (result.skipped) totalSkipped += 1;
  });
  Object.values(scrapingResults).forEach((result) => {
    totalFetched += result.fetched;
    totalInserted += result.inserted;
    totalDuplicates += result.duplicates;
    totalFailed += result.failed;
    if (result.skipped) totalSkipped += 1;
  });
  if (pdfResult.skipped) totalSkipped += 1;

  // ---- Update source tracking for all sources ----
  await updateSourceTracking(rssResults, scrapingResults);

  // ---- Phase 4: Run verification on newly inserted items ----
  console.log("[run-all] Phase 4/4: Running verification on collected items");
  const verifyStart = Date.now();
  let verified = 0;
  let verifiedReady = 0;
  let pendingCount = 0;
  let rejectedCount = 0;

  if (totalInserted > 0) {
    try {
      // Fetch the latest inserted records to verify
      const { items: latestItems } = await listCollectedData(1, totalInserted);
      const contentHashes = await findExistingContentHashes();
      const existingTitles = await findExistingNormalizedTitles();

      for (const item of latestItems.slice(0, totalInserted)) {
        try {
          const verificationResult = await verifyCollectedData(item as unknown as Record<string, unknown>);
          const updates: Record<string, unknown> = {
            verification_status: verificationResult.verification_status,
            verification_score: verificationResult.verification_score,
            verification_notes: verificationResult.verification_notes,
            normalized_title: verificationResult.normalized_title ?? item.raw_title?.toLowerCase().trim() ?? null,
            content_hash: verificationResult.content_hash,
            last_verified_at: new Date().toISOString(),
          };

          // Run AI classification (with Gemini fallback to rule-based)
          try {
            const aiResult = await aiClassifyAndExtract(
              item.raw_title ?? "",
              item.raw_content ?? "",
            );
            updates.item_type = aiResult.classification;
            updates.ai_confidence = aiResult.confidence;
            if (aiResult.extracted.title) {
              updates.title = aiResult.extracted.title;
            }
            if (aiResult.extracted.summary) {
              updates.description = aiResult.extracted.summary;
            }
            if (aiResult.extracted.eligibility) {
              updates.eligibility = aiResult.extracted.eligibility;
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
            if (aiResult.extracted.education_level) {
              updates.education_level = aiResult.extracted.education_level;
            }
            if (aiResult.extracted.age_limit) {
              updates.age_limit = aiResult.extracted.age_limit;
            }
            if (aiResult.extracted.income_limit) {
              updates.income_limit = aiResult.extracted.income_limit;
            }
            if (aiResult.extracted.documents_required) {
              updates.documents_required = aiResult.extracted.documents_required;
            }
            if (aiResult.extracted.keywords.length > 0) {
              updates.metadata = {
                ...(typeof item.metadata === "object" && item.metadata ? item.metadata : {}),
                keywords: aiResult.extracted.keywords,
              };
            }
          } catch (aiError) {
            console.warn(`[run-all] AI classification failed for item ${item.id}:`, aiError);
          }

          // Check for duplicates using enhanced detection
          const dupResult = await checkForDuplicates(
            item.raw_url ?? "",
            item.raw_title ?? "",
            item.raw_content ?? "",
            {
              existingUrls: [],
              existingContentHashes: contentHashes,
              // Map snake_case from DB to camelCase expected by duplicate detector
              existingNormalizedTitles: existingTitles.map((t) => ({
                id: t.id,
                normalizedTitle: t.normalized_title,
              })),
            },
          );

          if (dupResult.isDuplicate) {
            updates.verification_status = "duplicate";
            updates.duplicate_reason = dupResult.reason ?? "Duplicate detected";
            if (dupResult.matchedById) {
              updates.duplicate_of_id = dupResult.matchedById;
            }
          }

          updates.processed_at = new Date().toISOString();
          await updateCollectedDataById(item.id, updates);
          verified++;
          if (updates.verification_status === "verified_ready") verifiedReady++;
          else if (updates.verification_status === "pending") pendingCount++;
          else if (updates.verification_status === "rejected" || updates.verification_status === "duplicate") rejectedCount++;
        } catch (itemError) {
          console.error(`[run-all] Failed to verify item ${item.id}:`, itemError);
        }
      }
    } catch (batchError) {
      console.error("[run-all] Failed to run batch verification:", batchError);
    }
  }

  console.log(
    `[run-all] Phase 4/4: Verification completed in ${Date.now() - verifyStart}ms (${verified} verified, ${verifiedReady} ready, ${pendingCount} pending, ${rejectedCount} rejected/duplicate)`,
  );

  const totalDurationMs = Date.now() - overallStart;

  console.log("[run-all] ====== ALL collectors completed ======");
  console.log(
    `[run-all] Summary: ${totalDurationMs}ms total, ${totalFetched} fetched, ${totalInserted} inserted, ${totalDuplicates} duplicates, ${totalFailed} failed, ${totalSkipped} skipped, ${verified} verified`,
  );

  return {
    rss: rssResults,
    scraping: scrapingResults,
    pdf: pdfResult,
    totalFetched,
    totalInserted,
    totalDuplicates,
    totalFailed,
    totalSkipped,
    totalDurationMs,
  };
}

// ---------------------------------------------------------------------------
// Source Tracking — updates last_run_at, last_success_at, last_error on sources
// ---------------------------------------------------------------------------

async function updateSourceTracking(
  rssResults: Record<string, CollectorResult>,
  scraperResults: Record<string, ScraperResult>,
): Promise<void> {
  const now = new Date().toISOString();
  const allResults = new Map<string, CollectorResult>();

  for (const [name, result] of Object.entries(rssResults)) {
    allResults.set(name, result);
  }
  for (const [name, result] of Object.entries(scraperResults)) {
    allResults.set(name, result);
  }

  for (const [sourceName, result] of allResults) {
    try {
      const updates: Record<string, unknown> = {
        last_run_at: now,
      };

      const success = result.success ?? (result.failed === 0 && !result.skipped);

      if (success) {
        updates.last_success_at = now;
        updates.last_error = null;
      } else if (result.error || result.reason) {
        updates.last_error = (result.error || result.reason || "Unknown error").slice(0, 500);
      }

      const { error } = await supabase
        .from("sources")
        .update(updates)
        .eq("source_name", sourceName);

      if (error) {
        console.error(`[source-tracking] Failed to update source "${sourceName}":`, error.message);
      }
    } catch (trackError) {
      console.error(`[source-tracking] Error updating source "${sourceName}":`, trackError);
    }
  }
}
