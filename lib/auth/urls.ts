import { authDebug } from "@/lib/auth/debug";
import {
  buildAbsoluteUrl,
  ensureSafeBrowserOrigin,
  getSiteOrigin,
  safeOrigin,
  safeRedirectPath,
} from "@/lib/auth/safe-origin";
import { clearSupabaseAuthStorage } from "@/lib/auth/storage";

export {
  buildAbsoluteUrl,
  ensureSafeBrowserOrigin,
  getSiteOrigin,
  safeOrigin,
  safeRedirectPath,
};

export function getAppOrigin(): string {
  return safeOrigin();
}

export function getAuthCallbackUrl(): string {
  ensureSafeBrowserOrigin();

  const origin = safeOrigin();
  const callbackUrl = `${origin}/auth/callback`;

  authDebug("OAuth redirectTo", { callbackUrl, origin });

  return callbackUrl;
}

export function getResetPasswordUrl(): string {
  ensureSafeBrowserOrigin();

  const origin = safeOrigin();
  const resetUrl = `${origin}/reset-password`;

  authDebug("Password reset redirectTo", { resetUrl, origin });

  return resetUrl;
}

/** Hard navigation after sign-out so proxy/cookies stay in sync (fixes double-click logout). */
export function redirectToLoginAfterSignOut(): void {
  if (typeof window === "undefined") {
    return;
  }

  clearSupabaseAuthStorage();

  const loginUrl = buildAbsoluteUrl("/login?signed_out=1");
  authDebug("Post sign-out redirect", { loginUrl });

  window.location.assign(loginUrl);
}
