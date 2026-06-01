import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response-helper";
import { determineEligibility } from "../services/eligibility.service";

export const eligibilityHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validatedBody as {
    age: number;
    state: string;
    income: number;
    education: string;
    occupation: string;
  };

  const result = await determineEligibility(body);
  sendSuccess(res, "Eligibility calculated successfully", result);
});
