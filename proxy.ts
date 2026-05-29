import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeOriginFromUrl, safeRedirectPath } from "@/lib/auth/safe-origin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

const protectedPrefixes = [
  "/dashboard",
  "/chatbot",
  "/profile",
  "/saved",
  "/notifications",
  "/settings",
  "/jobs",
  "/exams",
  "/schemes",
  "/scholarships",
  "/admin",
];

const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];

const SKIP_AUTH_PATHS = ["/auth/callback"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectToPath(
  request: NextRequest,
  pathname: string,
  searchParams?: Record<string, string>,
) {
  const url = new URL(pathname, safeOriginFromUrl(request.url));

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (SKIP_AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const isProtectedRoute = matchesPrefix(pathname, protectedPrefixes);
  const isAuthPage = matchesPrefix(pathname, authPages);

  if (!isProtectedRoute && !isAuthPage) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedOut = request.nextUrl.searchParams.get("signed_out") === "1";

  if (!user && isProtectedRoute) {
    const safeNext = safeRedirectPath(pathname) ?? pathname;
    return redirectToPath(request, "/login", { next: safeNext });
  }

  if (user && isAuthPage && !signedOut) {
    return redirectToPath(request, "/dashboard");
  }

  if (
    user &&
    isProtectedRoute &&
    !pathname.startsWith("/profile/setup") &&
    !user.user_metadata?.profile_completed
  ) {
    return redirectToPath(request, "/profile/setup");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
