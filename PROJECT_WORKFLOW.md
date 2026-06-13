# BharatLens — Project Workflow

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    1. DATA COLLECTION PHASE                         │
│                                                                     │
│  RSS Feeds (PIB, Employment News, MyGov, India.gov)                │
│  Website Scrapers (configured sources)                             │
│  PDF Extractors (on-demand)                                        │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────────┐                                               │
│  │  collected_data  │  ← Raw data inserted with processing_status  │
│  │  (raw storage)   │     = "collected", verification_status       │
│  └────────┬────────┘     = "pending"                               │
│           │                                                         │
└───────────┼─────────────────────────────────────────────────────────┘
            │
┌───────────┼─────────────────────────────────────────────────────────┐
│           ▼                                                         │
│                    2. AI PROCESSING PHASE                            │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │  1. Clean        │───▶│  2. Verify       │───▶│  3. Dedup     │  │
│  │  - Remove HTML   │    │  - Required flds │    │  - URL check  │  │
│  │  - Normalize txt │    │  - URL validation│    │  - Hash check │  │
│  │  - Normalize URL │    │  - Source trust  │    │  - Title match│  │
│  │  - Parse dates   │    │  - Content qual  │    │  - Similarity │  │
│  └──────────────────┘    └────────┬─────────┘    └───────┬───────┘  │
│                                   │                       │         │
│                                   ▼                       ▼         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  4. Classify Content Type & Action                            │   │
│  │  - item_type: scheme | scholarship | job | exam               │   │
│  │  - content_action: (for jobs/exams only)                      │   │
│  │    notification | apply | admit_card | result | answer_key    │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
│                         │                                           │
│                         ▼                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  5. Set Verification Status                                   │   │
│  │  - verified_ready (score ≥ 70)                                │   │
│  │  - pending (score 40-69)                                      │   │
│  │  - duplicate (any match found)                                │   │
│  │  - failed (pipeline error)                                    │   │
│  - Every step logged in ai_processing_logs                        │   │
│  └──────────────────────┬───────────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                         ▼                                           │
│                    3. ADMIN VERIFICATION PHASE                       │
│                                                                     │
│  Admin views items filtered by verification_status:                 │
│  - Pending / Verified Ready / Approved / Rejected / Published       │
│                                                                     │
│  Admin Actions:                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Action      │  New Status   │  Effect                        │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Edit        │  (unchanged)  │  Updates collected_data fields │   │
│  │  Approve     │  approved     │  Moves to Approved section     │   │
│  │  Reject      │  rejected     │  Requires rejection reason     │   │
│  │  Publish     │  published    │  Inserts/updates public table  │   │
│  │  Unpublish   │  approved     │  Deletes from public table     │   │
│  │  Delete      │  soft-delete  │  is_deleted=true, hides item   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Every action logged in:                                            │
│  - admin_actions (action tracking)                                  │
│  - admin_audit_logs (full audit trail)                              │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                         ▼                                           │
│                    4. PUBLICATION PHASE                              │
│                                                                     │
│  Main Content Types → Published to public tables:                   │
│  - scheme     → schemes table                                       │
│  - scholarship → scholarships table                                  │
│  - job        → jobs table                                          │
│  - exam       → exams table                                         │
│                                                                     │
│  Update Content Types → Published to content_updates table:         │
│  - admit_card, result, answer_key, notification, update             │
│                                                                     │
│  Publishing Requirements:                                           │
│  - Item must be in "approved" status                                │
│  - title, description, and official_url are required                │
│  - Category-specific fields validated separately                   │
│  - Duplicate prevention via title/URL matching                     │
│  - search_text auto-generated from title+description                │
│  - eligibility_rules auto-created                                   │
│  - content_updates entry auto-created                               │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                         ▼                                           │
│                    5. USER FACING PHASE                              │
│                                                                     │
│  Public pages query only: status="active" AND verification_status   │
│  ="published"                                                       │
│                                                                     │
│  /schemes      → GET /api/schemes                                   │
│  /scholarships → GET /api/scholarships                              │
│  /jobs         → GET /api/jobs (supports ?tab= parameter)           │
│  /exams        → GET /api/exams (supports ?tab= parameter)          │
│                                                                     │
│  Tab filtering for jobs/exams:                                      │
│  - ?tab=apply      → items with apply content_updates               │
│  - ?tab=admit_card → items with admit_card content_updates          │
│  - ?tab=result     → items with result content_updates              │
│  - ?tab=notification → items with notification content_updates      │
│                                                                     │
│  Update badges/links auto-attached to job/exam query results        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend API Flow

