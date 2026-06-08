import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchAllExams, fetchExamById } from "../services/exam.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllExams = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllExams(query);
  sendSuccess(res, "Exams fetched successfully", result.items, result.pagination);
});

export const getExamByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const exam = await fetchExamById(id);

  if (!exam) {
    sendError(res, "Exam not found", 404);
    return;
  }

  sendSuccess(res, "Exam fetched successfully", exam);
});
