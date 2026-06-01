import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchUserProfile, loginUser, registerNewUser } from "../services/auth.service";

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as { name: string; email: string; password: string };
  const user = await registerNewUser(body);
  sendSuccess(res, "User registered successfully", { user });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as { email: string; password: string };
  const result = await loginUser(body);
  sendSuccess(res, "Login successful", result);
});

export const getUserProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const user = await fetchUserProfile(id);

  if (!user) {
    return sendError(res, "User profile not found", 404);
  }

  sendSuccess(res, "User profile fetched", user);
});
