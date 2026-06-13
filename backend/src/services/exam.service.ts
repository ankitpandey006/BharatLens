import { getAllExams, getExamById, type ExamItem } from "../repositories/exam.repository";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult } from "../types/query.types";
import { buildUpdateBadgesMap, buildUpdateLinksMap } from "./content-updates.service";

interface ExtendedQuery extends ListQueryInput {
  tab?: string;
}

export async function fetchAllExams(query: ExtendedQuery): Promise<ListResult<ExamItem>> {
  const result = await getAllExams(query);

  // Attach update badges and links to each exam item
  if (result.items.length > 0) {
    const itemIds = result.items.map((e) => e.id);
    try {
      const [badges, links] = await Promise.all([
        buildUpdateBadgesMap("exam", itemIds),
        buildUpdateLinksMap("exam", itemIds),
      ]);

      for (const exam of result.items) {
        if (badges[exam.id]) {
          (exam as any).updates = badges[exam.id];
        }
        if (links[exam.id]) {
          (exam as any).updateLinks = links[exam.id];
        }
      }
    } catch (err) {
      console.warn("[exam-service] Failed to attach update badges:", err);
    }
  }

  return result;
}

export async function fetchExamById(id: string): Promise<ExamItem | null> {
  const exam = await getExamById(id);

  if (exam) {
    try {
      const [badges, links] = await Promise.all([
        buildUpdateBadgesMap("exam", [exam.id]),
        buildUpdateLinksMap("exam", [exam.id]),
      ]);
      if (badges[exam.id]) (exam as any).updates = badges[exam.id];
      if (links[exam.id]) (exam as any).updateLinks = links[exam.id];
    } catch (err) {
      console.warn("[exam-service] Failed to attach update badges:", err);
    }
  }

  return exam;
}
