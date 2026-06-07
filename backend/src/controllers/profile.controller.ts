import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchProfile, modifyProfile } from "../services/profile.service";

export const getOwnProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const profile = await fetchProfile(user.id);

  if (!profile) {
    return sendError(res, "Profile not found", 404);
  }

  sendSuccess(res, "Profile fetched successfully", profile);
});

export const updateOwnProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const body = req.validatedBody as {
    full_name?: string;
    age?: number;
    state?: string;
    category?: string;
    dob?: string;
    education_level?: string;
    occupation?: string;
    user_type?: string;
    income_range?: string;
    annual_income?: number;
    gender?: string;
    preferred_language?: string;
    profile_completed?: boolean;
  };

  const profile = await modifyProfile(user.id, body);

  if (!profile) {
    return sendError(res, "Profile not found", 404);
  }

  sendSuccess(res, "Profile updated successfully", profile);
});

export const createOwnProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const profile = await modifyProfile(user.id, req.validatedBody as Parameters<typeof modifyProfile>[1]);

  if (!profile) {
    return sendError(res, "Profile not found", 404);
  }

  sendSuccess(res, "Profile saved successfully", profile);
});

export const getProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const profile = await fetchProfile(id);

  if (!profile) {
    return sendError(res, "Profile not found", 404);
  }

  sendSuccess(res, "Profile fetched successfully", profile);
});
