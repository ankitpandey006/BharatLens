import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "./env";

if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
}

const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

if (env.NODE_ENV === "development") {
  const serviceRoleKeyPrefix = `${env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 4)}...`;

  console.debug("[Supabase] URL exists:", env.SUPABASE_URL);
  console.debug("[Supabase] service role key exists:", serviceRoleKeyPrefix);
  console.debug("[Supabase] backend uses service role key only; not exposed to frontend.");
}

export { supabase };