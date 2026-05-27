import { exams } from "./exams";
import { jobs } from "./jobs";
import { notifications } from "./notifications";
import { recommendations } from "./recommendations";
import { scholarships } from "./scholarships";
import { schemes } from "./schemes";
import { users } from "./users";

export type UpdateType = "new" | "changed" | "expired" | "deadline_updated";
export type UpdateEntityType = "scheme" | "scholarship" | "job" | "exam";

export interface ContentUpdate {
  id: string;
  entity_type: UpdateEntityType;
  entity_id: string;
  update_type: UpdateType;
  summary: string;
  status: "pending" | "approved" | "rejected";
  updated_by: string;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

const updatesFor = (
  entity_type: UpdateEntityType,
  entityIds: string[],
  prefix: string
): ContentUpdate[] =>
  entityIds.slice(0, 10).map((entity_id, index) => {
    const update_type: UpdateType = index % 4 === 0 ? "new" : index % 4 === 1 ? "changed" : index % 4 === 2 ? "deadline_updated" : "expired";
    return {
      id: `update-${prefix}-${String(index + 1).padStart(2, "0")}`,
      entity_type,
      entity_id,
      update_type,
      summary: `${prefix.toUpperCase()} listing ${update_type.replace("_", " ")} after verification refresh cycle.`,
      status: index % 9 === 0 ? "pending" : index % 13 === 0 ? "rejected" : "approved",
      updated_by: "Megha Sahu",
      created_at: now,
      updated_at: now,
    };
  });

export const contentUpdates: ContentUpdate[] = [
  ...updatesFor("scheme", schemes.map((item) => item.id), "scheme"),
  ...updatesFor("scholarship", scholarships.map((item) => item.id), "scholarship"),
  ...updatesFor("job", jobs.map((item) => item.id), "job"),
  ...updatesFor("exam", exams.map((item) => item.id), "exam"),
];

export interface DashboardStats {
  total_users: number;
  total_schemes: number;
  total_scholarships: number;
  total_jobs: number;
  total_exams: number;
  total_recommendations: number;
  total_notifications: number;
  active_users: number;
}

export const getDashboardStats = (): DashboardStats => ({
  total_users: users.length,
  total_schemes: schemes.length,
  total_scholarships: scholarships.length,
  total_jobs: jobs.length,
  total_exams: exams.length,
  total_recommendations: recommendations.length,
  total_notifications: notifications.length,
  active_users: users.filter((user) => user.is_active).length,
});

export const filterUpdatesByType = (updateType: UpdateType): ContentUpdate[] =>
  contentUpdates.filter((item) => item.update_type === updateType);

export const searchAcrossListings = (query: string): Array<{ entity_type: UpdateEntityType; entity_id: string; title: string }> => {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  return [
    ...schemes.map((item) => ({ entity_type: "scheme" as const, entity_id: item.id, title: item.title })),
    ...scholarships.map((item) => ({ entity_type: "scholarship" as const, entity_id: item.id, title: item.title })),
    ...jobs.map((item) => ({ entity_type: "job" as const, entity_id: item.id, title: item.title })),
    ...exams.map((item) => ({ entity_type: "exam" as const, entity_id: item.id, title: item.title })),
  ].filter((item) => item.title.toLowerCase().includes(term));
};
