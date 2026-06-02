import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export type UserRole = "user" | "admin" | "moderator";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError("Non-admin access denied", 403);
    }

    next();
  };
}

export const requireAdmin = requireRole("admin");
export const requireAdminOrModerator = requireRole("admin", "moderator");
