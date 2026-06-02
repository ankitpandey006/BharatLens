import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "./env";

if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket;
}

const supabaseAdminClient: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const supabaseAuthClient: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

if (env.NODE_ENV === "development") {
  const serviceRoleKeyPrefix = `${env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 4)}...`;
  const anonKeyPrefix = `${env.SUPABASE_ANON_KEY.slice(0, 4)}...`;

  console.debug("[Supabase] URL exists:", env.SUPABASE_URL);
  console.debug("[Supabase] service role key exists:", serviceRoleKeyPrefix);
  console.debug("[Supabase] anon key exists:", anonKeyPrefix);
  console.debug("[Supabase] service role key is used only for privileged backend operations.");
}

const supabase = supabaseAdminClient;
const supabaseAuth = supabaseAuthClient;

export { supabase, supabaseAuth, supabaseAdminClient, supabaseAuthClient };
