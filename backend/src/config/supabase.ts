import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./env";

export function createSupabaseClient(): SupabaseClient {
  return createClient(config.SUPABASE_URL ?? "", config.SUPABASE_ANON_KEY ?? "");
}
