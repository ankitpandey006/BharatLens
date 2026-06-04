# Features

Feature modules for BharatLens. Each folder should own types, services, and (later) API integration.

| Module | Status |
|--------|--------|
| `auth/` | Supabase client auth; server actions TODO in `authService.ts` |
| `jobs/`, `schemes/`, `scholarships/`, `exams/` | Backend API wired through `lib/api/content-api.ts` |
| `profile/`, `saved/`, `notifications/` | Backend and Supabase integration in progress |

**Current data source:** backend API endpoints via `lib/api/*`; dummy data sources have been removed.
