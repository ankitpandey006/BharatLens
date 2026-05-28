import type { Scholarship } from "@/types/scholarship";

export async function fetchScholarships(): Promise<Scholarship[]> {
  return [];
}

export async function fetchScholarshipById(_id: string): Promise<Scholarship | null> {
  void _id;
  return null;
}
