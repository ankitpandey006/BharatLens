# BharatLens AI-Assisted Data Pipeline

## A. Project Overview

BharatLens is a platform that collects, verifies, classifies, and publishes information about Indian government schemes, scholarships, jobs, and exams. The AI-assisted data pipeline automates the entire workflow from data collection to admin verification.

**Stack**: Node.js/Express backend, Next.js frontend, Supabase (PostgreSQL), Google Gemini AI

---

## B. AI-Assisted Data Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    24-Hour Cron Job                          │
│              (runs daily at 2:00 AM server time)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  1. COLLECTION (runPipelineCollection)                       │
│     ├── RSS Feeds (PIB, Employment News, MyGov, India.gov)   │
│     ├── Website Scraping (SSC, UPSC, NTA, AICTE, UGC, RRB)  │
│     └── Raw data stored in `collected_data` table            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  2. CLEANING (runPipelineClean)                              │
│     ├── Remove HTML tags and broken unicode                  │
│     ├── Normalize whitespace and punctuation                 │
│     ├── Validate and normalize URLs                          │
│     ├── Normalize dates/deadlines → ISO 8601 (YYYY-MM-DD)    │
│     ├── Generate normalized_title and content_hash           │
│     └── Status → pipeline_status = "cleaned"                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  3. VERIFICATION & DUPLICATE DETECTION                       │
│     ├── Required fields check (raw_title, raw_content, etc.)  │
│     ├── URL validation and source trust evaluation            │
│     ├── Content quality scoring                               │
│     ├── Duplicate detection:                                  │
│     │   ├── Exact URL match                                   │
│     │   ├── Content hash (SHA-256)                            │
│     │   ├── Normalized title exact match                      │
│     │   └── Fuzzy title similarity (Jaccard bigram, ≥85%)     │
│     └── Status → "verified_ready", "pending", "duplicate"     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  4. CLASSIFICATION (classifyText)                            │
│     ├── Keyword-based rule classification                    │
│     ├── Labels: scheme, scholarship, job, exam, notification │
│     └── Falls back to "unknown" if no keywords match         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  5. LOGGING (ai_processing_logs)                             │
│     ├── processing_type: pipeline | ai_classify | verify     │
│     ├── Status, reason, confidence_score                     │
│     ├── Source name, items processed/failed/duplicate        │
│     └── Per-run summary for audit                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  6. ADMIN VERIFICATION PAGE                                  │
│     ├── Status tabs: Pending, Ready, Approved, Rejected,     │
│     │                 Published, Duplicate, Failed            │
│     ├── Shows: title, type, AI confidence, trust score,      │
│     │         source, deadline, status                       │
│     ├── Actions: Process AI, Approve, Reject, Publish, Edit, │
│     │           Delete, Recheck Verification                  │
│     └── Published items → schemes/scholarships/jobs/exams    │
└─────────────────────────────────────────────────────────────┘
```

---

## C. 24-Hour Cron Workflow

- **Schedule**: Daily at 2:00 AM server time (`0 2 * * *`)
- **Trigger**: Only runs when `ENABLE_COLLECTOR_CRON=true`
- **Steps**:
  1. Collection: Runs all RSS and scraper collectors
  2. Cleaning: Normalizes text, URLs, and dates
  3. Verification: Scores quality, detects duplicates
  4. Classification: Assigns item type labels
  5. Logging: Writes detailed per-run summary
- **Fallback**: If any step fails, the pipeline logs the error and continues

### Manual Trigger

```bash
POST /api/collectors/run-all
POST /api/ai/process-collected-data?limit=10
```

---

## D. Data Cleaning Logic

Implemented in `backend/src/ai/data-cleaner.service.ts`:

| Operation | Description |
|---|---|
| HTML strip | Remove `<tags>` and replace with space |
| Whitespace normalize | Collapse `\\s+` to single space |
| Unicode cleanup | Remove broken/boundary characters |
| Punctuation dedup | `!!!` or `...` → single char |
| Boilerplate removal | "Read more", "Click here", "Learn more" |
| URL normalization | Add https:// if missing, validate http/https |
| Official domain check | Match against known `.gov.in`, `.nic.in` etc. |
| Date normalization | Supports ISO, DD/MM/YYYY, "Month DD, YYYY" formats |
| Content hash | SHA-256 of cleaned title + content |

### Key Functions

```typescript
cleanText(value: string): string           // HTML + whitespace + symbols
normalizeTitle(value: string): string       // clean + lowercase + truncate
isValidUrl(value): boolean                  // http/https validation
normalizeUrl(value): string | null          // normalize + validate
isOfficialDomain(url): boolean              // check .gov.in domains
normalizeDeadline(value): string | null     // parse to YYYY-MM-DD
```

---

## E. Verification Logic

Implemented in `backend/src/services/verification.service.ts`:

| Check | Weight | Max Score |
|---|---|---|
| Required fields present | 40 pts (10 per field) | 40 |
| Valid URLs | 10 pts | 10 |
| Source trust (verified + score) | 30 pts | 30 |
| Valid item_type | 10 pts | 10 |
| Content quality | 10 pts | 10 |
| **Total** | | **100** |

### Status Rules

| Score Range | Status | Description |
|---|---|---|
| ≥ 70 | `verified_ready` | Passes all checks, ready for admin review |
| 40–69 | `pending` | Medium quality, requires manual review |
| < 40 | `rejected` | Low quality, auto-rejected |
| Duplicate found | `duplicate` | Matches existing record |

### Source Trust Evaluation

- Verified source → +20 pts
- Source exists but unverified → +10 pts
- Trust score ≥ 50 → +10 pts
- Score < 50 → +5 pts with note

---

## F. Duplicate Detection Logic

Implemented in `backend/src/ai/duplicate-detector.service.ts`:

### Strategies (in order)

1. **Exact URL match** (`raw_url`): Fastest check
2. **Content hash** (SHA-256): Full content comparison
3. **Normalized title**: Case-insensitive, cleaned title match
4. **Fuzzy title similarity**: Jaccard similarity on word bigrams (≥85% threshold)

### Behavior on Duplicate

- `verification_status` → `"duplicate"`
- `duplicate_reason` stores the detection strategy and match info
- `duplicate_of` stores the matched record's ID
- `duplicate_count` tracks total duplicates found
- Duplicate items remain in `collected_data` but are excluded from admin pending/ready views

---

## G. Classification Logic

Implemented in `backend/src/ai/classifier.service.ts`:

| Label | Keywords |
|---|---|
| `scheme` | scheme, yojana, yatna, subsidy |
| `scholarship` | scholarship, fellowship, financial assistance, grant |
| `job` | recruitment, vacancy, job, hiring, career |
| `exam` | exam, admit card, result, cut off, answer key |
| `notification` | notification, application, last date, deadline |
| `unknown` | No keywords matched |

Uses simple keyword matching on cleaned + lowercased text. Falls back to `"unknown"` if no keywords match.

---

## H. Admin Verification Workflow

### Status Lifecycle

```
collected → cleaned → verified_ready → approved → published
                 ↘          ↙                ↘
               pending   duplicate        rejected
