import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { successResponse } from "../utils/api-response";
import { fetchAllScholarships, fetchScholarshipById } from "../services/scholarship.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllScholarships = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllScholarships(query);
  res.status(200).json(successResponse("Scholarships fetched successfully", result.items, result.pagination));
});

export const getScholarshipByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const scholarship = await fetchScholarshipById(id);

  if (!scholarship) {
    res.status(404).json({ success: false, message: "Scholarship not found" });
    return;
  }

  res.status(200).json(successResponse("Scholarship fetched successfully", scholarship));
});
