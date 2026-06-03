import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendError, sendSuccess } from "../utils/response-helper";
import { extractPdfDocument } from "../collectors/pdf/pdf-extractor.service";
import { findSourceByName } from "../repositories/collected-data.repository";

function inferSourceFromHost(host: string): string | null {
  const h = host.toLowerCase();
  if (h.includes("ugc")) return "UGC";
  if (h.includes("aicte")) return "AICTE";
  if (h.includes("upsc")) return "UPSC";
  if (h.includes("nta")) return "NTA";
  if (h.includes("ssc")) return "SSC";
  if (h.includes("rrb")) return "RRB";
  if (h.includes("pib")) return "PIB";
  if (h.includes("employment")) return "Employment News";
  if (h.includes("mygov")) return "MyGov";
  if (h.includes("india.gov")) return "India.gov";
  return null;
}

export const extractPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { url?: unknown; sourceName?: unknown } | undefined;

  if (!body || typeof body.url !== "string" || !body.url.trim()) {
    return sendError(res, "url is required", 400, "Missing or invalid url");
  }

  const url = body.url.trim();
  let sourceName = typeof body.sourceName === "string" && body.sourceName.trim() ? body.sourceName.trim() : "";

  if (!sourceName) {
    try {
      const host = new URL(url).hostname;
      const inferred = inferSourceFromHost(host);
      if (inferred) {
        // verify it exists in sources table
        const src = await findSourceByName(inferred);
        if (src) sourceName = inferred;
      }
    } catch {
      // ignore URL parse errors here; service will validate URL
    }
  } else {
    // try to normalize a provided name like "UGC Test" -> "UGC"
    const normalized = sourceName.toLowerCase();
    if (!await findSourceByName(sourceName)) {
      if (normalized.includes("ugc")) sourceName = "UGC";
      else if (normalized.includes("aicte")) sourceName = "AICTE";
      else if (normalized.includes("upsc")) sourceName = "UPSC";
      else if (normalized.includes("nta")) sourceName = "NTA";
      else if (normalized.includes("ssc")) sourceName = "SSC";
      else if (normalized.includes("rrb")) sourceName = "RRB";
    }
  }

  try {
    const result = await extractPdfDocument(url, sourceName);
    sendSuccess(res, "PDF extracted successfully", result);
  } catch (err) {
    // let error middleware handle AppError; but respond with standard error shape for unexpected issues
    const msg = err instanceof Error ? err.message : "PDF extraction failed";
    sendError(res, msg, err && typeof (err as any).statusCode === "number" ? (err as any).statusCode : 500, msg);
  }
});

export default extractPdfHandler;