### Authentication
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register` | POST | No | User registration |
| `/api/auth/login` | POST | No | User login |
| `/api/auth/logout` | POST | Yes | User logout |
| `/api/auth/me` | GET | Yes | Current user profile |

### Public Content Endpoints
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/schemes` | GET | No | List published schemes |
| `/api/schemes/:id` | GET | No | Get scheme by ID |
| `/api/scholarships` | GET | No | List published scholarships |
| `/api/scholarships/:id` | GET | No | Get scholarship by ID |
| `/api/jobs` | GET | No | List published jobs (?tab=) |
| `/api/jobs/:id` | GET | No | Get job by ID |
| `/api/exams` | GET | No | List published exams (?tab=) |
| `/api/exams/:id` | GET | No | Get exam by ID |
| `/api/updates` | GET | No | List published content updates |
| `/api/search` | GET | No | Cross-type search |
| `/api/eligibility` | GET | Yes | Eligibility checks |
| `/api/recommendations` | GET | Yes | Personalized recommendations |

### Admin Endpoints (require admin/moderator role)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/users` | GET | List all users |
| `/api/admin/sources` | GET | List all sources |
| `/api/admin/updates` | GET | List content updates |
| `/api/admin/collected-data` | GET | List collected data (?page=&limit=&status=) |
| `/api/admin/collected-data/:id` | GET | Get collected data item |
| `/api/admin/collected-data/:id/approve` | PATCH | Approve item |
| `/api/admin/collected-data/:id/reject` | PATCH | Reject item |
| `/api/admin/collected-data/:id/edit` | PATCH | Edit item fields |
| `/api/admin/collected-data/:id/publish` | PATCH | Publish to public table |
| `/api/admin/collected-data/:id/unpublish` | PATCH | Unpublish item |
| `/api/admin/collected-data/:id/delete` | PATCH | Soft-delete item |

### AI Pipeline Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pipeline/process-collected-data` | POST | Process pending items |
| `/api/ai-processing/process/:id` | POST | Process single item |
| `/api/ai-processing/process-pending` | POST | Batch process pending |
| `/api/ai-processing/logs/:id` | GET | Get AI logs for item |
| `/api/verification/recheck/:id` | POST | Re-run verification |
| `/api/collectors/run-all` | POST | Run all collectors |

---

## Admin Workflow

### Status Flow
```
collected_data.verification_status transitions:

pending ──▶ verified_ready ──▶ approved ──▶ published
  │                              │              │
  │                              ▼              │
  │                           rejected ◀────────┘
  │                              │
  │                              ▼
  │                         (soft delete)
  ▼
duplicate / failed
```

### Admin Panel Sections
| Section | Shows | Source |
|---------|-------|--------|
| Dashboard | Summary stats | `GET /api/admin/stats` |
| Verification | Items with `verification_status: pending` | `GET /api/admin/collected-data?status=pending` |
| Approved | Items with `verification_status: approved` | `GET /api/admin/collected-data?status=approved` |
| Published | Items with `verification_status: published` | `GET /api/admin/collected-data?status=published` |
| Rejected | Items with `verification_status: rejected` | `GET /api/admin/collected-data?status=rejected` |
| Sources | All configured data sources | `GET /api/admin/sources` |
| AI Logs | AI processing logs | `GET /api/admin/updates` |
| Users | All platform users | `GET /api/admin/users` |

---

## Database Status Meanings

### `collected_data.verification_status`
| Status | Meaning | Visibility to Users |
|--------|---------|-------------------|
| `pending` | Raw data, awaiting AI processing | ❌ No |
| `verified_ready` | AI processed, ready for admin review | ❌ No |
| `approved` | Admin approved, awaiting publish | ❌ No |
| `rejected` | Admin rejected with reason | ❌ No |
| `published` | Published to public table | ✅ Yes |
| `duplicate` | Matched existing item | ❌ No |
| `failed` | Pipeline processing error | ❌ No |

### Public Table `status`
| Status | Meaning |
|--------|---------|
| `active` | Item is active and visible |
| `inactive` | Item is hidden |

### Public Table `verification_status`
| Status | Meaning |
|--------|---------|
| `published` | Published and visible to users |
| (other) | Not visible to users |

### `content_updates.status`
| Status | Meaning |
|--------|---------|
| `published` | Active and visible |
| `pending` | Awaiting approval |
| `rejected` | Rejected |

### `content_updates.update_type`
| Type | Meaning |
|------|---------|
| `notification` | General notification |
| `apply` | Application period open |
| `admit_card` | Admit card released |
| `result` | Result declared |
| `answer_key` | Answer key released |
| `new` | New item published |
| `unpublished` | Item unpublished |
| `deleted` | Item deleted |

---

## Frontend Page Mapping

