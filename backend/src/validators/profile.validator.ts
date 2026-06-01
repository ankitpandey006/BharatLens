import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().optional(),
  occupation: z.string().optional(),
  state: z.string().optional(),
});

export const profileIdParamSchema = z.object({
  id: z.string().min(1, "Profile ID is required"),
});