```

### Actions Available

| Action | Description | API Endpoint |
|---|---|---|
| Process with AI | Run Gemini extraction + verification | `POST /api/ai-processing/process/:id` |
| Recheck Verification | Re-run verification scoring | `POST /api/verification/recheck/:id` |
| Approve | Move to approved list | `PATCH /api/admin/collected-data/:id/approve` |
| Reject | Move to rejected list (reason required) | `PATCH /api/admin/collected-data/:id/reject` |
| Publish | Insert into public table (schemes/scholarships/jobs/exams) | `PATCH /api/admin/collected-data/:id/publish` |
| Edit | Update fields | `PATCH /api/admin/collected-data/:id/edit` |
| Delete | Soft delete | `PATCH /api/admin/collected-data/:id/delete` |
| Unpublish | Remove from public table | `PATCH /api/admin/collected-data/:id/unpublish` |

### Status Tabs in UI

- Pending (`pending`)
- Ready (`verified_ready`)
- Approved (`approved`)
- Rejected (`rejected`)
- Published (`published`)
- Duplicate (`duplicate`)
- Failed (`failed`)

---

## I. Backend API List

### Collection APIs

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/collectors/run-all` | Run all collectors |
| `POST` | `/api/collectors/rss` | Run all RSS collectors |
| `POST` | `/api/collectors/rss/pib` | Run PIB RSS collector |
| `POST` | `/api/collectors/rss/employment` | Run Employment News RSS collector |
| `POST` | `/api/collectors/rss/:sourceName` | Run named RSS collector |
| `POST` | `/api/collectors/scrape/:sourceName` | Run website scraper |
| `POST` | `/api/collectors/pdf` | Run PDF extractor |
| `GET` | `/api/collectors/status` | Get collector statuses |
| `GET` | `/api/collectors/stats` | Get collection statistics |