| Route | Page Component | API Used |
|-------|---------------|----------|
| `/` | Home/Dashboard | `GET /api/dashboard` |
| `/schemes` | SchemesPage | `GET /api/schemes` |
| `/scholarships` | ScholarshipsPage | `GET /api/scholarships` |
| `/jobs` | JobsPage | `GET /api/jobs` |
| `/exams` | ExamsPage | `GET /api/exams` |
| `/saved` | SavedItems | `GET /api/saved` |
| `/profile` | Profile/Settings | `GET /api/profile` |
| `/chatbot` | AI Chat | `POST /api/ai/chat` |
| `/recommendations` | Recommendations | `GET /api/recommendations` |
| `/admin` | Admin Dashboard | `GET /api/admin/stats` |
| `/admin/verification` | VerificationPage | `GET /api/admin/collected-data` |
| `/admin/approved` | Admin list | `GET /api/admin/collected-data?status=approved` |
| `/admin/published` | Admin list | `GET /api/admin/collected-data?status=published` |
| `/admin/rejected` | Admin list | `GET /api/admin/collected-data?status=rejected` |
| `/admin/sources` | Sources | `GET /api/admin/sources` |
| `/admin/ai-logs` | AI Logs | `GET /api/admin/updates` |
| `/admin/users` | User management | `GET /api/admin/users` |

---

## Testing Checklist

### Backend Tests
- [ ] `npm run build` passes with zero errors
- [ ] Server starts without errors
- [ ] All collector routes respond (run-all, RSS, scraping)
- [ ] Admin routes return proper status codes
- [ ] Public content routes only return published items
- [ ] Auth middleware correctly blocks unauthenticated requests
- [ ] Role middleware correctly blocks non-admin requests
- [ ] API response format: `{ success, message, data, error }`

### Workflow Tests
- [ ] Collector run creates/updates collected_data with `verification_status: pending`
- [ ] AI processing marks items as `verified_ready`, `duplicate`, or `failed`
- [ ] Admin verification page loads without error
- [ ] Admin can view/search/filter collected data items
- [ ] Admin can edit item (title, description, type, category, URL)
- [ ] Admin can approve item (status changes to `approved`)
- [ ] Approved item appears in Approved section
- [ ] Admin can publish approved item (status changes to `published`)
- [ ] Published item appears on correct user-facing page
- [ ] Approved but unpublished item is NOT visible to users
- [ ] Admin can reject item with reason (status changes to `rejected`)
- [ ] Rejected item appears in Rejected section
- [ ] Delete rejected works (soft delete with `is_deleted=true`)
- [ ] Unpublish removes item from user visibility (status → `approved`)
- [ ] Jobs/exams correctly show content_action badges
- [ ] Saved items preserve title, description, type, and apply/official link
- [ ] AI Chat and Profile pages remain stable

### Frontend Tests
- [ ] `npm run build` passes with zero errors
- [ ] Admin panel is responsive on mobile and desktop
- [ ] Skeleton loading shown for lists/tables/cards
- [ ] Spinner shown only for action buttons (approve, reject, publish, etc.)
- [ ] No full-page loading for list refreshes
- [ ] All user pages show only published data
- [ ] Jobs/exams cards show action badges (Apply, Admit Card, Result, etc.)
- [ ] Card buttons match content_action

---

## Environment Variables

```
# Application
NODE_ENV=development|production|test
PORT=5001
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# JWT
JWT_SECRET=your-32-char-min-secret

# Data Sources
DATA_GOV_API_KEY=xxxx

# AI (Gemini)
GEMINI_API_KEY=xxxx
GEMINI_MODEL=gemini-2.5-flash
AI_BATCH_LIMIT=3
GEMINI_REQUEST_DELAY_MS=15000

# Scheduling
ENABLE_COLLECTOR_CRON=false
```

---

## Key Code Architecture

### Backend File Structure
```
backend/src/
  constants/           # Shared constants (content-types, statuses)
  config/              # DB, env, collector config
  middlewares/         # Auth, role, validation, rate-limit
  validators/          # Zod validation schemas
  repositories/        # Database queries (Supabase)
  services/            # Business logic
  controllers/         # HTTP request handlers
  routes/              # Express route definitions
  ai/                  # AI services (classifier, dedup, clean, Gemini)
  jobs/                # Cron jobs (daily collector)
  utils/               # Shared utilities
```

### Frontend File Structure
```
frontend/
  app/                 # Next.js App Router pages
    admin/             # Admin panel
    (main)/            # User-facing pages
  components/
    admin/             # Admin UI components
    cards/             # Content card components
    filters/           # Search/filter components
    ui/                # Generic UI components
  hooks/               # SWR hooks for API data
  lib/
    api/               # API client and endpoints
    supabase/          # Supabase client config
  types/               # TypeScript type definitions
```
