import type { DetailItemData, DetailSectionData } from "@/components/details/types";
import type { Exam } from "@/lib/api/exams";
import type { Job } from "@/lib/api/jobs";
import type { Scholarship } from "@/lib/api/scholarships";
import type { Scheme } from "@/lib/api/schemes";

function buildTimeline(deadline?: string) {
  const fallback = new Date().toISOString().slice(0, 10);

  return [
    { label: "Application opened", date: deadline || fallback },
    { label: "Last date to apply", date: deadline || fallback },
    { label: "Result announcement", date: deadline || fallback },
  ];
}

function buildLinks(officialUrl?: string) {
  if (!officialUrl) {
    return [{ label: "Official listing", href: "/" }];
  }

  return [
    { label: "Official website", href: officialUrl },
    { label: "Application portal", href: officialUrl },
  ];
}

export function mapSchemeToDetailItem(item: Scheme): DetailItemData {
  const sections: DetailSectionData[] = [
    { id: "overview", title: "Overview", type: "text", content: item.description || "No description available." },
    {
      id: "eligibility",
      title: "Eligibility",
      type: "eligibility",
      content: [item.eligibility || "Eligibility details not provided.", "State and category criteria may apply."],
    },
    {
      id: "benefits",
      title: "Benefits",
      type: "list",
      content: [item.benefit || "Benefits information unavailable.", "Government-verified scheme details.", "Apply before the deadline to benefit."],
    },
    {
      id: "documents",
      title: "Required Documents",
      type: "documents",
      content: ["Identity proof", "Address proof", "Income certificate", "Bank account details"],
    },
    { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(item.deadline) },
    { id: "links", title: "Important Links", type: "links", content: buildLinks(item.official_url) },
  ];

  return {
    id: item.id,
    slug: item.id,
    category: "schemes",
    title: item.title,
    categoryLabel: item.category || "Scheme",
    provider: item.provider || "Government",
    deadline: item.deadline || "TBD",
    status: (item.status as any) || "Open",
    description: item.description || "",
    amountOrBenefit: item.benefit,
    notificationLabel: "Get scheme notifications",
    applyUrl: item.official_url,
    websiteUrl: item.official_url,
    pdfUrl: item.official_url,
    matchScore: 88,
    sections,
  };
}

export function mapScholarshipToDetailItem(item: Scholarship): DetailItemData {
  const sections: DetailSectionData[] = [
    { id: "overview", title: "Overview", type: "text", content: item.description || "No description available." },
    {
      id: "eligibility",
      title: "Eligibility",
      type: "eligibility",
      content: [item.eligibility || "Eligibility details not provided.", "Must satisfy category and income requirements."],
    },
    {
      id: "benefits",
      title: "Benefits",
      type: "list",
      content: [item.benefit || "Scholarship benefit unknown.", "Direct transfer to beneficiary account.", "Support for tuition and exam fees."],
    },
    {
      id: "documents",
      title: "Required Documents",
      type: "documents",
      content: ["Identity proof", "Address proof", "Income certificate", "Marksheets"],
    },
    { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(item.deadline) },
    { id: "links", title: "Important Links", type: "links", content: buildLinks(item.official_url) },
  ];

  return {
    id: item.id,
    slug: item.id,
    category: "scholarships",
    title: item.title,
    categoryLabel: item.category || "Scholarship",
    provider: item.provider || "Provider",
    deadline: item.deadline || "TBD",
    status: (item.status as any) || "Open",
    description: item.description || "",
    amountOrBenefit: item.benefit,
    notificationLabel: "Get scholarship alerts",
    applyUrl: item.official_url,
    websiteUrl: item.official_url,
    pdfUrl: item.official_url,
    matchScore: 86,
    sections,
  };
}

export function mapJobToDetailItem(item: Job): DetailItemData {
  const sections: DetailSectionData[] = [
    { id: "overview", title: "Overview", type: "text", content: item.description || "No description available." },
    {
      id: "eligibility",
      title: "Eligibility",
      type: "eligibility",
      content: [item.qualification || "Qualification details not provided.", "Age and experience criteria may apply."],
    },
    {
      id: "vacancy-details",
      title: "Vacancy details",
      type: "list",
      content: [
        `Total vacancies: ${item.vacancies ?? "N/A"}`,
        `Department: ${item.department || "N/A"}`,
        `Location: ${item.location || "N/A"}`,
      ],
    },
    {
      id: "selection-process",
      title: "Selection process",
      type: "list",
      content: ["Written exam", "Document verification", "Interview or skill test"],
    },
    { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(item.deadline) },
    { id: "links", title: "Important Links", type: "links", content: buildLinks(item.official_url) },
  ];

  return {
    id: item.id,
    slug: item.id,
    category: "jobs",
    title: item.title,
    categoryLabel: item.category || "Government Job",
    provider: item.department || "Government",
    deadline: item.deadline || "TBD",
    status: (item.status as any) || "Open",
    description: item.description || "",
    amountOrBenefit: item.vacancies ? `${item.vacancies} vacancies` : undefined,
    location: item.location,
    notificationLabel: "Get job deadline reminders",
    applyUrl: item.official_url,
    websiteUrl: item.official_url,
    pdfUrl: item.official_url,
    matchScore: 80,
    sections,
  };
}

export function mapExamToDetailItem(item: Exam): DetailItemData {
  const sections: DetailSectionData[] = [
    { id: "overview", title: "Overview", type: "text", content: item.description || "No description available." },
    {
      id: "eligibility",
      title: "Eligibility",
      type: "eligibility",
      content: [item.category || "Eligibility details not provided.", "Qualification and age criteria may apply."],
    },
    {
      id: "exam-pattern",
      title: "Exam pattern",
      type: "list",
      content: ["Preliminary exam", "Main exam", "Interview or skill round"],
    },
    {
      id: "instructions",
      title: "Instructions",
      type: "list",
      content: ["Submit applications before deadline", "Keep scanned documents ready", "Follow official notifications for updates"],
    },
    { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(item.deadline) },
    { id: "links", title: "Important Links", type: "links", content: buildLinks(item.official_url) },
  ];

  return {
    id: item.id,
    slug: item.id,
    category: "exams",
    title: item.title,
    categoryLabel: item.category || "Exam",
    provider: item.examBody || "Exam Authority",
    deadline: item.deadline || "TBD",
    status: (item.status as any) || "Open",
    description: item.description || "",
    amountOrBenefit: item.notificationDate ? `Exam date: ${item.notificationDate}` : undefined,
    examLevel: item.level,
    notificationLabel: "Get exam updates",
    applyUrl: item.official_url,
    websiteUrl: item.official_url,
    pdfUrl: item.official_url,
    matchScore: 82,
    sections,
  };
}
