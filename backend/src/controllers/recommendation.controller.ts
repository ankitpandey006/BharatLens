import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import {
  generateRecommendations,
  getRecommendations,
  getRecommendationsByItemType,
  viewRecommendation,
} from "../services/recommendation.service";
import type { RecommendationEntityType } from "../repositories/recommendation.repository";

export const listRecommendationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const query = req.validatedQuery as { page?: number; limit?: number };
  const result = await getRecommendations(user.id, query.page ?? 1, query.limit ?? 20);
  sendSuccess(res, "Recommendations fetched successfully", result);
});

export const getRecommendationsByTypeHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { itemType } = req.validatedParams as { itemType: string };
  const query = req.validatedQuery as { page?: number; limit?: number };

  const result = await getRecommendationsByItemType(
    user.id,
    itemType as RecommendationEntityType,
    query.page ?? 1,
    query.limit ?? 20,
  );

  sendSuccess(res, `Recommendations of type ${itemType} fetched successfully`, result);
});

export const generateRecommendationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const currentProfile = user;
  const results = await generateRecommendations(user.id, {
    state: currentProfile.state,
    category: currentProfile.category,
    gender: currentProfile.gender,
    education_level: currentProfile.education_level,
    occupation: currentProfile.occupation,
    user_type: currentProfile.user_type,
    income_range: currentProfile.income_range,
    annual_income: currentProfile.annual_income,
    dob: currentProfile.dob,
  });

  sendSuccess(res, "Recommendations generated successfully", results);
});

export const markRecommendationViewedHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return sendError(res, "Authentication required", 401);
  }

  const { id } = req.validatedParams as { id: string };
  const recommendation = await viewRecommendation(user.id, id);

  if (!recommendation) {
    return sendError(res, "Recommendation not found", 404);
  }

  sendSuccess(res, "Recommendation marked as viewed", recommendation);
});
