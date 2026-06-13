/**
 * AI Chat Service
 *
 * Phase 4: Handles user questions about government schemes, scholarships,
 * jobs, exams, eligibility, documents, deadlines, and application steps.
 *
 * - Profile-aware: uses authenticated user profile for personalized answers.
 * - If profile is missing key fields, asks user to fill only those.
 * - If profile has enough data, gives direct personalized answer.
 * - Searches verified BharatLens database for relevant content.
 * - Uses Gemini with database context + user profile if available.
 * - Falls back to database-only response on Gemini quota/error.
 * - Never exposes Gemini API key to frontend.
 * - If not logged in → generic chatbot mode (asks basic details when needed).
 */

import { env } from "../config/env";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "../config/supabase";

// ============================================================
// Constants
// ============================================================

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_MESSAGE_LENGTH = 1500;
const TIMEOUT_MS = 20_000;
const MAX_DB_RESULTS = 5;

// System instruction base (for unauthenticated users — generic mode)
const SYSTEM_INSTRUCTION = `You are BharatLens AI assistant. Help users understand Indian government schemes, scholarships, jobs, exams, eligibility, documents, deadlines, and application steps. Reply in simple Hinglish.

IMPORTANT RULES:
- Only use the verified database information provided in the context below.
- Always cite the official URL (sarkari website link) when available.
- If the database context has no relevant information, say: "BharatLens ke verified database mein yeh data currently available nahi hai."
- Never make up or hallucinate scheme/job/scholarship names, deadlines, or URLs.
- Tell user to check official URL for final confirmation.`;

/**
 * Profile-aware system instruction.
 * Tells Gemini to use the user profile as source of truth and avoid asking
 * for details the user has already provided.
 */
function buildProfileAwareInstruction(profile: ChatUserProfile): string {
  // Build a clean profile summary for the AI
  const profileSummary: Record<string, string | number | null | undefined> = {};
  if (profile.age) profileSummary.age = profile.age;
  if (profile.state) profileSummary.state = profile.state;
  if (profile.category) profileSummary.category = profile.category;
  if (profile.education_level) profileSummary.education_level = profile.education_level;
  if (profile.occupation) profileSummary.occupation = profile.occupation;
  if (profile.user_type) profileSummary.user_type = profile.user_type;
  if (profile.annual_income) profileSummary.annual_income = profile.annual_income;
  if (profile.income_range) profileSummary.income_range = profile.income_range;
  if (profile.gender) profileSummary.gender = profile.gender;
  if (profile.preferred_language) profileSummary.preferred_language = profile.preferred_language;

  return `You are BharatLens AI assistant. Help users with Indian government schemes, scholarships, jobs, exams, and eligibility.

USER PROFILE (this is the source of truth for the user's personal details):
${JSON.stringify(profileSummary, null, 2)}

IMPORTANT RULES:
- Use the USER PROFILE above as the source of truth. Do NOT ask the user for details that already exist in this profile.
- If the user asks about schemes and the profile has state/category → suggest schemes matching those attributes.
- If the user asks about scholarships and the profile has education_level/category → suggest matching scholarships.
- If the user asks about jobs and the profile has education_level/state → suggest matching jobs.
- If the user asks about exams and the profile has education_level/category → suggest matching exams.
- If the user asks about eligibility → compare profile with item eligibility rules and explain.
- Only use the verified database information provided in the context below.
- Always cite the official URL when available.
- Never make up scheme/job/scholarship names, deadlines, or URLs.
- Reply in the user's preferred language if available (preferred_language in profile), otherwise use simple Hinglish.
- If the database context has no relevant information, say it's not available in the BharatLens database.
- Tell user to check official URL for final confirmation.`;
}

// ============================================================
// Types
// ============================================================

export interface ChatResult {
  reply: string;
  fallbackUsed: boolean;
}

/** Subset of user profile fields relevant for AI chat context */
export interface ChatUserProfile {
  id: string;
  age?: number | null;
  state?: string | null;
  category?: string | null;
  education_level?: string | null;
  occupation?: string | null;
  user_type?: string | null;
  annual_income?: number | null;
  income_range?: string | null;
  gender?: string | null;
  preferred_language?: string | null;
}

interface DbSearchResult {
  type: string;
  items: Array<{
    title: string;
    description: string;
    official_url: string | null;
    deadline: string | null;
    eligibility: string | null;
    state: string | null;
    category: string | null;
  }>;
}

interface EligibilityRule {
  item_id: string;
  item_type: string;
  min_age?: number | null;
  max_age?: number | null;
  income_threshold?: number | null;
  state?: string | null;
  category?: string | null;
  gender?: string | null;
  education_level?: string | null;
  occupation?: string | null;
}

