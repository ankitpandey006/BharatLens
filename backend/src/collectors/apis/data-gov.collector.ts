
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import type { CollectorResult } from "../../types/collector.types";
import { collectorConfig } from "../../config/collector.config";

export async function collectDataGov(): Promise<CollectorResult> {
  const apiKey = env.DATA_GOV_API_KEY;

  if (!apiKey) {
    throw new AppError("DATA_GOV_API_KEY is not configured. Data.gov collection cannot run without an API key.", 400);
  }

  // Placeholder implementation until Data.gov API integration is available.
  // Keeps the collector pipeline safe and build-compatible without external API usage.
  return {
    source: "Data.gov",
    fetched: 0,
    inserted: 0,
    duplicates: 0,
    failed: 0,
  };
}
