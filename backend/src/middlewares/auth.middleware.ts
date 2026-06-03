import type { Request, Response, NextFunction } from "express";
import { supabase, supabaseAuth } from "../config/supabase";
import { AppError } from "../utils/app-error";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError("Missing Authorization header", 401));
  }

  const authParts = authHeader.split(" ");

  if (authParts.length !== 2 || authParts[0] !== "Bearer" || !authParts[1]) {
    return next(new AppError("Malformed Authorization header. Expected 'Bearer <token>'", 401));
  }

  const token = authParts[1];

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data?.user || !data.user.id) {
      const message = error?.message.toLowerCase() ?? "";
      const isExpired = message.includes("expired") || message.includes("jwt");
      return next(new AppError(isExpired ? "Expired authentication token" : "Invalid authentication token", 401));
    }

    const userId = data.user.id;
    const userEmail = data.user.email ?? "";

    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      return next(new AppError("Failed to verify user role", 500));
    }

    if (!userRecord) {
      return next(new AppError("User record not found", 401));
    }

    const { data: profileRecord, error: profileError } = await supabase
      .from("user_profiles")
      .select("state, category, gender, education_level, occupation, user_type, income_range, annual_income, dob")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      return next(new AppError("Failed to verify user profile", 500));
    }

    req.user = {
      id: userId,
      email: userEmail,
      role: (userRecord.role as "user" | "admin" | "moderator") ?? "user",
      full_name: userRecord.full_name as string | null,
      age: null,
      state: (profileRecord?.state as string | null | undefined) ?? null,
      district: null,
      category: (profileRecord?.category as string | null | undefined) ?? null,
      gender: (profileRecord?.gender as string | null | undefined) ?? null,
      education_level: (profileRecord?.education_level as string | null | undefined) ?? null,
      occupation: (profileRecord?.occupation as string | null | undefined) ?? null,
      user_type: (profileRecord?.user_type as string | null | undefined) ?? null,
      income_range: (profileRecord?.income_range as string | null | undefined) ?? null,
      annual_income: (profileRecord?.annual_income as number | null | undefined) ?? null,
      preferred_language: null,
      dob: (profileRecord?.dob as string | null | undefined) ?? null,
    };

    next();
  } catch (error) {
    return next(new AppError("Failed to authenticate user", 401));
  }
}
