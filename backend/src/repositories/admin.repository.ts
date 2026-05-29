import { ContentStatus } from "../constants/status";

export type AdminContentType = "scheme" | "scholarship" | "job" | "exam";

export interface AdminContentItem {
  id: string;
  title: string;
  type: AdminContentType;
  source: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

const adminItems: AdminContentItem[] = [
  {
    id: "content-001",
    title: "Smart Agriculture Initiative",
    type: "scheme",
    source: "Department of Agriculture",
    status: ContentStatus.PendingVerification,
    createdAt: "2026-05-18T10:00:00.000Z",
    updatedAt: "2026-05-20T09:15:00.000Z",
  },
  {
    id: "content-002",
    title: "Undergraduate Merit Scholarship",
    type: "scholarship",
    source: "Ministry of Higher Education",
    status: ContentStatus.PendingVerification,
    createdAt: "2026-05-20T12:30:00.000Z",
    updatedAt: "2026-05-21T14:00:00.000Z",
  },
  {
    id: "content-003",
    title: "State-Level Bank Clerk Recruitment",
    type: "job",
    source: "State Banking Commission",
    status: ContentStatus.AIProcessed,
    createdAt: "2026-05-21T08:00:00.000Z",
    updatedAt: "2026-05-22T11:00:00.000Z",
  },
  {
    id: "content-004",
    title: "Engineering Entrance Exam Update",
    type: "exam",
    source: "Exam Authority",
    status: ContentStatus.PendingVerification,
    createdAt: "2026-05-22T15:00:00.000Z",
    updatedAt: "2026-05-23T10:30:00.000Z",
  },
];

export function getPendingAdminContent(): AdminContentItem[] {
  return adminItems.filter((item) => item.status === ContentStatus.PendingVerification);
}

export function findAdminContentById(id: string): AdminContentItem | undefined {
  return adminItems.find((item) => item.id === id);
}

export function updateAdminContentStatus(id: string, status: ContentStatus): AdminContentItem | undefined {
  const item = findAdminContentById(id);

  if (!item) {
    return undefined;
  }

  item.status = status;
  item.updatedAt = new Date().toISOString();
  return item;
}
