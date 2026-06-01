import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchProfile, modifyProfile } from "../services/profile.service";

export const getProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const profile = await fetchProfile(id);

  if (!profile) {
    return sendError(res, "Profile not found", 404);
  }

  sendSuccess(res, "Profile fetched successfully", profile);
});

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const body = req.validatedBody as { name?: string; occupation?: string; state?: string };
  const profile = await modifyProfile(id, body);

  if (!profile) {
    return sendError(res, "Profile not found", 404);
  }

  sendSuccess(res, "Profile updated successfully", profile);
});
