import { getAllExams, getExamById, type ExamItem } from "../repositories/exam.repository";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult } from "../types/query.types";

export async function fetchAllExams(query: ListQueryInput): Promise<ListResult<ExamItem>> {
  return getAllExams(query);
}

export async function fetchExamById(id: string): Promise<ExamItem | null> {
  return getExamById(id);
}
