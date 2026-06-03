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

// Preprocess function to normalize input
const normalizeProfileInput = (data: unknown) => {
  if (typeof data !== "object" || data === null) return data;

  const obj = data as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Handle education -> education_level alias
    if (key === "education") {
      normalized.education_level = value;
    }
    // Handle profileCompleted -> profile_completed
    else if (key === "profileCompleted") {
      normalized.profile_completed = value;
    }
    // Preserve other keys
    else {
      normalized[key] = value;
    }
  }

  return normalized;
};

const profilePartialFields = Object.entries(profileFields).reduce(
  (acc, [key, schema]) => {
    acc[key] = schema;
    return acc;
  },
  {} as Record<string, z.ZodTypeAny>
);

export const profileUpdateSchema = z
  .preprocess(
    normalizeProfileInput,
    z.object(profilePartialFields).partial()
  );

export const profileCreateSchema = z
  .preprocess(
    normalizeProfileInput,
    z.object(profilePartialFields).partial()
  );

export const profileIdParamSchema = z.object({
  id: z.string().min(1, "Profile ID is required"),
});
