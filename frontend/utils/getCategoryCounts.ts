/**
 * Normalize a sub_category / content_action value to canonical form.
 *
 * Handles:
 *   "apply", "Apply", "apply_now", "Apply Now"        → "apply_now"
 *   "admit_card", "Admit Card", "admit"                → "admit_card"
 *   "result", "Result"                                 → "result"
 *   "answer_key", "Answer Key", "answer key"           → "answer_key"
 *   "notification", "Notify", "Notifications"          → "notification"
 */
export function normalizeSubType(raw: string | null | undefined): string {
  if (!raw) return "";
  const lower = raw.toLowerCase().trim().replace(/\s+/g, "_");
  // Map all variants to canonical tab keys
  if (lower === "apply" || lower === "apply_now") return "apply_now";
  if (lower === "admit" || lower === "admit_card") return "admit_card";
  if (lower === "result") return "result";
  if (lower === "answer_key" || lower === "answer key" || lower === "answerkey") return "answer_key";
  if (lower === "notification" || lower === "notifications" || lower === "notify") return "notification";
  return lower;
}

/**
 * Compute tab counts from the full (unfiltered) items dataset.
 * Uses normalized sub_category values so counts are correct regardless
 * of how the value is stored in the database ("apply", "Apply", "apply_now" etc.).
 *
 * Usage:
 *   const counts = getCategoryCounts(allItems, ["all", "apply_now", "admit_card", ...])
 *   // => { all: 42, apply_now: 5, admit_card: 8, ... }
 */
export function getCategoryCounts(
  items: Array<{ sub_category?: string | null }>,
  tabKeys: string[],
): Record<string, number> {
  const counts: Record<string, number> = { all: items.length };
  for (const key of tabKeys) {
    if (key === "all") continue;
    counts[key] = items.filter((item) => normalizeSubType(item.sub_category) === key).length;
  }
  return counts;
}
