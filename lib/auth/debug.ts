/**
 * Development-only auth logging. Never log secrets or tokens.
 */
export function authDebug(
  label: string,
  data?: Record<string, string | boolean | undefined>,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (data) {
    console.info(`[BharatLens auth] ${label}`, data);
  } else {
    console.info(`[BharatLens auth] ${label}`);
  }
}
