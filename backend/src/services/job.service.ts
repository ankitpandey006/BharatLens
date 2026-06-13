import { getAllJobs, getJobById, type JobItem } from "../repositories/job.repository";
import type { ListQueryInput } from "../validators/query.validator";
import type { ListResult } from "../types/query.types";
import { buildUpdateBadgesMap, buildUpdateLinksMap } from "./content-updates.service";

interface ExtendedQuery extends ListQueryInput {
  tab?: string;
}

export async function fetchAllJobs(query: ExtendedQuery): Promise<ListResult<JobItem>> {
  const result = await getAllJobs(query);

  // Attach update badges and links to each job item
  if (result.items.length > 0) {
    const itemIds = result.items.map((j) => j.id);
    try {
      const [badges, links] = await Promise.all([
        buildUpdateBadgesMap("job", itemIds),
        buildUpdateLinksMap("job", itemIds),
      ]);

      for (const job of result.items) {
        if (badges[job.id]) {
          (job as any).updates = badges[job.id];
        }
        if (links[job.id]) {
          (job as any).updateLinks = links[job.id];
        }
      }
    } catch (err) {
      console.warn("[job-service] Failed to attach update badges:", err);
    }
  }

  return result;
}

export async function fetchJobById(id: string): Promise<JobItem | null> {
  const job = await getJobById(id);

  if (job) {
    try {
      const [badges, links] = await Promise.all([
        buildUpdateBadgesMap("job", [job.id]),
        buildUpdateLinksMap("job", [job.id]),
      ]);
      if (badges[job.id]) (job as any).updates = badges[job.id];
      if (links[job.id]) (job as any).updateLinks = links[job.id];
    } catch (err) {
      console.warn("[job-service] Failed to attach update badges:", err);
    }
  }

  return job;
}
