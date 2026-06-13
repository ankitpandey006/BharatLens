import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().positive().default(5001),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  DATA_GOV_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  AI_BATCH_LIMIT: z.coerce.number().positive().max(50).default(3),
  GEMINI_REQUEST_DELAY_MS: z.coerce.number().positive().max(60000).default(15000),
  ENABLE_COLLECTOR_CRON: z.coerce.boolean().default(false),
});

type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((err) => `${err.path.map(String).join(".") || "env"}: ${err.message}`)
    .join("; ");
  throw new Error(`Environment validation error: ${details}`);
}

export const env: Env = parsed.data;
