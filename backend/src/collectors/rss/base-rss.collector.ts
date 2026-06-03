
import axios from "axios";
import Parser from "rss-parser";
import { collectorConfig } from "../../config/collector.config";
import { AppError } from "../../utils/app-error";
import { cleanText } from "../../ai/data-cleaner.service";
import {
  bulkInsertCollectedData,
  findCollectedUrls,
  findSourceByName,
  updateSourceLastCheckedAt,
} from "../../repositories/collected-data.repository";
import type { CollectorResult, CollectedDataInsert } from "../../types/collector.types";

const parser = new Parser();

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
}

function resolveRawContent(item: Parser.Item): string {
  if (typeof item.content === "string" && item.content.trim()) {
    return item.content;
  }

  if (typeof item.contentSnippet === "string" && item.contentSnippet.trim()) {
    return item.contentSnippet;
  }

  if (typeof item.summary === "string" && item.summary.trim()) {
    return item.summary;
  }

  return "";
}

function createSkippedResult(sourceName: string, reason: string): CollectorResult {
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

export async function collectRssFeed(sourceName: string, fallbackUrl?: string): Promise<CollectorResult> {
  const source = await findSourceByName(sourceName);

  if (!source) {
    throw new AppError(`${sourceName} source not found in sources table`, 404);
  }

  const rssUrl = safeUrl(fallbackUrl) ?? safeUrl(source.source_url);

  if (!rssUrl) {
    throw new AppError(`No RSS URL configured for ${sourceName}`, 400);
  }

  let feed: Parser.Output<Parser.Item>;

  try {
    const response = await axios.get<string>(rssUrl, {
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*;q=0.1",
        "Accept-Language": "en-US,en;q=0.9",
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    feed = await parser.parseString(response.data);
  } catch (error) {
    const reason =
      axios.isAxiosError(error) && error.response
        ? `RSS unavailable: HTTP ${error.response.status}`
        : axios.isAxiosError(error) && error.code
        ? `RSS unavailable: ${error.code}`
        : error instanceof Error
        ? `RSS unavailable: ${error.message}`
        : "RSS unavailable: unknown error";

    return createSkippedResult(source.source_name, reason);
  }

  const items = feed.items ?? [];
  const fetched = items.length;
  const seenUrls = new Set<string>();
  const validRecords: CollectedDataInsert[] = [];
  let duplicates = 0;
  let failed = 0;

  for (const item of items.slice(0, collectorConfig.rssMaxItems)) {
    const rawUrl = safeUrl(item.link ?? item.guid ?? "");

    if (!rawUrl) {
      failed += 1;
      continue;
    }

    if (seenUrls.has(rawUrl)) {
      duplicates += 1;
      continue;
    }

    seenUrls.add(rawUrl);

    const rawTitle = cleanText(safeUrl(item.title) ?? sourceName);
    const rawContent = cleanText(resolveRawContent(item));

    validRecords.push({
      source_id: source.id,
      raw_title: rawTitle,
      raw_content: rawContent,
      raw_url: rawUrl,
      collection_method: "rss",
      processing_status: "collected",
      collected_at: new Date().toISOString(),
    });
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
    fetched,
    inserted: recordsToInsert.length,
    duplicates,
    failed,
  };
}