interface RecommendationRow {
  id: string;
  item_id: string;
  item_type: string;
  title?: string;
  description?: string;
  match_score: number;
  reason: string;
}

// ─── Intent detection ─────────────────────────────────────

/** Detect what the user is asking about from their message */
function detectIntents(message: string): string[] {
  const lower = message.toLowerCase().trim();
  const intents: string[] = [];

  if (lower.includes("scheme") || lower.includes("yojana") || lower.includes("subsidy") || lower.includes("benefit")) {
    intents.push("scheme");
  }
  if (lower.includes("scholarship") || lower.includes("fellowship") || lower.includes("grant")) {
    intents.push("scholarship");
  }
  if (lower.includes("job") || lower.includes("recruitment") || lower.includes("vacancy") || lower.includes("naukri") || lower.includes("career")) {
    intents.push("job");
  }
  if (lower.includes("exam") || lower.includes("pariksha") || lower.includes("admit") || lower.includes("result") || lower.includes("notification")) {
    intents.push("exam");
  }
  if (lower.includes("eligibility") || lower.includes("eligible") || lower.includes("qualify") || lower.includes("kya main") || lower.includes("pata karo")) {
    intents.push("eligibility");
  }

  // Default: general query — use all intents
  if (intents.length === 0) {
    return ["general"];
  }

  return intents;
}

/** Required fields that the AI MUST have before recommending */
const REQUIRED_FIELDS: Record<string, string[]> = {
  scheme: ["state", "category"],
  scholarship: ["education_level", "category"],
  job: ["education_level", "state"],
  exam: ["education_level"],
  eligibility: ["age", "state", "education_level", "occupation"],
};

/** Helpful optional fields that improve recommendation quality */
const HELPFUL_FIELDS: Record<string, string[]> = {
  scheme: ["income_range", "occupation", "age", "gender"],
  scholarship: ["income_range", "state", "age"],
  job: ["age", "category", "occupation"],
  exam: ["age", "category", "state"],
  eligibility: ["category", "income_range", "annual_income", "gender", "user_type"],
};

/**
 * Check which profile fields are missing for the given intents.
 * Returns categorized missing fields per intent.
 */
function findMissingFields(
  profile: ChatUserProfile,
  intents: string[],
): { intent: string; missingRequired: string[]; missingHelpful: string[] }[] {
  const result: Array<{ intent: string; missingRequired: string[]; missingHelpful: string[] }> = [];

  for (const intent of intents) {
    if (intent === "general") continue; // General intents don't need profile

    const required = REQUIRED_FIELDS[intent] ?? [];
    const helpful = HELPFUL_FIELDS[intent] ?? [];

    const missingRequired = required.filter((f) => {
      const val = (profile as unknown as Record<string, unknown>)[f];
      return val === null || val === undefined || val === "";
    });

    const missingHelpful = helpful.filter((f) => {
      const val = (profile as unknown as Record<string, unknown>)[f];
      return val === null || val === undefined || val === "";
    });

    if (missingRequired.length > 0 || missingHelpful.length > 0) {
      result.push({ intent, missingRequired, missingHelpful });
    }
  }

  return result;
}

/** Human-readable field label in Hindi/English */
function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    state: "state/राज्य",
    category: "category/जाति श्रेणी",
    education_level: "education level/शिक्षा स्तर",
    occupation: "occupation/व्यवसाय",
    age: "age/आयु",
    income_range: "income range/आय सीमा",
    annual_income: "annual income/वार्षिक आय",
    gender: "gender/लिंग",
    user_type: "user type/उपयोगकर्ता प्रकार",
  };
  return labels[field] ?? field;
}

/** Build a response that asks the user for missing profile fields */
function buildMissingFieldsResponse(
  profile: ChatUserProfile,
  missing: Array<{ intent: string; missingRequired: string[]; missingHelpful: string[] }>,
): string {
  const presentFields: string[] = [];
  if (profile.state) presentFields.push(fieldLabel("state"));
  if (profile.category) presentFields.push(fieldLabel("category"));
  if (profile.education_level) presentFields.push(fieldLabel("education_level"));
  if (profile.occupation) presentFields.push(fieldLabel("occupation"));
  if (profile.age) presentFields.push(fieldLabel("age"));

  const allMissing = new Set<string>();
  for (const m of missing) {
    for (const f of m.missingRequired) allMissing.add(f);
  }

  const missingLabels = Array.from(allMissing).map(fieldLabel);

  const hasAnyProfile = presentFields.length > 0;

  if (hasAnyProfile) {
    return (
      `Maine aapke profile se ${presentFields.join(", ")} le liya hai. ` +
      `Accurate recommendation ke liye kripya ${missingLabels.join(", ")} apne profile mein add karein. ` +
      `Settings > My Profile mein jaakar update kar sakte hain.`
    );
  }

  return (
    `Aapko personalized recommendations dene ke liye kripya apne profile mein ${missingLabels.join(", ")} ` +
      `add karein. Settings > My Profile mein jaakar update kar sakte hain.`
  );
}

