import type { ListingStatus } from "@/types";

export type DetailCategory = "scholarships" | "jobs" | "exams" | "schemes";

export interface LinkItem {
  label: string;
  href: string;
}

export interface TimelineItem {
  label: string;
  date: string;
  description?: string;
}

export interface DetailSectionData {
  id: string;
  title: string;
  type: "text" | "list" | "timeline" | "eligibility" | "documents" | "links";
  content:
    | string
    | string[]
    | TimelineItem[]
    | LinkItem[];
}

export interface RelatedItem {
  id: string;
  title: string;
  subtitle: string;
  status: ListingStatus;
  href: string;
}

export interface DetailItemData {
  id: string;
  slug: string;
  category: DetailCategory;
  title: string;
  categoryLabel: string;
  provider: string;
  deadline: string;
  status: ListingStatus;
  description: string;
  amountOrBenefit?: string;
  location?: string;
  examLevel?: string;
  notificationLabel: string;
  applyUrl?: string;
  websiteUrl?: string;
  pdfUrl?: string;
  matchScore: number;
  sections: DetailSectionData[];
}
