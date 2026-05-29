import { getAllExams, getExamById, type ExamItem } from "../repositories/exam.repository";

export function fetchAllExams(): ExamItem[] {
  return getAllExams();
}

export function fetchExamById(id: string): ExamItem | undefined {
  return getExamById(id);
}
