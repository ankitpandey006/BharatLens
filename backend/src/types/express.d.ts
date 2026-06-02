import type { ParamsDictionary } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      validatedParams?: ParamsDictionary;
      validatedBody?: Record<string, unknown>;
      validatedQuery?: Record<string, unknown>;
      user?: {
        id: string;
        email: string;
        role: "user" | "admin" | "moderator";
        full_name?: string | null;
        age?: number | null;
        first_name?: string | null;
        last_name?: string | null;
        state?: string | null;
        district?: string | null;
        category?: string | null;
        gender?: string | null;
        education_level?: string | null;
        occupation?: string | null;
        user_type?: string | null;
        income_range?: string | null;
        annual_income?: number | null;
        preferred_language?: string | null;
        dob?: string | null;
      };
    }
  }
}

export {};
