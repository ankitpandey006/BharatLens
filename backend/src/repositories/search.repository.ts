import { getAllSchemes, type SchemeItem } from "./scheme.repository";
import { getAllScholarships, type ScholarshipItem } from "./scholarship.repository";
import { getAllJobs, type JobItem } from "./job.repository";
import { getAllExams, type ExamItem } from "./exam.repository";
import { searchItems } from "../utils/search";
import type { ListQueryInput } from "../validators/query.validator";

export type SearchEntityType = "scheme" | "scholarship" | "job" | "exam";

export interface SearchResult {
  [key: string]: unknown;
  id: string;
  type: SearchEntityType;
  title: string;
  description: string;
  category?: string;
  provider?: string;
  source: string;
}

export interface SearchRepository {
  searchAll(query: string): Promise<SearchResult[]>;
}

function mapScheme(scheme: SchemeItem): SearchResult {
  return {
    id: scheme.id,
    type: "scheme",
    title: scheme.title,
    description: scheme.description,
    category: scheme.category,
    provider: scheme.provider,
    source: "Scheme",
  };
}

function mapScholarship(item: ScholarshipItem): SearchResult {
  return {
    id: item.id,
    type: "scholarship",
    title: item.title,
    description: item.description,
    category: item.category,
    provider: item.provider,
    source: "Scholarship",
  };
}

function mapJob(item: JobItem): SearchResult {
  return {
    id: item.id,
    type: "job",
    title: item.title,
    description: item.description,
    category: item.qualification,
    provider: item.department,
    source: "Job",
  };
}

function mapExam(item: ExamItem): SearchResult {
  return {
    id: item.id,
    type: "exam",
    title: item.title,
    description: item.description,
    category: item.level,
    provider: item.examBody,
    source: "Exam",
  };
}

// Default query to fetch all items without filtering
const defaultQuery: ListQueryInput = {
  page: 1,
  limit: 1000, // Large limit to get all items for search
  sortBy: "created_at",
  sortOrder: "desc",
};

export async function searchAll(query: string): Promise<SearchResult[]> {
  const [schemesResult, scholarshipsResult, jobsResult, examsResult] = await Promise.all([
    getAllSchemes(defaultQuery),
    getAllScholarships(defaultQuery),
    getAllJobs(defaultQuery),
    getAllExams(defaultQuery),
  ]);

  const combined = [
    ...schemesResult.items.map(mapScheme),
    ...scholarshipsResult.items.map(mapScholarship),
    ...jobsResult.items.map(mapJob),
    ...examsResult.items.map(mapExam),
  ];

  return searchItems(combined, query, ["title", "description", "category", "provider"]);
}
