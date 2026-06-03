
import { AppError } from "../utils/app-error";
import { collectorConfig } from "../config/collector.config";
import { collectPibRss } from "../collectors/rss/pib.collector";
import { collectEmploymentRss } from "../collectors/rss/employment.collector";
import { collectMyGovRss, collectIndiaGovRss } from "../collectors/rss/mygov.collector";
import { collectRssFeed } from "../collectors/rss/base-rss.collector";
import { scrapeWebsiteSource } from "../collectors/scraping/website-scraper.service";
import { extractPdfDocument } from "../collectors/pdf/pdf-extractor.service";
import { collectDataGov } from "../collectors/apis/data-gov.collector";
import { cleanText } from "../ai/data-cleaner.service";
import { classifyText } from "../ai/classifier.service";
import {
  countCollectedData,
  countCollectedDataByMethod,
  getCollectorStatuses,
  listCollectedData,
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
  const results: Record<string, CollectorResult> = {};
  const rssSources = collectorConfig.rssSources;

  for (const source of rssSources) {
    try {
      if (source.sourceName === "PIB") {
        results[source.sourceName] = await collectPibRss();
      } else if (source.sourceName === "Employment News") {
        results[source.sourceName] = await collectEmploymentRss();
      } else if (source.sourceName === "MyGov") {
        results[source.sourceName] = await collectMyGovRss();
      } else if (source.sourceName === "India.gov") {
        results[source.sourceName] = await collectIndiaGovRss();
      } else {
        results[source.sourceName] = await collectEmploymentRss();
      }
    } catch (error) {
      results[source.sourceName] = {
        source: source.sourceName,
        fetched: 0,
        inserted: 0,
        duplicates: 0,
        failed: 1,
      };
    }
  }

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
  const rssResults = await runAllRssCollectors();
  const scrapingResults: Record<string, ScraperResult> = {};

  for (const sourceName of collectorConfig.scraperSources) {
    try {
      scrapingResults[sourceName] = await runWebsiteScraper(sourceName);
    } catch {
      scrapingResults[sourceName] = {
        source: sourceName,
        fetched: 0,
        inserted: 0,
        duplicates: 0,
        failed: 1,
      };
    }
  }

  const pdfSummary = {
    skipped: true,
    reason: "PDF extraction requires a PDF URL and source name",
  };

  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;
  let totalFailed = 0;

  Object.values(rssResults).forEach((result) => {
    totalFetched += result.fetched;
    totalInserted += result.inserted;
    totalDuplicates += result.duplicates;
    totalFailed += result.failed;
  });

  Object.values(scrapingResults).forEach((result) => {
    totalFetched += result.fetched;
    totalInserted += result.inserted;
    totalDuplicates += result.duplicates;
    totalFailed += result.failed;
  });

  return {
    rss: rssResults,
    scraping: scrapingResults,
    pdf: pdfSummary,
    totalFetched,
    totalInserted,
    totalDuplicates,
    totalFailed,
  };
}
