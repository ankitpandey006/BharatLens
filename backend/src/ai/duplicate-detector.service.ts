
import { cleanText } from "./data-cleaner.service";

export function isExactDuplicate(rawUrl: string, existingUrls: string[]): boolean {
  return existingUrls.includes(rawUrl);
}

function normalizeComparisonText(value: string): string {
  return cleanText(value).toLowerCase();
}

export function areTitlesSimilar(firstTitle: string, secondTitle: string): boolean {
  const normalizedFirst = normalizeComparisonText(firstTitle);
  const normalizedSecond = normalizeComparisonText(secondTitle);

  if (!normalizedFirst || !normalizedSecond) {
    return false;
  }

  return normalizedFirst === normalizedSecond;
}
