import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { safeOriginFromUrl, safeRedirectPath } from "@/lib/auth/safe-origin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

const backendApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001/api";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function authDebug(message: string, data?: Record<string, string>) {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[auth/callback] ${message}`, data ?? {});
  }
}

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

  const { data: exchangeData, error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const isStateError =
      error.message.toLowerCase().includes("state") ||
      error.message.toLowerCase().includes("pkce");

    authDebug("callback exchange failed", {
      message: error.message,
      isStateError: String(isStateError),
    });

    const errorCode = isStateError
      ? "bad_oauth_state"
      : "oauth_exchange_failed";

    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  const accessToken = exchangeData.session?.access_token;
  let destination = "/profile/setup";

  if (accessToken) {
    try {
      authDebug("callback profile check started", {
        backendUrl: backendApiUrl,
      });

      const profileResponse = await fetch(`${backendApiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (profileResponse.ok) {
        const payload = await profileResponse.json();

        const profileCompleted =
          payload?.data?.profile_completed === true ||
          payload?.data?.profile_completed === "true";

        authDebug("callback profile check response", {
          email: payload?.data?.email ?? "unknown",
          profileCompleted: String(payload?.data?.profile_completed),
        });

        if (profileCompleted) {
          destination = "/dashboard";
        }
      } else {
        authDebug("callback profile check failed", {
          status: String(profileResponse.status),
        });
      }
    } catch (callbackError) {
      authDebug("callback profile check error", {
        error:
          callbackError instanceof Error
            ? callbackError.message
            : String(callbackError),
      });
    }
  }

  const safeNext = safeRedirectPath(nextParam);
  const finalDestination = safeNext ?? destination;
  const finalResponse = NextResponse.redirect(`${origin}${finalDestination}`);

  cookiesToApply.forEach(({ name, value, options }) => {
    finalResponse.cookies.set(name, value, options);
  });

  authDebug("callback success", {
    origin,
    destination: finalDestination,
  });

  return finalResponse;
}