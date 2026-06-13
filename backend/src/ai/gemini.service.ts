/**
 * Gemini AI Service
 *
 * Reusable backend service for AI-powered classification and data extraction
 * using the @google/genai SDK (Gemini API).
 *
 * Features:
 * - Uses GEMINI_API_KEY and GEMINI_MODEL from env
 * - Default model: gemini-2.5-flash
 * - Safe error handling with timeouts
 * - Falls back to rule-based classification when Gemini fails/disables
 * - Never exposed to frontend — backend-only
 */

import { env } from "../config/env";
import { cleanText } from "./data-cleaner.service";
import { classifyText, type ClassificationLabel } from "./classifier.service";

// ============================================================
// Types
// ============================================================

export interface AiExtractionResult {
  classification: ClassificationLabel;
  confidence: number; // 0-100
  extracted: {
    title: string | null;
    summary: string | null;
    category: string | null;
    item_type: string | null;
    eligibility: string | null;
    age_limit: string | null;
    income_limit: string | null;
    education_level: string | null;
    state: string | null;
    deadline: string | null;
    documents_required: string | null;
    keywords: string[];
    official_url: string | null;
  };
  raw_response: string | null;
  fallback_used: boolean;
}

// ============================================================
// Gemini API Client using @google/genai
// ============================================================

const DEFAULT_MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 20_000;

/**
 * Call Gemini via @google/genai SDK with a text prompt.
 * Returns null on any failure (error, timeout, disabled key, 429 rate limit).
 * Handles 429 errors by returning a special signal so callers can retry.
 */
interface GeminiSdkResult {
  text: string | null;
  rateLimited: boolean;
  retryDelayMs?: number;
}

async function callGeminiSdk(prompt: string): Promise<GeminiSdkResult> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return { text: null, rateLimited: false };
  }

  const modelName = env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const result = await Promise.race([
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini request timed out")), TIMEOUT_MS),
      ),
    ]);

    const text = result?.text ?? null;
    return { text, rateLimited: false };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn("[gemini] SDK call failed:", errMsg);

    // Detect 429 rate limit errors
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
      return { text: null, rateLimited: true, retryDelayMs: 20_000 };
    }

    return { text: null, rateLimited: false };
  }
}

// ============================================================
// Prompt building
// ============================================================

function buildExtractionPrompt(title: string, content: string): string {
  return `You are an AI assistant for BharatLens, a platform that collects government schemes, scholarships, jobs, exams, and notifications.

Analyze the following government-related content and extract structured information.

Title: ${title}
Content: ${content.slice(0, 3000)}

Rules:
- Do not invent missing data.
- Missing fields must be null or empty array.
- Output must be valid JSON only, no markdown formatting.
- Category should be a broad category like "Education", "Agriculture", "Health", "Employment", "Finance", "Social Welfare", "Housing", "Infrastructure", etc. Use null if unclear.
- item_type must be one of: scheme, scholarship, job, exam, notification

Respond in this exact JSON format:
{
  "classification": "scheme|scholarship|job|exam|notification",
  "confidence": 85,
  "title": "Extracted clean title or null",
  "summary": "Brief 1-2 sentence summary or null",
  "category": "Broad category or null",
  "item_type": "scheme|scholarship|job|exam|notification",
  "eligibility": "Eligibility criteria or null",
  "age_limit": "Age limit if mentioned or null",
  "income_limit": "Income limit if mentioned or null",
  "education_level": "Required education or null",
  "state": "State/region or null",
  "deadline": "Last date/deadline in YYYY-MM-DD format or null",
  "documents_required": "Documents required or null",
  "keywords": ["keyword1", "keyword2"],
  "official_url": "Official URL if mentioned or null"
}`;
}

// ============================================================
// Parse Gemini JSON response
// ============================================================

/**
 * Clean Gemini response text and extract JSON safely.
 * Handles markdown code blocks, leading/trailing text, and escaped characters.
 */
function cleanAndParseJson(rawText: string): Record<string, unknown> | null {
  let cleaned = rawText.trim();

  // Remove markdown code block fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");
  cleaned = cleaned.trim();

  // Find first '{' and last '}' to extract JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    // Try to fix common issues
    try {
      // Replace single quotes with double quotes (common Gemini mistake)
      cleaned = cleaned.replace(/'/g, '"');
      // Remove trailing commas
      cleaned = cleaned.replace(/,([\s\n]*(?:]|}))/g, "$1");
      return JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

// ============================================================
// Fallback: rule-based extraction
// ============================================================

export function fallbackExtraction(
  title: string,
  content: string,
  classification: ClassificationLabel,
): AiExtractionResult {
  const normalizedContent = cleanText(`${title} ${content}`).toLowerCase();

  let deadline: string | null = null;
  const deadlineMatch = normalizedContent.match(
    /(?:last date|deadline|closing date|application deadline|last day)[:\s]*(\d{1,2}[\s/-]\d{1,2}[\s/-]\d{2,4})/i,
  );
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
  }

  let state: string | null = null;
  const indianStates = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand",
    "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur",
    "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
    "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura",
    "uttar pradesh", "uttarakhand", "west bengal",
  ];
  for (const st of indianStates) {
    if (normalizedContent.includes(st)) {
      state = st.replace(/\b\w/g, (c) => c.toUpperCase());
      break;
    }
  }
  if (!state && normalizedContent.includes("all india")) {
    state = "All India";
  }

  let officialUrl: string | null = null;
  const urlMatch = content.match(
    /https?:\/\/[^\s"']*(?:apply|register|application|form|online)[^\s"']*/i,
  );
  if (urlMatch) {
    officialUrl = urlMatch[0];
  }

  return {
    classification,
    confidence: 60,
    extracted: {
      title: cleanText(title) || null,
      summary: content ? cleanText(content).slice(0, 500) || null : null,
      category: null,
      item_type: classification === "unknown" ? null : classification,
      eligibility: null,
      age_limit: null,
      income_limit: null,
      education_level: null,
      state,
      deadline,
      documents_required: null,
      keywords: [classification].filter(Boolean) as string[],
      official_url: officialUrl,
    },
    raw_response: null,
    fallback_used: true,
  };
}

