import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { fetchAllSchemes, fetchSchemeById } from "../services/scheme.service";
import { parseListQuery } from "../utils/query-parser";

export const getAllSchemes = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListQuery(req);
  const result = await fetchAllSchemes(query);
  sendSuccess(res, "Schemes fetched successfully", result.items, result.pagination);
});

export const getSchemeByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const scheme = await fetchSchemeById(id);

  if (!scheme) {
    sendError(res, "Scheme not found", 404);
    return;
  }

  sendSuccess(res, "Scheme fetched successfully", scheme);
});
