# BharatLens

Monorepo for the BharatLens platform — AI-powered access to Indian government schemes, scholarships, jobs, and exams.

## Structure

```
BharatLens/
├── frontend/     # Next.js 16 + TypeScript (App Router)
└── backend/      # Node.js + Express + TypeScript API
```

Frontend and backend are **independent**. The frontend uses Supabase auth and dummy data until API integration.

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev          # binds 0.0.0.0 for LAN phone testing
npm run dev:local    # localhost only
```

Open [http://localhost:3000](http://localhost:3000) on laptop. See `frontend/docs/DEV-AUTH.md` for OAuth / LAN setup.

```bash
npm run lint
npm run type-check
npm run build
```

### Backend

```bash
cd backend
npm install
npm run dev
```

```bash
npm run lint
npm run type-check
npm run build
```

## Environment

- **Frontend:** `frontend/.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Backend:** `backend/.env` — see `backend/src/config/env.ts`

Do not open `http://0.0.0.0:3000` in a browser for login; use `localhost` or your LAN IP.
