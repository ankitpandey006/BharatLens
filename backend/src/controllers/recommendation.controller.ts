import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response-helper";
import { getRecommendations } from "../services/recommendation.service";

export const recommendationHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as {
    state?: string;
    education?: string;
    occupation?: string;
    interests?: string[];
  };

  const results = await getRecommendations(body);
  sendSuccess(res, "Recommendations generated successfully", results);
});
