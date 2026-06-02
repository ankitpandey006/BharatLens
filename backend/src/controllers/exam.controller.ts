import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { successResponse } from "../utils/api-response";
import { fetchAllExams, fetchExamById } from "../services/exam.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllExams = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllExams(query);
  res.status(200).json(successResponse("Exams fetched successfully", result.items, result.pagination));
});

export const getExamByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const exam = await fetchExamById(id);

  if (!exam) {
    res.status(404).json({ success: false, message: "Exam not found", error: "Exam not found" });
    return;
  }

  res.status(200).json(successResponse("Exam fetched successfully", exam));
});
