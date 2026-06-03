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


 <!-- // Backend test API 


http://localhost:5001/
http://localhost:5001/api/health
http://localhost:5001/api/schemes
http://localhost:5001/api/scholarships
http://localhost:5001/api/jobs
http://localhost:5001/api/exams
http://localhost:5001/api/admin/pending -->



Phase 1
Frontend ✅

Phase 2
Backend Architecture ✅

Phase 3
Database Finalization ⏳

Phase 4
Backend + Database Integration

Phase 5
Frontend + Backend Integration

Phase 6
AI Engine Integration



BharatLens Development Order
Ab main ye sequence follow karunga:
Phase 1
✅ Backend Architecture
✅ Health Route
✅ Supabase Connection
Phase 2
User Authentication
User Profile APIs
Save Scheme APIs
Save Job APIs
Save Scholarship APIs
Notification APIs
Phase 3
Admin Panel APIs
Verify Data APIs
Approve / Reject APIs
Content Moderation APIs
Phase 4
AI Data Collection Engine
RSS Collectors
Government APIs
PDF Extraction
Scraping Pipelines
Phase 5
Recommendation Engine
Eligibility Matching
Personalized Suggestions
Phase 6
Frontend Integration
Dummy Data Removal
Production Deployment










✅ Tables
✅ Indexes
✅ Sample Data
✅ Repository Layer
✅ API Layer

⬇️

✅ Foreign Keys
✅ updated_at Triggers

⬇️

🚀 Phase 2
   - Auth
   - Roles
   - Admin APIs
   - Saved Items
   - Notifications
   - Recommendations

⬇️

✅ RLS Policies

⬇️

✅ Production Data Pipeline











Ab fix priority
RSS invalid URLs graceful handle
RRB timeout fix
SSC selector improve
UGC/AICTE scraper filtering
process/clean/classify me body validation add karo
Ab Phase 4 almost complete hai, but “100%” bolne se pehle ye 5 cheezein fix karni hain.