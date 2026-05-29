import { dummyExams } from "@/data/dummyExams";
import { dummyJobs } from "@/data/dummyJobs";
import { dummyScholarships } from "@/data/dummyScholarships";
import { dummySchemes } from "@/data/dummySchemes";
import type {
  DetailCategory,
  DetailItemData,
  RelatedItem,
  TimelineItem,
} from "@/components/details/types";

function matchesId(itemId: string, rawId: string) {
  if (itemId === rawId) return true;
  const numeric = Number(rawId);
  if (!Number.isNaN(numeric)) {
    return itemId.endsWith(`-${numeric}`);
  }
  return false;
}

function buildLinks(slug: string) {
  return [
    { label: "Official Website", href: `https://example.gov.in/${slug}` },
    { label: "Application Portal", href: `https://apply.example.gov.in/${slug}` },
  ];
}

function buildTimeline(deadline: string): TimelineItem[] {
  return [
    { label: "Notification Release", date: "2026-04-01" },
    { label: "Application Start", date: "2026-04-10" },
    { label: "Application Deadline", date: deadline },
    { label: "Result Announcement", date: "2026-09-30" },
  ];
}

function toRelatedItems(
  category: DetailCategory,
  currentId: string,
  items: Array<{ id: string; title: string; status: DetailItemData["status"]; subtitle: string }>,
): RelatedItem[] {
  return items
    .filter((item) => item.id !== currentId)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      status: item.status,
      href: `/${category}/${item.id}`,
    }));
}

