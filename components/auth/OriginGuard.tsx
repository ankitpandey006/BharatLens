"use client";

import { useEffect } from "react";
import { ensureSafeBrowserOrigin } from "@/lib/auth/safe-origin";

/**
 * Redirects browser away from http://0.0.0.0:* before OAuth can start.
 * Binding to 0.0.0.0 in `next dev` is fine; browsing that URL breaks PKCE state.
 */
export function OriginGuard() {
  useEffect(() => {
    ensureSafeBrowserOrigin();
  }, []);

  return null;
}
