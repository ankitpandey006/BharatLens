import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/response-helper";
import { performSearch } from "../services/search.service";

export const searchHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = String(req.validatedQuery?.query || "");
  const page = Number(req.validatedQuery?.page ?? 1);
  const limit = Number(req.validatedQuery?.limit ?? 20);
  const result = await performSearch(query, page, limit);

  sendSuccess(res, "Search completed successfully", result.data, result.pagination);
});