export function getDetailByCategoryAndId(category: DetailCategory, rawId: string) {
  if (category === "scholarships") {
    const found = dummyScholarships.find((item) => matchesId(item.id, rawId));
    if (!found) return null;

    const item: DetailItemData = {
      id: found.id,
      slug: found.id,
      category,
      title: found.title,
      categoryLabel: found.category,
      provider: found.provider,
      deadline: found.deadline,
      status: found.status,
      description: found.description,
      amountOrBenefit: found.amount,
      notificationLabel: "Get scholarship alerts",
      applyUrl: `https://apply.example.gov.in/${found.id}`,
      websiteUrl: `https://example.gov.in/${found.id}`,
      pdfUrl: `https://docs.example.gov.in/${found.id}.pdf`,
      matchScore: 89,
      sections: [
        { id: "overview", title: "Overview", type: "text", content: found.description },
        {
          id: "eligibility",
          title: "Eligibility",
          type: "eligibility",
          content: [found.eligibility, "Must have valid Aadhaar and bank account details"],
        },
        {
          id: "benefits",
          title: "Benefits",
          type: "list",
          content: [found.amount, "Direct transfer to beneficiary account", "Renewal support available"],
        },
        {
          id: "documents",
          title: "Required Documents",
          type: "documents",
          content: ["Income certificate", "Previous marksheet", "Identity proof", "Bank passbook copy"],
        },
        { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(found.deadline) },
        { id: "links", title: "Important Links", type: "links", content: buildLinks(found.id) },
      ],
    };

    const related = toRelatedItems(
      category,
      found.id,
      dummyScholarships.map((value) => ({
        id: value.id,
        title: value.title,
        subtitle: value.provider,
        status: value.status,
      })),
    );

    return { item, related, relatedTitle: "Similar Scholarships" as const };
  }

  if (category === "jobs") {
    const found = dummyJobs.find((item) => matchesId(item.id, rawId));
    if (!found) return null;

    const item: DetailItemData = {
      id: found.id,
      slug: found.id,
      category,
      title: found.title,
      categoryLabel: "Government Job",
      provider: found.organization,
      deadline: found.deadline,
      status: found.status,
      description: found.description,
      amountOrBenefit: `${found.vacancies} vacancies`,
      location: found.location,
      notificationLabel: "Get job deadline reminders",
      applyUrl: `https://jobs.example.gov.in/${found.id}`,
      websiteUrl: `https://example.gov.in/${found.id}`,
      pdfUrl: `https://docs.example.gov.in/${found.id}.pdf`,
      matchScore: 82,
      sections: [
        { id: "overview", title: "Overview", type: "text", content: found.description },
        { id: "description", title: "Description", type: "text", content: found.description },
        {
          id: "eligibility",
          title: "Eligibility",
          type: "eligibility",
          content: [found.qualification, "Age limit applies as per notification"],
        },
        {
          id: "vacancy-details",
          title: "Vacancy Details",
          type: "list",
          content: [`Total vacancies: ${found.vacancies}`, `Posting location: ${found.location}`],
        },
        {
          id: "selection-process",
          title: "Selection Process",
          type: "list",
          content: ["Written examination", "Document verification", "Medical fitness test"],
        },
        { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(found.deadline) },
        { id: "links", title: "Important Links", type: "links", content: buildLinks(found.id) },
      ],
    };

    const related = toRelatedItems(
      category,
      found.id,
      dummyJobs.map((value) => ({
        id: value.id,
        title: value.title,
        subtitle: value.organization,
        status: value.status,
      })),
    );

    return { item, related, relatedTitle: "Similar Jobs" as const };
  }

  if (category === "exams") {
    const found = dummyExams.find((item) => matchesId(item.id, rawId));
    if (!found) return null;

    const item: DetailItemData = {
      id: found.id,
      slug: found.id,
      category,
      title: found.title,
      categoryLabel: found.category,
      provider: found.conductingBody,
      deadline: found.applicationDeadline,
      status: found.status,
      description: found.description,
      amountOrBenefit: `Exam date: ${found.examDate}`,
      examLevel: found.category,
      notificationLabel: "Get exam updates",
      applyUrl: `https://exams.example.gov.in/${found.id}`,
      websiteUrl: `https://example.gov.in/${found.id}`,
      pdfUrl: `https://docs.example.gov.in/${found.id}.pdf`,
      matchScore: 86,
      sections: [
        { id: "overview", title: "Overview", type: "text", content: found.description },
        {
          id: "exam-pattern",
          title: "Exam Pattern",
          type: "list",
          content: ["Preliminary exam", "Main exam", "Interview or skill round as applicable"],
        },
        {
          id: "syllabus",
          title: "Syllabus",
          type: "list",
          content: ["General awareness", "Reasoning ability", "Language comprehension", "Domain knowledge"],
        },
        {
          id: "instructions",
          title: "Instructions",
          type: "list",
          content: ["Use accurate details while filling form", "Carry admit card and valid photo ID"],
        },
        { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(found.applicationDeadline) },
        { id: "links", title: "Important Links", type: "links", content: buildLinks(found.id) },
      ],
    };

    const related = toRelatedItems(
      category,
      found.id,
      dummyExams.map((value) => ({
        id: value.id,
        title: value.title,
        subtitle: value.conductingBody,
        status: value.status,
      })),
    );

    return { item, related, relatedTitle: "Similar Exams" as const };
  }

  const found = dummySchemes.find((item) => matchesId(item.id, rawId));
  if (!found) return null;

  const item: DetailItemData = {
    id: found.id,
    slug: found.id,
    category,
    title: found.title,
    categoryLabel: found.category,
    provider: found.ministry,
    deadline: found.deadline,
    status: found.status,
    description: found.description,
    amountOrBenefit: found.benefit,
    notificationLabel: "Get scheme notifications",
    applyUrl: `https://services.example.gov.in/${found.id}`,
    websiteUrl: `https://example.gov.in/${found.id}`,
    pdfUrl: `https://docs.example.gov.in/${found.id}.pdf`,
    matchScore: 91,
    sections: [
      { id: "overview", title: "Overview", type: "text", content: found.description },
      {
        id: "eligibility",
        title: "Eligibility",
        type: "eligibility",
        content: [found.eligibility, "State and category criteria may apply"],
      },
      {
        id: "benefits",
        title: "Benefits",
        type: "list",
        content: [found.benefit, "Government verified source", "Periodic updates from ministry"],
      },
      {
        id: "documents",
        title: "Required Documents",
        type: "documents",
        content: ["Identity proof", "Address proof", "Income or category certificate"],
      },
      { id: "dates", title: "Important Dates", type: "timeline", content: buildTimeline(found.deadline) },
      { id: "links", title: "Important Links", type: "links", content: buildLinks(found.id) },
    ],
  };

  const related = toRelatedItems(
    category,
    found.id,
    dummySchemes.map((value) => ({
      id: value.id,
      title: value.title,
      subtitle: value.ministry,
      status: value.status,
    })),
  );

  return { item, related, relatedTitle: "Similar Schemes" as const };
}
