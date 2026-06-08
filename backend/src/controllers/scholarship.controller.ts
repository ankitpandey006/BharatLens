import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchAllScholarships, fetchScholarshipById } from "../services/scholarship.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllScholarships = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllScholarships(query);
  sendSuccess(res, "Scholarships fetched successfully", result.items, result.pagination);
});

export const getScholarshipByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const scholarship = await fetchScholarshipById(id);

  if (!scholarship) {
    sendError(res, "Scholarship not found", 404);
    return;
  }

  sendSuccess(res, "Scholarship fetched successfully", scholarship);
});
