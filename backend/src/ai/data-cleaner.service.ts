
import { collectorConfig } from "../config/collector.config";

const htmlTagRegex = /<[^>]*>/g;

export function cleanText(value: string): string {
  if (typeof value !== "string") {
    return "";
  }

  const withoutHtml = value.replace(htmlTagRegex, " ");
  const normalized = withoutHtml.replace(/\s+/g, " ").trim();
  return normalized.slice(0, collectorConfig.pdfMaxContentLength);
}

export function normalizeTitle(value: string): string {
  return cleanText(value).slice(0, 256);
}
