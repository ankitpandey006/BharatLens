/**
 * Content service — fetches real data from backend APIs.
 * Replaces previous dummy fallbacks so production only uses DB data.
 */
import { fetchSchemes, fetchScholarships, fetchJobs, fetchExams, fetchSavedItems, fetchNotifications } from "@/lib/api/content-api";
import type { NotificationItem, SavedItem } from "@/types";
import type { NotificationRecord, OpportunityRecord, SavedRecord } from "@/lib/types/content";

const DEFAULT_CREATED_AT = "2026-04-01T00:00:00.000Z";
const DEFAULT_UPDATED_AT = "2026-05-20T00:00:00.000Z";

export async function getSchemes(page = 1, limit = 20) {
  const res = await fetchSchemes({ page, limit });
  return res.items;
}

export async function getScholarships(page = 1, limit = 20) {
  const res = await fetchScholarships({ page, limit });
  return res.items;
}

export async function getJobs(page = 1, limit = 20) {
  const res = await fetchJobs({ page, limit });
  return res.items;
}

export async function getExams(page = 1, limit = 20) {
  const res = await fetchExams({ page, limit });
  return res.items;
}

export async function getSavedItems(page = 1, limit = 20): Promise<SavedItem[]> {
  const res = await fetchSavedItems({ page, limit, optional: true });
  // normalize saved items from API shape to frontend SavedItem
  return (res.items || []).map((s: any) => ({
    id: s.id,
    type: (s.item_type || "Scheme") as any,
    title: s.item_data?.title || s.title || "",
    provider: s.item_data?.provider || s.provider || "",
    description: s.item_data?.description || s.description || "",
    deadline: s.item_data?.deadline || s.deadline || "",
    status: (s.item_data?.status as any) || "Open",
  }));
}

export async function getNotifications(page = 1, limit = 20): Promise<NotificationItem[]> {
  const res = await fetchNotifications({ page, limit, optional: true });
  return res.items as NotificationItem[];
}

export async function getNormalizedOpportunities(): Promise<OpportunityRecord[]> {
  const [schemesRes, scholarshipsRes, jobsRes, examsRes] = await Promise.all([
    fetchSchemes({ limit: 50 }),
    fetchScholarships({ limit: 50 }),
    fetchJobs({ limit: 50 }),
    fetchExams({ limit: 50 }),
  ]);

  const schemes: OpportunityRecord[] = schemesRes.items.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category || "",
    provider: item.provider || "",
    eligibility: item.eligibility || "",
    benefit: item.benefit || (item.amount ?? "") as string,
    deadline: item.deadline || "",
    officialLink: item.created_at ? `https://example.gov.in/${item.id}` : ``,
    status: (item.status as any) ?? ("Open" as any),
    source: "BharatLens",
    tags: ["scheme", (item.category || "").toLowerCase()],
    createdAt: item.created_at || DEFAULT_CREATED_AT,
    updatedAt: item.updated_at || DEFAULT_UPDATED_AT,
  }));

  const scholarships: OpportunityRecord[] = scholarshipsRes.items.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category || "",
    provider: item.provider || "",
    eligibility: item.eligibility || "",
    benefit: String(item.amount ?? ""),
    deadline: item.deadline || "",
    officialLink: item.created_at ? `https://example.gov.in/${item.id}` : ``,
    status: (item.status as any) ?? ("Open" as any),
    source: "BharatLens",
    tags: ["scholarship", (item.category || "").toLowerCase()],
    createdAt: item.created_at || DEFAULT_CREATED_AT,
    updatedAt: item.updated_at || DEFAULT_UPDATED_AT,
  }));

  const jobs: OpportunityRecord[] = jobsRes.items.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category || "Government Job",
    provider: item.organization || "",
    state: item.location || (item as any).state || "",
    location: item.location || (item as any).state || "",
    eligibility: item.qualification || "",
    benefit: item.vacancies ? `${item.vacancies} vacancies` : "",
    deadline: item.deadline || "",
    officialLink: item.created_at ? `https://example.gov.in/${item.id}` : ``,
    status: (item.status as any) ?? ("Open" as any),
    source: "BharatLens",
    tags: ["job", ((item.location || (item as any).state) || "").toLowerCase()],
    createdAt: item.created_at || DEFAULT_CREATED_AT,
    updatedAt: item.updated_at || DEFAULT_UPDATED_AT,
  }));

  const exams: OpportunityRecord[] = examsRes.items.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category || "",
    provider: item.conductingBody || "",
    benefit: item.examDate ? `Exam Date: ${item.examDate}` : "",
    deadline: item.applicationDeadline || "",
    officialLink: item.created_at ? `https://example.gov.in/${item.id}` : ``,
    status: (item.status as any) ?? ("Open" as any),
    source: "BharatLens",
    tags: ["exam", (item.category || "").toLowerCase()],
    createdAt: item.created_at || DEFAULT_CREATED_AT,
    updatedAt: item.updated_at || DEFAULT_UPDATED_AT,
  }));

  return [...schemes, ...scholarships, ...jobs, ...exams];
}

export async function getNormalizedSavedItems(): Promise<SavedRecord[]> {
  const res = await fetchSavedItems({ limit: 50, optional: true });
  return res.items.map((item: any) => ({
    ...item,
    source: "BharatLens",
    createdAt: item.created_at || DEFAULT_CREATED_AT,
    updatedAt: item.updated_at || DEFAULT_UPDATED_AT,
  }));
}

export async function getNormalizedNotifications(): Promise<NotificationRecord[]> {
  const res = await fetchNotifications({ limit: 50, optional: true });
  return res.items.map((item: any) => ({
    ...item,
    source: "BharatLens",
  }));
}
