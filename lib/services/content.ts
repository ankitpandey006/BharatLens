/**
 * Content service — dummy data layer for BharatLens listings.
 * TODO: Replace getSchemes/getScholarships/getJobs/getExams with Supabase PostgreSQL queries.
 * TODO: Replace getSavedItems/getNotifications with authenticated Supabase API routes.
 */
import { dummyExams } from "@/data/dummyExams";
import { dummyJobs } from "@/data/dummyJobs";
import { dummyNotifications } from "@/data/dummyNotifications";
import { dummySavedItems } from "@/data/dummySavedItems";
import { dummyScholarships } from "@/data/dummyScholarships";
import { dummySchemes } from "@/data/dummySchemes";
import type { NotificationItem, SavedItem } from "@/types";
import type { NotificationRecord, OpportunityRecord, SavedRecord } from "@/lib/types/content";

const DEFAULT_CREATED_AT = "2026-04-01T00:00:00.000Z";
const DEFAULT_UPDATED_AT = "2026-05-20T00:00:00.000Z";

export function getSchemes() {
  return dummySchemes;
}

export function getScholarships() {
  return dummyScholarships;
}

export function getJobs() {
  return dummyJobs;
}

export function getExams() {
  return dummyExams;
}

export function getSavedItems(): SavedItem[] {
  return dummySavedItems;
}

export function getNotifications(): NotificationItem[] {
  return dummyNotifications;
}

export function getNormalizedOpportunities(): OpportunityRecord[] {
  const schemes: OpportunityRecord[] = dummySchemes.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    provider: item.provider,
    eligibility: item.eligibility,
    benefit: item.benefit,
    deadline: item.deadline,
    officialLink: `https://example.gov.in/${item.id}`,
    status: item.status,
    source: "BharatLens Dummy",
    tags: ["scheme", item.category.toLowerCase()],
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_UPDATED_AT,
  }));

  const scholarships: OpportunityRecord[] = dummyScholarships.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    provider: item.provider,
    eligibility: item.eligibility,
    benefit: item.amount,
    deadline: item.deadline,
    officialLink: `https://example.gov.in/${item.id}`,
    status: item.status,
    source: "BharatLens Dummy",
    tags: ["scholarship", item.category.toLowerCase()],
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_UPDATED_AT,
  }));

  const jobs: OpportunityRecord[] = dummyJobs.map((item) => ({
    id: item.id,
    title: item.title,
    category: "Government Job",
    provider: item.organization,
    state: item.location,
    location: item.location,
    eligibility: item.qualification,
    benefit: `${item.vacancies} vacancies`,
    deadline: item.deadline,
    officialLink: `https://example.gov.in/${item.id}`,
    status: item.status,
    source: "BharatLens Dummy",
    tags: ["job", item.location.toLowerCase()],
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_UPDATED_AT,
  }));

  const exams: OpportunityRecord[] = dummyExams.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    provider: item.conductingBody,
    benefit: `Exam Date: ${item.examDate}`,
    deadline: item.applicationDeadline,
    officialLink: `https://example.gov.in/${item.id}`,
    status: item.status,
    source: "BharatLens Dummy",
    tags: ["exam", item.category.toLowerCase()],
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_UPDATED_AT,
  }));

  return [...schemes, ...scholarships, ...jobs, ...exams];
}

export function getNormalizedSavedItems(): SavedRecord[] {
  return dummySavedItems.map((item) => ({
    ...item,
    source: "BharatLens Dummy",
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_UPDATED_AT,
  }));
}

export function getNormalizedNotifications(): NotificationRecord[] {
  return dummyNotifications.map((item) => ({
    ...item,
    source: "BharatLens Dummy",
  }));
}
