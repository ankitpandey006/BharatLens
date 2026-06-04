/**
 * Clear Supabase auth keys from browser storage after sign-out.
 * Helps avoid stale PKCE / session state causing bad_oauth_state.
 */
export function clearSupabaseAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const storages: Storage[] = [window.localStorage, window.sessionStorage];

  for (const storage of storages) {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key) {
        continue;
      }

      if (key.startsWith("sb-") || key.includes("supabase.auth")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  }
}
