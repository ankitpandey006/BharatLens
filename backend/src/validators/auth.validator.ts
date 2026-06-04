import { z } from "zod";

const profileFieldSchema = {
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
  dob: z.string().trim().min(1).optional(),
  income_range: z.string().trim().min(1).optional(),
  profile_completed: z.coerce.boolean().optional(),
};

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required").optional(),
    full_name: z.string().trim().min(1, "Full name is required").optional(),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .transform((value) => ({
    full_name: value.full_name ?? value.fullName ?? "",
    email: value.email,
    password: value.password,
  }))
  .refine((value) => value.full_name.length > 0, {
    message: "Full name is required",
    path: ["fullName"],
  });

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authProfileUpdateSchema = z.object(profileFieldSchema).partial();

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});