// ============================================================
// Database Search
// ============================================================

/**
 * Search the verified BharatLens database for relevant content.
 * Searches across schemes, scholarships, jobs, and exams tables.
 * Only returns published/verified items.
 */
async function searchDatabase(message: string, profile?: ChatUserProfile): Promise<DbSearchResult[]> {
  const lower = message.toLowerCase().trim();
  const results: DbSearchResult[] = [];
  const intents = detectIntents(message);

  const searchSchemes = intents.includes("scheme") || intents.includes("general");
  const searchScholarships = intents.includes("scholarship") || intents.includes("general");
  const searchJobs = intents.includes("job") || intents.includes("general");
  const searchExams = intents.includes("exam") || intents.includes("general");

  const tablesToSearch: Array<{ key: string; table: string; titleField: string; urlField: string }> = [];

  if (searchSchemes) {
    tablesToSearch.push({ key: "scheme", table: "schemes", titleField: "title", urlField: "official_url" });
  }
  if (searchScholarships) {
    tablesToSearch.push({ key: "scholarship", table: "scholarships", titleField: "title", urlField: "official_url" });
  }
  if (searchJobs) {
    tablesToSearch.push({ key: "job", table: "jobs", titleField: "title", urlField: "official_url" });
  }
  if (searchExams) {
    tablesToSearch.push({ key: "exam", table: "exams", titleField: "title", urlField: "official_url" });
  }

  // If user has a profile, also fetch their recommendations and eligibility_rules
  const profileState = profile?.state ?? null;
  const profileCategory = profile?.category ?? null;
  const profileEducation = profile?.education_level ?? null;

  // Also fetch eligibility_rules for eligibility queries
  if (intents.includes("eligibility")) {
    try {
      const { data: rules } = await supabase.from("eligibility_rules").select("*").limit(100);
      if (rules && rules.length > 0) {
        results.push({
          type: "eligibility_rules",
          items: rules.slice(0, MAX_DB_RESULTS).map((rule: any) => ({
            title: `Eligibility Rule: ${rule.item_type} (${rule.item_id})`,
            description: `Min Age: ${rule.min_age ?? "N/A"}, Max Age: ${rule.max_age ?? "N/A"}, Income Threshold: ${rule.income_threshold ?? "N/A"}, State: ${rule.state ?? "Any"}, Category: ${rule.category ?? "General"}, Gender: ${rule.gender ?? "Any"}, Education: ${rule.education_level ?? "Any"}, Occupation: ${rule.occupation ?? "Any"}`,
            official_url: null,
            deadline: null,
            eligibility: null,
            state: rule.state ?? null,
            category: rule.category ?? null,
          })),
        });
      }
    } catch (err) {
      console.warn("[chat] Failed to fetch eligibility_rules:", err);
    }
  }

  // Fetch existing recommendations for this user if profile is available
  const profileUserId = profile?.id;
  if (profileUserId) {
    try {
      // Fetch recommendations matching the user's query intents
      for (const intent of intents) {
        if (intent === "general" || intent === "eligibility") continue;

        const itemType = intent === "scheme" ? "scheme" :
                         intent === "scholarship" ? "scholarship" :
                         intent === "job" ? "job" :
                         intent === "exam" ? "exam" : null;

        if (!itemType) continue;

        const { data: recs } = await supabase
          .from("recommendations")
          .select("*")
          .eq("user_id", profileUserId)
          .eq("item_type", itemType)
          .order("match_score", { ascending: false })
          .limit(MAX_DB_RESULTS);

        if (recs && recs.length > 0) {
          // Enrich with title/description from the item table
          const tableName = itemType === "scheme" ? "schemes" :
                            itemType === "scholarship" ? "scholarships" :
                            itemType === "job" ? "jobs" : "exams";

          const enrichedItems = await Promise.all(
            recs.slice(0, MAX_DB_RESULTS).map(async (rec: any) => {
              const { data: itemData } = await supabase
                .from(tableName)
                .select("title, description, official_url, deadline, state, category")
                .eq("id", rec.item_id)
                .maybeSingle();

              return {
                title: itemData?.title ?? `Recommended ${intent}`,
                description: `Match Score: ${rec.match_score}% — ${rec.reason ?? ""}. ${itemData?.description ?? ""}`,
                official_url: itemData?.official_url ?? null,
                deadline: itemData?.deadline ?? null,
                eligibility: null,
                state: itemData?.state ?? null,
                category: itemData?.category ?? null,
              };
            }),
          );

          if (enrichedItems.length > 0) {
            results.push({ type: `${intent}_recommendation`, items: enrichedItems });
          }
        }
      }
    } catch (err) {
      console.warn("[chat] Failed to fetch recommendations:", err);
    }
  }

  for (const { key, table, titleField, urlField } of tablesToSearch) {
    try {
      const words = lower
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .filter((w) => !["the", "for", "and", "are", "can", "you", "what", "which", "how", "get", "any", "all", "not", "but", "its", "has", "had", "was", "were", "will", "would", "could", "should", "about", "there", "their", "they"].includes(w))
        .slice(0, 5);

      let query = supabase
        .from(table)
        .select("*")
        .eq("status", "active")
        .eq("verification_status", "published");

      // Profile-aware filtering: if user has state, prefer items matching their state
      if (profileState && (key === "scheme" || key === "job")) {
        query = query.or(`state.eq.${profileState},state.is.null,state.eq.All India`);
      }
      if (profileCategory && (key === "scheme" || key === "scholarship")) {
        query = query.or(`category.eq.${profileCategory},category.is.null,category.eq.General`);
      }
      if (profileEducation && (key === "job" || key === "exam")) {
        const educationPattern = `%${profileEducation}%`;
        query = query.or(`qualification.ilike.${educationPattern},eligibility.ilike.${educationPattern}`);
      }

      if (words.length > 0) {
        const searchConditions = words
          .map((w) => `${titleField}.ilike.%${w}%,description.ilike.%${w}%`)
          .join(",");
        query = query.or(searchConditions);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(MAX_DB_RESULTS);

      if (!error && data && data.length > 0) {
        results.push({
          type: key,
          items: data.map((item: any) => ({
            title: item[titleField] || item.exam_name || "",
            description: item.description || item.eligibility || "",
            official_url: item[urlField] || item.apply_url || null,
            deadline: item.deadline || item.application_end_date || null,
            eligibility: item.eligibility || null,
            state: item.state || null,
            category: item.category || null,
          })),
        });
      }
    } catch (err) {
      console.warn(`[chat] DB search failed for ${table}:`, err);
    }
  }

  return results;
}

// ============================================================
// Formatting
// ============================================================

/**
 * Format database results into a readable text for the AI context.
 */
function formatDbResponse(results: DbSearchResult[]): string {
  if (results.length === 0) {
    return "";
  }

  const parts: string[] = [];

  for (const result of results) {
    // Handle recommendation types like "scheme_recommendation" → "scheme"
    const baseType = result.type.replace("_recommendation", "");
    const typeLabel =
      baseType === "scheme" ? "Schemes" :
      baseType === "scholarship" ? "Scholarships" :
      baseType === "job" ? "Jobs" :
      "Exams";      if (result.type.endsWith("_recommendation")) {
        // For recommendations, show a special header
        parts.push(`\n⭐ **Personalized ${typeLabel} (AI Recommended):**\n`);
      } else if (result.type === "eligibility_rules") {
        parts.push(`\n📋 **Eligibility Rules:**\n`);
      } else {
        parts.push(`\n📋 **${typeLabel}:**\n`);
      }

    for (const item of result.items) {
      parts.push(`**${item.title}**`);
      if (item.description) parts.push(`  ${item.description.slice(0, 200)}`);
      if (item.eligibility) parts.push(`  Eligibility: ${item.eligibility.slice(0, 150)}`);
      if (item.deadline) parts.push(`  Deadline: ${item.deadline}`);
      if (item.state) parts.push(`  State: ${item.state}`);
      if (item.category) parts.push(`  Category: ${item.category}`);
      if (item.official_url) parts.push(`  Official Link: ${item.official_url}`);
      parts.push("");
    }
  }

  return parts.join("\n");
}

// ============================================================
// Gemini Chat
// ============================================================

/**
 * Call Gemini with database context + optional user profile.
 */
async function callGeminiChat(
  message: string,
  dbContext: string,
  profile?: ChatUserProfile,
): Promise<ChatResult | null> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const modelName = env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Choose instruction based on whether we have a user profile
    const instruction = profile ? buildProfileAwareInstruction(profile) : SYSTEM_INSTRUCTION;

    const contextParts: string[] = [];
    if (dbContext) {
      contextParts.push(`BharatLens Verified Database Context:\n${dbContext}`);
    }
    contextParts.push(`User Question: ${message}`);

    const fullPrompt = contextParts.join("\n\n");

    const result = await Promise.race([
      ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
        config: {
          systemInstruction: instruction,
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini request timed out")), TIMEOUT_MS),
      ),
    ]);

    const text = result?.text ?? null;
    if (text && text.trim()) {
      return { reply: text.trim(), fallbackUsed: false };
    }

    return null;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn("[chat] Gemini call failed:", errMsg);

    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
      console.warn("[chat] Gemini quota exhausted, using database-only response");
    }

    return null;
  }
}

