
import { collectRssFeed } from "./base-rss.collector";
import { collectorConfig } from "../../config/collector.config";
import type { CollectorResult } from "../../types/collector.types";

export async function collectEmploymentRss(): Promise<CollectorResult> {
  const sourceConfig = collectorConfig.rssSources.find((source) => source.sourceName === "Employment News");

  if (!sourceConfig) {
    throw new Error("Employment News RSS configuration is missing");
  }

  return collectRssFeed(sourceConfig.sourceName, sourceConfig.defaultUrl);
}
