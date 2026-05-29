import { exams } from "./exams";
import { jobs } from "./jobs";
import { scholarships } from "./scholarships";
import { schemes } from "./schemes";
import { users } from "./users";

export type SavedEntityType = "scheme" | "scholarship" | "job" | "exam";

export interface SavedItem {
  id: string;
  user_id: string;
  entity_type: SavedEntityType;
  entity_id: string;
  status: "active" | "closed";
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

export const savedItems: SavedItem[] = users.flatMap((user, index) => [
  {
    id: `saved-${String(index + 1).padStart(2, "0")}-scheme`,
    user_id: user.id,
    entity_type: "scheme",
    entity_id: schemes[index % schemes.length].id,
    status: "active",
    created_at: now,
    updated_at: now,
  },
  {
    id: `saved-${String(index + 1).padStart(2, "0")}-scholarship`,
    user_id: user.id,
    entity_type: "scholarship",
    entity_id: scholarships[(index + 3) % scholarships.length].id,
    status: index % 8 === 0 ? "closed" : "active",
    created_at: now,
    updated_at: now,
  },
  {
    id: `saved-${String(index + 1).padStart(2, "0")}-job`,
    user_id: user.id,
    entity_type: "job",
    entity_id: jobs[(index + 5) % jobs.length].id,
    status: "active",
    created_at: now,
    updated_at: now,
  },
  {
    id: `saved-${String(index + 1).padStart(2, "0")}-exam`,
    user_id: user.id,
    entity_type: "exam",
    entity_id: exams[(index + 7) % exams.length].id,
    status: "active",
    created_at: now,
    updated_at: now,
  },
]);

export const getSavedItemsByUser = (userId: string): SavedItem[] =>
  savedItems.filter((item) => item.user_id === userId);
