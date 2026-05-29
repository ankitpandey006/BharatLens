import type { Request, Response } from "express";
import { successResponse } from "../utils/api-response";
import { fetchAllScholarships, fetchScholarshipById } from "../services/scholarship.service";

export function getAllScholarships(_req: Request, res: Response): void {
  const scholarships = fetchAllScholarships();
  res.status(200).json(successResponse("Scholarships fetched successfully", scholarships));
}

export function getScholarshipByIdHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: string };
  const scholarship = fetchScholarshipById(id);

  if (!scholarship) {
    res.status(404).json({ success: false, message: "Scholarship not found" });
    return;
  }

  res.status(200).json(successResponse("Scholarship fetched successfully", scholarship));
}
