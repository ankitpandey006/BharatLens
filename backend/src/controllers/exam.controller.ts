import type { Request, Response } from "express";
import { successResponse } from "../utils/api-response";
import { fetchAllExams, fetchExamById } from "../services/exam.service";

export function getAllExams(_req: Request, res: Response): void {
  const exams = fetchAllExams();
  res.status(200).json(successResponse("Exams fetched successfully", exams));
}

export function getExamByIdHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: string };
  const exam = fetchExamById(id);

  if (!exam) {
    res.status(404).json({ success: false, message: "Exam not found" });
    return;
  }

  res.status(200).json(successResponse("Exam fetched successfully", exam));
}
