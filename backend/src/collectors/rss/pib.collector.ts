
import { collectRssFeed } from "./base-rss.collector";
import { collectorConfig } from "../../config/collector.config";
import type { CollectorResult } from "../../types/collector.types";

export async function collectPibRss(): Promise<CollectorResult> {
  return collectRssFeed(collectorConfig.rssSources[0].sourceName, collectorConfig.rssSources[0].defaultUrl);
}
