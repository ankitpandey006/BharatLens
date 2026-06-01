import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess, sendError } from "../utils/response-helper";
import { supabase } from "../config/supabase";

export const testDbHandler = asyncHandler(async (_req: Request, res: Response) => {
  const { data, error, count } = await supabase
    .from("schemes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new AppError(error.message, 502);
  }

  if (!data) {
    return sendError(res, "No schemes data returned from Supabase", 502);
  }

  sendSuccess(res, "Supabase connectivity verified", {
    count: count ?? data.length,
    data,
  });
});
