import type { SavedItem } from "./savedTypes";

export async function getSavedItems(): Promise<SavedItem[]> {
  return [
    {
      id: "saved-1",
      title: "Healthcare support scheme",
      category: "Schemes",
      summary: "Relevant to your income bracket and medical status.",
      link: "/schemes",
      savedAt: "2026-05-01",
    },
    {
      id: "saved-2",
      title: "Merit scholarship alert",
      category: "Scholarships",
      summary: "Useful for students with strong academic performance.",
      link: "/scholarships",
      savedAt: "2026-05-08",
    },
  ];
}
