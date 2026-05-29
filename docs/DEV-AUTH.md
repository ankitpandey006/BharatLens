# BharatLens local auth / OAuth

## Dev server binding

- `npm run dev` binds to `0.0.0.0` so phones on your LAN can reach the app.
- Next.js may show **Network: http://0.0.0.0:3000** — that URL must **not** be opened in a browser for login.

## Use these URLs

| Device | URL |
|--------|-----|
| Laptop | `http://localhost:3000` |
| Phone (same Wi‑Fi) | `http://<your-lan-ip>:3000` (e.g. `http://10.80.65.239:3000`) |
| Laptop only (no LAN) | `npm run dev:local` → `http://localhost:3000` |

If you open `http://0.0.0.0:3000`, the app redirects to `http://localhost:3000` before OAuth so PKCE state and callback stay on the same origin.

## OAuth / `bad_oauth_state`

Always start and finish Google login on the **same origin** (localhost on laptop, LAN IP on phone). Do not mix `localhost`, `0.0.0.0`, and LAN IP in one login attempt.

## Supabase redirect URLs

Add both laptop and phone patterns in the Supabase dashboard (see project README or deployment docs).
