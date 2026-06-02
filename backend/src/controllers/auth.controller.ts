import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import {
  fetchUserProfile,
  loginUser,
  logoutUser,
  registerNewUser,
  updateUserProfile,
} from "../services/auth.service";

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as { full_name: string; email: string; password: string };
  const user = await registerNewUser(body);
  sendSuccess(res, "User registered successfully", { user });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as { email: string; password: string };
  const result = await loginUser(body);
  sendSuccess(res, "Login successful", result);
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

  if (!token) {
    return sendError(res, "Authorization token missing", 401);
  }

  await logoutUser(token);
  sendSuccess(res, "Logout successful", { message: "User logged out" });
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "User not authenticated", 401);
  }

  const profile = await fetchUserProfile(user.id);

  if (!profile) {
    return sendError(res, "User profile not found", 404);
  }

  sendSuccess(res, "Current user fetched successfully", profile);
});

export const updateAuthProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const body = req.validatedBody as {
    full_name?: string;
    age?: number;
    state?: string;
    district?: string;
    category?: string;
    dob?: string;
    education_level?: string;
    occupation?: string;
    user_type?: string;
    income_range?: string;
    annual_income?: number;
    gender?: string;
    preferred_language?: string;
  };

  const updatedUser = await updateUserProfile(user.id, body);

  if (!updatedUser) {
    return sendError(res, "User profile update failed", 400);
  }

  sendSuccess(res, "Profile updated successfully", updatedUser);
});

export const getUserProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const user = await fetchUserProfile(id);

  if (!user) {
    return sendError(res, "User profile not found", 404);
  }

  sendSuccess(res, "User profile fetched", user);
});
