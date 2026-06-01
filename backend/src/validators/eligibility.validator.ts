import { z } from "zod";

export const eligibilitySchema = z.object({
  age: z.number().int().min(0, "Age must be a positive number"),
  state: z.string().min(1, "State is required"),
  income: z.number().min(0, "Income must be a positive number"),
  education: z.string().min(1, "Education is required"),
  occupation: z.string().min(1, "Occupation is required"),
});
