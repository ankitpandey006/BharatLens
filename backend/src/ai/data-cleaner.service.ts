/**
 * Data Cleaning Service
 * Handles: HTML removal, text normalization, URL validation, date/deadline normalization,
 * whitespace clean up, and content quality checks.
 */

import { collectorConfig } from "../config/collector.config";

// ============================================================
// HTML & Text Cleaning
// ============================================================

const htmlTagRegex = /<[^>]*>/g;
const extraWhitespaceRegex = /\s+/g;
const duplicateSymbolsRegex = /([!@#$%^&*(),.?":{}|<>])\1{2,}/g;
const brokenUnicodeRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

/**
 * Clean text: remove HTML, normalize whitespace, trim, and truncate.
 */
export function cleanText(value: string): string {
  if (typeof value !== "string") {
    return "";
  }

  let cleaned = value
    .replace(htmlTagRegex, " ")           // Remove HTML tags
    .replace(extraWhitespaceRegex, " ")   // Normalize whitespace
    .replace(duplicateSymbolsRegex, "$1") // Remove repeated punctuation
    .replace(brokenUnicodeRegex, "")      // Remove broken unicode chars
    .trim();

  // Remove common non-content boilerplate
  cleaned = cleaned.replace(/^(read more|click here|learn more|view all|download|click to)\b/i, "").trim();

  return cleaned.slice(0, collectorConfig.pdfMaxContentLength);
}

/**
 * Normalize title: clean text + lowercase + truncate.
 */
export function normalizeTitle(value: string): string {
  return cleanText(value).toLowerCase().slice(0, 256);
}

// ============================================================
// URL Validation & Normalization
// ============================================================

/**
 * Check if a string is a valid http/https URL.
 */
export function isValidUrl(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Normalize a URL: trim, ensure protocol, validate.
 * Returns the normalized URL or null if invalid.
 */
export function normalizeUrl(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;

  let url = value.trim();

  // Remove HTML entities
  url = url.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'");

  // Add protocol if missing
  if (url.startsWith("//")) {
    url = "https:" + url;
  } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // Validate
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Check if a URL belongs to a known official/government domain.
 */
const OFFICIAL_DOMAINS = [
  "gov.in",
  "nic.in",
  "india.gov.in",
  "pib.gov.in",
  "mygov.in",
  "employmentnews.gov.in",
  "data.gov.in",
  "ssc.nic.in",
  "upsc.gov.in",
  "nta.ac.in",
  "ugc.ac.in",
  "aicte-india.org",
  "rrb.gov.in",
  "cbse.gov.in",
  "ncert.nic.in",
  "niti.gov.in",
  "dget.gov.in",
  "msde.gov.in",
  "education.gov.in",
  "ugc.ac.in",
];

export function isOfficialDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return OFFICIAL_DOMAINS.some((domain) => hostname === domain || hostname.endsWith("." + domain));
  } catch {
    return false;
  }
}

// ============================================================
// Date/Deadline Normalization
// ============================================================

/**
 * Parse and normalize a deadline/date string into ISO 8601 format (YYYY-MM-DD).
 * Returns null if the date cannot be parsed.
 */
export function normalizeDeadline(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;

  const cleaned = value.trim();

  // Try ISO format first
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = cleaned.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  // Try "Month DD, YYYY" or "DD Month YYYY"
  const textDateMatch = cleaned.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)\s+(\d{4})|([a-zA-Z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/);
  if (textDateMatch) {
    const parts = textDateMatch.slice(1).filter(Boolean);
    if (parts.length === 3) {
      const date = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
  }

  // Try generic Date parse
  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return null;
}
