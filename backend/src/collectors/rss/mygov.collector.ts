
import { collectRssFeed } from "./base-rss.collector";
import { collectorConfig } from "../../config/collector.config";
import type { CollectorResult } from "../../types/collector.types";

export async function collectMyGovRss(): Promise<CollectorResult> {
  const sourceConfig = collectorConfig.rssSources.find((source) => source.sourceName === "MyGov");

  if (!sourceConfig) {
    throw new Error("MyGov RSS configuration is missing");
  }

  return collectRssFeed(sourceConfig.sourceName, sourceConfig.defaultUrl);
}

export async function collectIndiaGovRss(): Promise<CollectorResult> {
  const sourceConfig = collectorConfig.rssSources.find((source) => source.sourceName === "India.gov");

  if (!sourceConfig) {
    throw new Error("India.gov RSS configuration is missing");
  }

  return collectRssFeed(sourceConfig.sourceName, sourceConfig.defaultUrl);
}