// ============================================================
// Database-Only Response (when Gemini is unavailable)
// ============================================================

function buildDbOnlyResponse(results: DbSearchResult[], message: string): string {
  if (results.length === 0) {
    return "BharatLens ke verified database mein aapke sawaal se related data currently available nahi hai. Kripya dobara kisi aur tarah se poochhein ya hamari website par browse karein.";
  }

  const dbResponse = formatDbResponse(results);

  return dbResponse + "\n\n⚠️ Yeh information BharatLens verified database se hai. Apply karne se pehle official website par final confirmation zaroor check karein.";
}

function noDataFallback(message: string): ChatResult {
  return {
    reply:
      "BharatLens ke verified database mein aapke sawaal se related data currently available nahi hai. " +
      "Aap hamari website par jaakar Schemes, Scholarships, Jobs, ya Exams sections mein browse kar sakte hain. " +
      "Kripya dobara kisi aur tarah se poochhein.",
    fallbackUsed: true,
  };
}

// ============================================================
// Main Chat Function
// ============================================================

/**
 * Process a user chat message.
 *
 * Flow:
 * 1. If user is authenticated and has profile → check if profile has enough data
 *    for the query type. If missing → ask for missing fields only.
 * 2. Search verified BharatLens database for relevant content
 * 3. Try Gemini with database context + user profile
 * 4. Fall back to database-only response if Gemini fails
 *
 * @param message - User message text
 * @param user - Optional authenticated user profile data
 * @returns ChatResult with reply and whether fallback was used
 */
