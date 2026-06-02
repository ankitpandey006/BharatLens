import { z } from "zod";

const profileFields = {
  full_name: z.string().trim().min(1).optional(),
  age: z.coerce.number().int().positive().max(120).optional(),
  gender: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  district: z.string().trim().min(1).optional(),
  education_level: z.string().trim().min(1).optional(),
  occupation: z.string().trim().min(1).optional(),
  annual_income: z.coerce.number().nonnegative().optional(),
  category: z.string().trim().min(1).optional(),
  user_type: z.string().trim().min(1).optional(),
  preferred_language: z.string().trim().min(1).optional(),
  profile_completed: z.coerce.boolean().optional(),
  dob: z.string().trim().min(1).optional(),
  income_range: z.string().trim().min(1).optional(),
};

export const profileUpdateSchema = z.object(profileFields).partial();
export const profileCreateSchema = z.object(profileFields).partial();

export const profileIdParamSchema = z.object({
  id: z.string().min(1, "Profile ID is required"),
});
