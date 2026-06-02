import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { successResponse } from "../utils/api-response";
import { fetchAllJobs, fetchJobById } from "../services/job.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllJobs(query);
  res.status(200).json(successResponse("Jobs fetched successfully", result.items, result.pagination));
});

export const getJobByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const job = await fetchJobById(id);

  if (!job) {
    res.status(404).json({ success: false, message: "Job not found", error: "Job not found" });
    return;
  }

  res.status(200).json(successResponse("Job fetched successfully", job));
});
