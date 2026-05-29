import type { Scheme } from "@/types/scheme";

export async function fetchSchemes(): Promise<Scheme[]> {
  return [];
}

export async function fetchSchemeById(_id: string): Promise<Scheme | null> {
  void _id;
  return null;
}
