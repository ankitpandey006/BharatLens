import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchAllExams, fetchExamById } from "../services/exam.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllExams = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const tab = typeof req.query.tab === "string" ? req.query.tab.trim().toLowerCase() : undefined;
  const result = await fetchAllExams({ ...query, tab });

  console.log("[exam-controller] GET /api/exams — total count:", result.pagination?.total, "| returned:", result.items.length);
  if (result.items.length > 0) {
    for (const exam of result.items) {
      console.log(
        `[exam-controller]   id=${exam.id} exam_name="${(exam.title ?? exam.exam_name ?? "").slice(0, 60)}" ` +
        `verification_status=${exam.verification_status} status=${exam.status} ` +
        `is_expired=${exam.is_expired} published_at=${exam.published_at}`
      );
    }
  }

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
