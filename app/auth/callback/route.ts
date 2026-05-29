import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authDebug } from "@/lib/auth/debug";
import { safeOriginFromUrl, safeRedirectPath } from "@/lib/auth/safe-origin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = safeOriginFromUrl(requestUrl);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");

  authDebug("callback started", {
    origin,
    hasCode: code ? "true" : "false",
  });

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_oauth_code`);
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
  }

  const cookiesToApply: CookieToSet[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookiesToApply.push({ name, value, options });
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const isStateError =
      error.message.toLowerCase().includes("state") ||
      error.message.toLowerCase().includes("pkce");

    authDebug("callback exchange failed", {
      message: error.message,
      isStateError: isStateError ? "true" : "false",
    });

    const errorCode = isStateError ? "bad_oauth_state" : "oauth_exchange_failed";
    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const safeNext = safeRedirectPath(nextParam);
  const destination =
    safeNext ??
    (user?.user_metadata?.profile_completed ? "/dashboard" : "/profile/setup");

  const finalResponse = NextResponse.redirect(`${origin}${destination}`);

  cookiesToApply.forEach(({ name, value, options }) => {
    finalResponse.cookies.set(name, value, options);
  });

  authDebug("callback success", { origin, destination });

  return finalResponse;
}
