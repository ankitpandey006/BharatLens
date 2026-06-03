
import axios from "axios";
import * as cheerio from "cheerio";
import { AppError } from "../../utils/app-error";
import { cleanText } from "../../ai/data-cleaner.service";
import {
  bulkInsertCollectedData,
  findCollectedUrls,
  findSourceByName,
  updateSourceLastCheckedAt,
} from "../../repositories/collected-data.repository";
import type { ScraperResult, CollectedDataInsert } from "../../types/collector.types";
import { collectorConfig } from "../../config/collector.config";

function normalizeAbsoluteUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    const cleaned = rawUrl.trim();
    if (!cleaned || cleaned.startsWith("javascript:") || cleaned.startsWith("mailto:")) {
      return null;
    }
    return new URL(cleaned, baseUrl).href;
  } catch {
    return null;
  }
}

function isUsefulGovItem(title: string, url: string): boolean {
  const normalized = `${title} ${url}`.toLowerCase();
  const blockedPatterns = [
    "follow us",
    "subscribe",
    "screen reader",
    "skip to",
    "contact us",
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "youtube",
    "whatsapp",
    "faq",
    "privacy",
    "terms",
    "sitemap",
    "toggle search",
  ];
  const allowedPatterns = [
    "notice",
    "notification",
    "circular",
    "recruitment",
    "vacancy",
    "result",
    "exam",
    "admit card",
    "answer key",
    "admission",
    "scholarship",
    "tender",
    "public notice",
    "guidelines",
    "announcement",
  ];

  if (blockedPatterns.some((pattern) => normalized.includes(pattern))) {
    return false;
  }

  return allowedPatterns.some((pattern) => normalized.includes(pattern));
}

function createSkippedResult(sourceName: string, reason: string): ScraperResult {
  return {
    source: sourceName,
    fetched: 0,
    inserted: 0,
    duplicates: 0,
    failed: 0,
    skipped: true,
    reason,
  };
}

export async function scrapeWebsiteSource(sourceName: string): Promise<ScraperResult> {
  const source = await findSourceByName(sourceName);

  if (!source) {
    throw new AppError(`${sourceName} source not found in sources table`, 404);
  }

  if (!source.is_verified) {
    throw new AppError(`${sourceName} source is not verified for scraping`, 403);
  }

  const targetUrl = source.source_url;

  if (!targetUrl) {
    throw new AppError(`No source URL configured for ${sourceName}`, 400);
  }

  let html: string;

  try {
    const response = await axios.get<string>(targetUrl, {
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });
    html = response.data;
  } catch (error) {
    const reason =
      axios.isAxiosError(error) && error.code
        ? `${sourceName} website timeout/unavailable: ${error.code}`
        : error instanceof Error
        ? `${sourceName} website unavailable: ${error.message}`
        : `${sourceName} website unavailable: unknown error`;

    return createSkippedResult(source.source_name, reason);
  }

  const $ = cheerio.load(html);
  const seenUrls = new Set<string>();
  const validRecords: CollectedDataInsert[] = [];
  let duplicates = 0;
  let failed = 0;

  $("a[href]")
    .toArray()
    .forEach((anchor) => {
      if (validRecords.length >= collectorConfig.scraperMaxItems) {
        return;
      }

      const link = $(anchor).attr("href") ?? "";
      const rawUrl = normalizeAbsoluteUrl(link, targetUrl);

      if (!rawUrl) {
        return;
      }

      const title = cleanText($(anchor).text());
      if (!title || title.length < 8) {
        return;
      }

      if (!isUsefulGovItem(title, rawUrl)) {
        return;
      }

      if (seenUrls.has(rawUrl)) {
        duplicates += 1;
        return;
      }

      seenUrls.add(rawUrl);

      const rawContent = cleanText($(anchor).closest("article").text() || $(anchor).parent().text() || title);

      validRecords.push({
        source_id: source.id,
        raw_title: title,
        raw_content: rawContent || title,
        raw_url: rawUrl,
        collection_method: "scraping",
        processing_status: "collected",
        collected_at: new Date().toISOString(),
      });
    });

  if (validRecords.length === 0) {
    return createSkippedResult(source.source_name, "No useful scraper items found");
  }

  const candidateUrls = validRecords.map((record) => record.raw_url);
  const existingUrls = await findCollectedUrls(candidateUrls);

  const recordsToInsert = validRecords.filter((record) => {
    if (existingUrls.includes(record.raw_url)) {
      duplicates += 1;
      return false;
    }

    return true;
  });

  await bulkInsertCollectedData(recordsToInsert);
  await updateSourceLastCheckedAt(source.id);

  return {
    source: source.source_name,
    fetched: seenUrls.size,
    inserted: recordsToInsert.length,
    duplicates,
    failed,
  };
}
