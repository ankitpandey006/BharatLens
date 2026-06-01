import { z } from "zod";

export const searchQuerySchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
