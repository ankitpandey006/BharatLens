import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendError, sendSuccess } from "../utils/response-helper";
import {
  getCollectorStats,
  getCollectorStatus as getCollectorStatusService,
  getCollectedData,
  cleanCollectorText,
  classifyCollectorText,
  processCollectorData,
  runAllCollectors,
  runAllRssCollectors as runAllRssCollectorsService,
  runEmploymentRssCollection,
  runGenericRssCollection,
  runPibRssCollection,
  runPdfExtractor,
  runWebsiteScraper,
} from "../services/collector.service";

export const getCollectorStatus = asyncHandler(async (_req: Request, res: Response) => {
  const status = await getCollectorStatusService();
  sendSuccess(res, "Collector status fetched successfully", status);
});

export const getCollectorStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getCollectorStats();
  sendSuccess(res, "Collector stats fetched successfully", stats);
});

export const getCollectedDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const result = await getCollectedData(page > 0 ? page : 1, limit > 0 ? limit : 10);
  sendSuccess(res, "Collected data fetched successfully", result);
});

export const processCollectorDataHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { rawTitle?: unknown; rawContent?: unknown } | undefined;

  if (!body || typeof body.rawTitle !== "string" || typeof body.rawContent !== "string") {
    return sendError(res, "rawTitle and rawContent are required", 400, "Missing required body fields");
  }

  const result = await processCollectorData(body.rawTitle, body.rawContent);
  sendSuccess(res, "Collector data processed successfully", result);
});

export const cleanTextHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { text?: unknown } | undefined;

  if (!body || typeof body.text !== "string") {
    return sendError(res, "text is required", 400, "Missing or invalid text");
  }

  const result = await cleanCollectorText(body.text);
  sendSuccess(res, "Text cleaned successfully", { text: result });
});

export const classifyTextHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { text?: unknown } | undefined;

  if (!body || typeof body.text !== "string") {
    return sendError(res, "text is required", 400, "Missing or invalid text");
  }

  const result = await classifyCollectorText(body.text);
  sendSuccess(res, "Text classified successfully", { label: result });
});

export const runPibRssCollector = asyncHandler(async (_req: Request, res: Response) => {
  const result = await runPibRssCollection();
  sendSuccess(res, "PIB RSS collection completed", result);
});

export const runEmploymentRssCollector = asyncHandler(async (_req: Request, res: Response) => {
  const result = await runEmploymentRssCollection();
  sendSuccess(res, "Employment RSS collection completed", result);
});

export const runGenericRssCollectorHandler = asyncHandler(async (req: Request, res: Response) => {
  const sourceName = decodeURIComponent(String(req.params.sourceName));
  const result = await runGenericRssCollection(sourceName);
  sendSuccess(res, `${sourceName} RSS collection completed`, result);
});

export const runAllRssCollectorsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const result = await runAllRssCollectorsService();
  sendSuccess(res, "All RSS collectors completed", result);
});

export const runWebsiteScraperHandler = asyncHandler(async (req: Request, res: Response) => {
  const sourceName = decodeURIComponent(String(req.params.sourceName));
  const result = await runWebsiteScraper(sourceName);
  sendSuccess(res, `${sourceName} scraping completed`, result);
});

export const runPdfExtractorHandler = asyncHandler(async (req: Request, res: Response) => {
  const { pdfUrl, sourceName } = req.body as { pdfUrl?: string; sourceName?: string };
  const result = await runPdfExtractor(pdfUrl ?? "", sourceName ?? "");
  sendSuccess(res, "PDF extraction completed", result);
});

export const runAllCollectorsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const result = await runAllCollectors();
  sendSuccess(res, "All collectors completed", result);
});
