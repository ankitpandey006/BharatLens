import { z } from "zod";

export const recommendationQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

export const recommendationIdSchema = z.object({
  id: z.string().min(1, "Recommendation ID is required"),
});
