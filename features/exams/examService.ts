import type { Exam } from "@/types/exam";

export async function fetchExams(): Promise<Exam[]> {
  return [];
}

export async function fetchExamById(_id: string): Promise<Exam | null> {
  void _id;
  return null;
}
