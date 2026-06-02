import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { successResponse } from "../utils/api-response";
import { fetchAllSchemes, fetchSchemeById } from "../services/scheme.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllSchemes = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllSchemes(query);
  res.status(200).json(successResponse("Schemes fetched successfully", result.items, result.pagination));
});

export const getSchemeByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const scheme = await fetchSchemeById(id);

  if (!scheme) {
    res.status(404).json({ success: false, message: "Scheme not found", error: "Scheme not found" });
    return;
  }

  res.status(200).json(successResponse("Scheme fetched successfully", scheme));
});