export async function processChatMessage(
  message: string,
  user?: ChatUserProfile | null,
): Promise<ChatResult> {
  // Validate and sanitize input
  const sanitized = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!sanitized) {
    return {
      reply: "Kripya kuch likhiye. Main aapki madad kar sakta hoon schemes, scholarships, jobs aur exams ke baare mein.",
      fallbackUsed: true,
    };
  }

  // Detect what the user is asking about
  const intents = detectIntents(sanitized);

  // ─── Step 1: Profile-aware missing field check ───────────────
  if (user?.id) {
    const missing = findMissingFields(user, intents);

    // If there are required fields missing for personalized recommendation
    const hasMissingRequired = missing.some((m) => m.missingRequired.length > 0);

    if (hasMissingRequired) {
      // Also try DB search so the AI can still provide some info even without profile
      const dbResults = await searchDatabase(sanitized, user);
      const dbContext = formatDbResponse(dbResults);

      const missingMsg = buildMissingFieldsResponse(user, missing);

      // If we have DB results AND Gemini, let Gemini craft a combined response
      if (env.GEMINI_API_KEY) {
        const geminiResult = await callGeminiChat(sanitized, dbContext, user);
        if (geminiResult) {
          // Gemini response already includes the profile-aware instruction
          return geminiResult;
        }
      }

      // Fallback: return database info with missing-field prompt
      if (dbResults.length > 0) {
        return {
          reply: buildDbOnlyResponse(dbResults, sanitized) + "\n\n" + missingMsg,
          fallbackUsed: true,
        };
      }

      return { reply: missingMsg, fallbackUsed: true };
    }
  }

  // ─── Step 2: Search verified database ────────────────────────
  const dbResults = await searchDatabase(sanitized, user ?? undefined);
  const dbContext = formatDbResponse(dbResults);

  // ─── Step 3: Try Gemini with database context + profile ──────
  if (env.GEMINI_API_KEY) {
    const geminiResult = await callGeminiChat(sanitized, dbContext, user ?? undefined);
    if (geminiResult) {
      return geminiResult;
    }
  }

  // ─── Step 4: Database-only fallback ──────────────────────────
  if (dbResults.length > 0) {
    return {
      reply: buildDbOnlyResponse(dbResults, sanitized),
      fallbackUsed: true,
    };
  }

  // ─── Step 5: No data found anywhere ──────────────────────────
  return noDataFallback(sanitized);
}
