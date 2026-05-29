const INVALID_PUBLIC_HOSTS = new Set(["0.0.0.0", "[::]", "::"]);

const DEFAULT_DEV_PORT = "3000";
const LAPTOP_FALLBACK_ORIGIN = `http://localhost:${DEFAULT_DEV_PORT}`;

function isInvalidPublicHost(hostname: string): boolean {
  return INVALID_PUBLIC_HOSTS.has(hostname);
}

function localhostOrigin(port: string): string {
  return `http://localhost:${port || DEFAULT_DEV_PORT}`;
}

/**
 * Normalize a URL origin for redirects and OAuth.
 * 0.0.0.0 is a bind address only — browsers must use localhost or a real LAN IP.
 */
export function safeOriginFromUrl(url: string | URL): string {
  const parsed = typeof url === "string" ? new URL(url) : url;

  if (isInvalidPublicHost(parsed.hostname)) {
    return localhostOrigin(parsed.port);
  }

  return parsed.origin;
}

/**
 * Browser-safe origin for client-side redirectTo and navigation.
 */
export function safeOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const { hostname, port, origin } = window.location;

  if (isInvalidPublicHost(hostname)) {
    return localhostOrigin(port);
  }

  return origin;
}

/**
 * Default site origin for laptop dev (env override optional).
 */
export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return safeOrigin();
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    LAPTOP_FALLBACK_ORIGIN
  );
}

/**
 * If the user opened 0.0.0.0 in the browser, move them to localhost
 * before OAuth so PKCE state and callback share the same origin.
 */
export function ensureSafeBrowserOrigin(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isInvalidPublicHost(window.location.hostname)) {
    return;
  }

  const port = window.location.port || DEFAULT_DEV_PORT;
  const target = `${localhostOrigin(port)}${window.location.pathname}${window.location.search}${window.location.hash}`;

  window.location.replace(target);
}

/**
 * Only allow same-app relative paths (prevents open redirects).
 */
export function safeRedirectPath(
  path: string | null | undefined,
): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  if (path.includes("://") || path.includes("0.0.0.0")) {
    return null;
  }

  return path;
}

export function buildAbsoluteUrl(path: string, origin?: string): string {
  const base = origin ?? getSiteOrigin();
  const safePath = safeRedirectPath(path) ?? "/";
  return `${safeOriginFromUrl(base)}${safePath}`;
}