### AI Processing APIs

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ai-processing/process/:id` | Process single item |
| `POST` | `/api/ai-processing/process-pending?limit=3` | Process pending items (batch) |
| `GET` | `/api/ai-processing/logs/:id` | Get processing logs |
| `POST` | `/api/verification/recheck/:id` | Recheck verification |
| `POST` | `/api/ai/process-collected-data?limit=10` | AI pipeline processing |
| `POST` | `/api/ai/chat` | AI Chatbot (Phase 4) |

### Admin APIs

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/collected-data?status=pending` | List collected data by status |
| `GET` | `/api/admin/collected-data/:id` | Get single collected data item |
| `PATCH` | `/api/admin/collected-data/:id/approve` | Approve item |
| `PATCH` | `/api/admin/collected-data/:id/reject` | Reject item (reason required) |
| `PATCH` | `/api/admin/collected-data/:id/publish` | Publish item to public table |
| `PATCH` | `/api/admin/collected-data/:id/unpublish` | Unpublish item |
| `PATCH` | `/api/admin/collected-data/:id/edit` | Edit item fields |
| `PATCH` | `/api/admin/collected-data/:id/delete` | Soft delete item |
| `GET` | `/api/admin/verification` | Same as collected-data endpoint |
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/sources` | List sources |
| `GET` | `/api/admin/users` | List users |
| `PATCH` | `/api/admin/sources/:id/verify` | Verify a source |

---

## J. Database Table/Column Changes

### `collected_data` table — Pipeline Columns

| Column | Type | Description |
|---|---|---|
| `ai_verification_status` | TEXT | `trusted` | `suspicious` | `fake` |
| `ai_confidence_score` | INTEGER | 0–100 confidence score |
| `ai_reason` | TEXT | Reason for verification verdict |
| `ai_verified_at` | TIMESTAMPTZ | When AI verification ran |
| `trust_score` | INTEGER | Source trust score 0–100 |
| `duplicate_of` | UUID | Reference to original duplicate record |
| `duplicate_count` | INTEGER | Number of duplicates found |
| `pipeline_status` | TEXT | `collected` | `cleaned` | `verified` | `pending` | `approved` | `rejected` | `published` | `failed` |
| `pipeline_error` | TEXT | Error message if pipeline stage failed |
| `cleaned_at` | TIMESTAMPTZ | When cleaning ran |
| `classified_at` | TIMESTAMPTZ | When classification ran |

### `ai_processing_logs` table — Pipeline Tracking

| Column | Type | Description |
|---|---|---|
| `processing_type` | TEXT | `ai_classify` | `verify` | `dedup` | `pipeline` | `recheck` |
| `reason` | TEXT | Reason/outcome of processing |
| `confidence_score` | INTEGER | 0–100 confidence |
| `source_name` | TEXT | Source name for this run |
| `items_processed` | INTEGER | Items successfully processed |
| `items_failed` | INTEGER | Items that failed |
| `items_duplicate` | INTEGER | Duplicate items found |

### Indexes

```sql
idx_collected_data_pipeline_status
idx_collected_data_ai_verification_status
idx_collected_data_trust_score
idx_collected_data_duplicate_of
idx_ai_processing_logs_processing_type
```

---

## K. Environment Variables

```env
# Required
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=

# Optional - Data Collection
DATA_GOV_API_KEY=
ENABLE_COLLECTOR_CRON=false

# Optional - AI Pipeline
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
AI_BATCH_LIMIT=3
GEMINI_REQUEST_DELAY_MS=15000
```

---

## L. Testing Checklist

### Backend Tests

```bash
# Run collection
curl -X POST http://localhost:5001/api/collectors/run-all

# Check status
curl http://localhost:5001/api/collectors/status

# AI process collected data (admin auth required)
curl -X POST http://localhost:5001/api/ai/process-collected-data?limit=3 \
  -H "Authorization: Bearer <admin_token>"

# Check admin verification
curl http://localhost:5001/api/admin/collected-data?status=pending \
  -H "Authorization: Bearer <admin_token>"

# Approve item
curl -X PATCH http://localhost:5001/api/admin/collected-data/:id/approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Publish item
curl -X PATCH http://localhost:5001/api/admin/collected-data/:id/publish \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"itemType": "scheme", "payload": {}}'

# AI Chatbot
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "What schemes are available for students in Maharashtra?"}'
```

### Verification Tests

1. ✅ POST /api/collectors/run-all — succeeds (or gracefully handles empty sources)
2. ✅ POST /api/ai/process-collected-data?limit=3 — processes items without Gemini crash
3. ✅ GET /api/admin/collected-data?status=verified_ready — returns AI-processed data
4. ✅ Approve → Reject → Publish flow works end-to-end
5. ✅ No duplicate records inserted for same URL/title
6. ✅ Fake/low-quality data is rejected (score < 40)
7. ✅ Suspicious data (score 40–69) marked as pending with AI reason
8. ✅ Frontend builds with zero TypeScript errors
9. ✅ Backend builds with zero TypeScript errors

---

## M. Known Limitations

1. **Gemini free tier**: 5 requests/minute limit. Pipeline processes items with 15s cooldown between Gemini calls. Falls back to rule-based extraction when quota is exhausted.
2. **Keyword-based classification**: The rule-based classifier is limited to keyword matching. Does not understand context or intent.
3. **No incremental sync**: The pipeline processes all pending items each run, regardless of whether they were processed before. Idempotent but not optimized.
4. **In-memory filtering**: `runPipelineClean` and `runPipelineVerify` fetch items and filter in-memory. With >1000 items, this may need pagination.
5. **No retry for failed items**: Items that fail during cleaning or verification are marked `failed` and require manual re-processing.

---

## N. Future Improvements

1. **AI-powered classification**: Replace keyword-based classifier with Gemini-based classification for better accuracy.
2. **Incremental processing**: Track `last_processed_at` per item and only process new/changed items.
3. **Parallel pipeline phases**: Collection and cleaning could run in parallel per source.
4. **Retry mechanism**: Automatically retry failed items on next pipeline run.
5. **Source health monitoring**: Alert when a source has been failing for >3 consecutive runs.
6. **Webhook notifications**: Notify admins when new items are ready for verification.
7. **Automatic publishing**: Auto-publish items with score ≥ 90 from verified sources.
8. **Gemini quota management**: Dynamic delay adjustment based on remaining quota.
