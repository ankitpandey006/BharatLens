import { z } from "zod";

export const adminActionSchema = z.object({
  id: z.string().min(1, "Content ID is required"),
});
