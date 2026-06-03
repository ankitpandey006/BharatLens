import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth/safe-origin";

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

const AUTH_COOKIE_KEY = "bharatlens_auth_token";

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = matchesPrefix(pathname, protectedPrefixes);
  const isAuthPage = matchesPrefix(pathname, authPages);

  if (!isProtectedRoute && !isAuthPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const signedOut = request.nextUrl.searchParams.get("signed_out") === "1";

  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", safeRedirectPath(pathname) ?? pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage && !signedOut) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};