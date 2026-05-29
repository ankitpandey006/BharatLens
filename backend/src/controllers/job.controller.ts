import type { Request, Response } from "express";
import { successResponse } from "../utils/api-response";
import { fetchAllJobs, fetchJobById } from "../services/job.service";

export function getAllJobs(_req: Request, res: Response): void {
  const jobs = fetchAllJobs();
  res.status(200).json(successResponse("Jobs fetched successfully", jobs));
}

export function getJobByIdHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: string };
  const job = fetchJobById(id);

  if (!job) {
    res.status(404).json({ success: false, message: "Job not found" });
    return;
  }

  res.status(200).json(successResponse("Job fetched successfully", job));
}
