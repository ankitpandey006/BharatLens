import type { Request, Response } from "express";
import { successResponse } from "../utils/api-response";
import { fetchAllSchemes, fetchSchemeById } from "../services/scheme.service";

export function getAllSchemes(_req: Request, res: Response): void {
  const schemes = fetchAllSchemes();
  res.status(200).json(successResponse("Schemes fetched successfully", schemes));
}

export function getSchemeByIdHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: string };
  const scheme = fetchSchemeById(id);

  if (!scheme) {
    res.status(404).json({ success: false, message: "Scheme not found" });
    return;
  }

  res.status(200).json(successResponse("Scheme fetched successfully", scheme));
}
