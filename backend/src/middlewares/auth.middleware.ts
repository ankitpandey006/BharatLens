import type { Request, Response, NextFunction } from "express";
import { supabaseAuth } from "../config/supabase";
import { syncAuthenticatedUser } from "../repositories/auth.repository";
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

    const authUser = data.user;

    try {
      const syncedUser = await syncAuthenticatedUser(authUser);

      req.user = {
        id: syncedUser.id,
        email: syncedUser.email,
        role: syncedUser.role,
        full_name: syncedUser.full_name ?? null,
        age: syncedUser.age ?? null,
        state: syncedUser.state ?? null,
        category: syncedUser.category ?? null,
        gender: syncedUser.gender ?? null,
        education_level: syncedUser.education_level ?? null,
        occupation: syncedUser.occupation ?? null,
        user_type: syncedUser.user_type ?? null,
        income_range: syncedUser.income_range ?? null,
        annual_income: syncedUser.annual_income ?? null,
        preferred_language: syncedUser.preferred_language ?? null,
        dob: syncedUser.dob ?? null,
      };

      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sync authenticated user";
      return next(new AppError(message, 500));
    }
  } catch (error) {
    return next(new AppError("Failed to authenticate user", 401));
  }
}
