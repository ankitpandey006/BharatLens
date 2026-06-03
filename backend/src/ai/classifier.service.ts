
import { cleanText } from "./data-cleaner.service";

export type ClassificationLabel = "scheme" | "scholarship" | "job" | "exam" | "notification" | "unknown";

const keywordMap: Record<ClassificationLabel, string[]> = {
  scheme: ["scheme", "yojana", "yatna", "subsidy"],
  scholarship: ["scholarship", "fellowship", "financial assistance", "grant"],
  job: ["recruitment", "vacancy", "job", "hiring", "career"],
  exam: ["exam", "admit card", "result", "cut off", "answer key"],
  notification: ["notification", "application", "last date", "deadline"],
  unknown: [],
};

export function classifyText(rawText: string): ClassificationLabel {
  const normalized = cleanText(rawText).toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  for (const label of ["scheme", "scholarship", "job", "exam", "notification"] as const) {
    const keywords = keywordMap[label];

    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return label;
    }
  }

  return "unknown";
}