// ============================================================
// Extract keywords from text
// ============================================================

function extractKeywords(title: string, content: string, classification: string): string[] {
  const keywords = new Set<string>();
  keywords.add(classification);

  const text = `${title} ${content}`.toLowerCase();
  const commonKeywords = [
    "scheme", "yojana", "subsidy", "scholarship", "fellowship", "grant",
    "recruitment", "vacancy", "job", "exam", "admit card", "result",
    "notification", "last date", "deadline", "application", "online",
    "government", "central", "state", "benefit", "eligible", "apply",
  ];

  for (const kw of commonKeywords) {
    if (text.includes(kw)) {
      keywords.add(kw);
    }
  }

  return Array.from(keywords).slice(0, 10);
}

// ============================================================
// Main AI Classification Function
// ============================================================

/**
 * Process content through Gemini AI with fallback to rule-based.
 *
 * @param rawTitle - Raw title from collector
 * @param rawContent - Raw content from collector
 * @returns Structured extraction with classification, confidence, extracted fields
 */
export async function aiClassifyAndExtract(
  rawTitle: string,
  rawContent: string,
): Promise<AiExtractionResult> {
  const title = cleanText(rawTitle || "");
  const content = cleanText(rawContent || "");

  const apiKey = env.GEMINI_API_KEY;
  if (apiKey) {
    const prompt = buildExtractionPrompt(title, content);
    let sdkResult = await callGeminiSdk(prompt);

    // If rate limited, wait and retry once
    if (sdkResult.rateLimited && sdkResult.retryDelayMs) {
      console.warn(`[gemini] Rate limited (429), waiting ${sdkResult.retryDelayMs}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, sdkResult.retryDelayMs));
      sdkResult = await callGeminiSdk(prompt);
    }

    if (sdkResult.rateLimited) {
      console.warn("[gemini] Still rate limited after retry, falling back to rule-based extraction");
    } else if (sdkResult.text) {
      const parsed = cleanAndParseJson(sdkResult.text);
      if (parsed && typeof parsed.classification === "string") {
        const validTypes = ["scheme", "scholarship", "job", "exam", "notification"];
        const classification = validTypes.includes(parsed.classification)
          ? (parsed.classification as ClassificationLabel)
          : classifyText(`${title} ${content}`);

        return {
          classification,
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence ?? 70))),
          extracted: {
            title: typeof parsed.title === "string" ? cleanText(parsed.title) || null : null,
            summary: typeof parsed.summary === "string" ? cleanText(parsed.summary) || null : null,
            category: typeof parsed.category === "string" ? parsed.category.trim() || null : null,
            item_type: typeof parsed.item_type === "string" ? parsed.item_type.trim() || null : classification,
            eligibility: typeof parsed.eligibility === "string" ? cleanText(parsed.eligibility) || null : null,
            age_limit: typeof parsed.age_limit === "string" ? parsed.age_limit.trim() || null : null,
            income_limit: typeof parsed.income_limit === "string" ? parsed.income_limit.trim() || null : null,
            education_level: typeof parsed.education_level === "string" ? parsed.education_level.trim() || null : null,
            state: typeof parsed.state === "string" ? parsed.state.trim() || null : null,
            deadline: typeof parsed.deadline === "string" ? parsed.deadline.trim() || null : null,
            documents_required: typeof parsed.documents_required === "string" ? parsed.documents_required.trim() || null : null,
            keywords: Array.isArray(parsed.keywords)
              ? (parsed.keywords as string[]).filter((k): k is string => typeof k === "string").slice(0, 10)
              : extractKeywords(title, content, classification),
            official_url: typeof parsed.official_url === "string" ? parsed.official_url.trim() || null : null,
          },
          raw_response: sdkResult.text.slice(0, 2000),
          fallback_used: false,
        };
      }
    }

    console.warn("[gemini] API returned unparseable response, falling back to rule-based");
  }

  const classification = classifyText(`${title} ${content}`);
  return fallbackExtraction(title, content, classification);
}
