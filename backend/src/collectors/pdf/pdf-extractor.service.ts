
import axios from "axios";
import { AppError } from "../../utils/app-error";
import { cleanText } from "../../ai/data-cleaner.service";
import { findSourceByName, existsByRawUrl, insertCollectedData } from "../../repositories/collected-data.repository";
import type { PdfExtractResult } from "../../types/collector.types";
import { collectorConfig } from "../../config/collector.config";

export async function extractPdfDocument(pdfUrl: string, sourceName: string): Promise<PdfExtractResult> {
  if (!pdfUrl || typeof pdfUrl !== "string") {
    throw new AppError("PDF URL is required", 400);
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(pdfUrl);
  } catch {
    throw new AppError("Invalid PDF URL", 400);
  }

  const source = await findSourceByName(sourceName);

  if (!source) {
    throw new AppError(`${sourceName} source not found in sources table`, 404);
  }

  const isDuplicate = await existsByRawUrl(parsedUrl.href);

  if (isDuplicate) {
    return {
      source: source.source_name,
      fetched: 1,
      inserted: 0,
      duplicates: 1,
      failed: 0,
    };
  }

  let response;
  try {
    response = await axios.get<ArrayBuffer>(parsedUrl.href, {
      responseType: "arraybuffer",
      timeout: 20000,
      validateStatus: () => true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to download PDF";
    throw new AppError(`Failed to download PDF: ${msg}`, 502);
  }

  if (!response || (typeof response.status === "number" && response.status >= 400)) {
    const status = response && typeof response.status === "number" ? response.status : "unknown";
    throw new AppError(`PDF unavailable: HTTP ${status}`, 502);
  }

  const buffer = Buffer.from(response.data || "");
  // Dynamically import pdf-parse to handle CJS/ESM interop at runtime
  let parserModule: any;
  try {
    parserModule = await import("pdf-parse");
  } catch (e) {
    // fallback to require for environments that don't support dynamic import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // @ts-ignore
    parserModule = require("pdf-parse");
  }

  // Support both older function export and newer PDFParse class export
  let parsed: { text?: string } | null = null;

  try {
    if (parserModule && typeof parserModule.PDFParse === "function") {
    const ParserClass = parserModule.PDFParse as any;
    const parserInstance = new ParserClass({ data: buffer });
    if (typeof parserInstance.load === "function") {
      await parserInstance.load();
    }
    if (typeof parserInstance.getText === "function") {
      parsed = { text: parserInstance.getText() };
    }
  } else {
    const parserFn = parserModule && (parserModule.default ?? parserModule);
    if (typeof parserFn === "function") {
      parsed = await parserFn(buffer) as { text?: string };
    }
  }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "PDF parsing error";
    throw new AppError(`Failed to parse PDF: ${msg}`, 502);
  }

  if (!parsed) {
    throw new AppError("PDF parser is not available", 500);
  }
  const content = cleanText((parsed as { text?: string }).text || "");

  if (!content) {
    throw new AppError("PDF content extraction returned empty text", 500);
  }

  await insertCollectedData({
    source_id: source.id,
    raw_title: source.source_name,
    raw_content: content,
    raw_url: parsedUrl.href,
    collection_method: "pdf",
    processing_status: "collected",
    collected_at: new Date().toISOString(),
  });

  return {
    source: source.source_name,
    fetched: 1,
    inserted: 1,
    duplicates: 0,
    failed: 0,
  };
}
