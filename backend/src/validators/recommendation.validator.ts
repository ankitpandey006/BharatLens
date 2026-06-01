import { z } from "zod";

export const recommendationSchema = z.object({
  state: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  interests: z.array(z.string()).optional(),
});
