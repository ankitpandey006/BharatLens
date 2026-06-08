import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchAllJobs, fetchJobById } from "../services/job.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllJobs(query);
  sendSuccess(res, "Jobs fetched successfully", result.items, result.pagination);
});

export const getJobByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const job = await fetchJobById(id);

  if (!job) {
    sendError(res, "Job not found", 404);
    return;
  }

  sendSuccess(res, "Job fetched successfully", job);
});
