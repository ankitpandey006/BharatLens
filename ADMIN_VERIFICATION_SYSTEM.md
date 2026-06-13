# BharatLens Admin Verification System

## Workflow Overview

```
AI Collectors (RSS / Scraping / PDF)
        ↓
    collected_data (raw storage)
  verification_status = "pending"
        ↓
AI Pipeline (Clean → Verify → Dedup → Classify)
        ↓
    verification_status = "verified_ready" | "duplicate" | "failed"
        ↓
┌─────────────────────────────────────────────────────────┐
│              VERIFICATION QUEUE                          │
│                                                          │
│  Admin reviews items with rich table:                    │
│  Title | Source | Type | Sub Type | Score | Confidence   │
│  Status | Date | Quick Actions                           │
│                                                          │
│  Actions per row: Preview | Approve | Reject             │
│  Click Preview → Slide panel opens for detail + edit     │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
    ┌────────────┐         ┌────────────┐
    │  APPROVED  │         │  REJECTED  │
    │            │         │            │
    │ Actions:   │         │ Actions:   │
    │ Publish    │         │ Restore    │
    │ Reject     │         │ Delete     │
    │ Edit       │         │            │
    └──────┬─────┘         └────────────┘
           │
           ▼
    ┌────────────┐
    │ PUBLISHED  │
    │            │
    │ Actions:   │
    │ Unpublish  │
    │ Delete     │
    │ View       │
    │ Edit       │
    └────────────┘
           │
           ▼
    Public Website
    (schemes / scholarships / jobs / exams tables)
```

## Status Flow

```
collected_data.verification_status transitions:

pending ──▶ verified_ready ──▶ approved ──▶ published
  │                              │              │
  │                              ▼              │
  │                           rejected ◀────────┘
  │                              │
  │                              ▼
  │                         (hard delete)
  ▼
duplicate / failed
```

## Admin Pages

| Page | Route | Shows | Source API |
|------|-------|-------|------------|
| Dashboard | `/admin` | Pipeline stats, content breakdown, quick actions | `GET /api/admin/stats` |
| Verification Queue | `/admin/verification` | pending, verified_ready, duplicate, failed items | `GET /api/admin/collected-data?status={status}` |
| Approved | `/admin/approved` | Items with verification_status="approved" | `GET /api/admin/collected-data?status=approved` |
| Published | `/admin/published` | Items with verification_status="published" | `GET /api/admin/collected-data?status=published` |
| Rejected | `/admin/rejected` | Items with verification_status="rejected" | `GET /api/admin/collected-data?status=rejected` |
| Sources | `/admin/sources` | All data sources | `GET /api/admin/sources` |
| AI Logs | `/admin/updates` | Content updates / AI logs | `GET /api/admin/updates` |
| Users | `/admin/users` | Platform users | `GET /api/admin/users` |

## Moderation Table Columns

| Column | Source Field | Description |
|--------|-------------|-------------|
| Title | `title` / `raw_title` | Item title (truncated, shows "Duplicate" badge if duplicate) |
| Source | `source_name` | Data source name |
| Type | `item_type` | scheme, scholarship, job, exam (styled badge) |
| Sub Type | `content_action` | notification, apply, admit_card, result, answer_key (colored badge) |
| Score | `verification_score` | AI verification score 0-100 (colored badge) |
| Confidence | `ai_confidence_score` | AI confidence 0-100 (colored badge) |
| Status | `verification_status` | Current pipeline status (StatusBadge component) |
| Date | `collected_at` / `created_at` | Collection date |
| Actions | Quick action buttons | Preview, Approve, Reject, Publish, Unpublish, Restore, Delete (context dependent) |

## Slide Panel Actions

| Panel Section | Fields / Actions |
|---------------|-----------------|
| AI Review | Verification Score, Confidence, Source Trust, Duplicate Reason, AI Summary |
| Edit Fields | Title, Description, Type, Sub Type, Category, Official URL |
| Info | Source, Collection Method, Deadline |
| Admin Notes | Text input for notes/reason |
| Footer Actions | Save Changes, Approve, Reject, Publish, Unpublish, Restore, Delete (context dependent) |

## Quick Action Flow

### Approval
1. Admin clicks **Approve** on row or in panel
2. System sets `verification_status = "approved"` on collected_data
3. Item immediately moves to Approved queue
4. Admin action logged in `admin_actions` and `admin_audit_logs`

### Rejection
1. Admin clicks **Reject** on row or in panel
2. System prompts for rejection reason (required)
3. System sets `verification_status = "rejected"` with `rejection_reason`
4. Item moves to Rejected queue

### Publish (Single Click)
1. Admin clicks **Publish** on approved item
2. System auto-identifies destination table based on `item_type`:
   - scheme → `schemes` table
   - scholarship → `scholarships` table
   - job → `jobs` table
   - exam → `exams` table
3. No second form, no wizard, no duplicate data entry
4. System sets `verification_status = "published"` on collected_data
5. Published data is immediately visible on public pages

### Unpublish
1. Admin clicks **Unpublish** on published item
2. System deletes from public table
3. Status reverts to `approved`
4. Content_updates entry created with `update_type = "unpublished"`

### Restore (from Rejected)
1. Admin clicks **Restore** on rejected item
2. System sets `verification_status = "approved"`
3. Item moves back to Approved queue for publishing

### Delete (Permanent)
1. Admin clicks **Delete** with confirmation
2. System performs hard delete from collected_data
3. If item was published, also deletes from public table

## Content Type + Content Action

```
content_type (item_type):     content_action:
┌─────────────────────┐      ┌──────────────────────┐
│ scheme              │      │ notification          │
│ scholarship         │      │ apply                 │
│ job                 │      │ admit_card            │
│ exam                │      │ result                │
└─────────────────────┘      │ answer_key            │
                              └──────────────────────┘

Examples:
  SSC CGL Notification     → job + notification
  SSC CGL Admit Card        → job + admit_card
  SSC CGL Result            → job + result
  UPSC Answer Key           → exam + answer_key
  NEET Apply                → exam + apply
```

## Database Mapping

### collected_data
| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `source_id` | UUID | FK to sources table |
| `raw_title` | Text | Original title from source |
| `raw_content` | Text | Original content from source |
| `raw_url` | Text | Original URL from source |
| `collection_method` | Text | rss, scraping, pdf |
| `title` | Text | Cleaned/edited title |
| `description` | Text | Cleaned/edited description |
| `item_type` | Text | scheme, scholarship, job, exam |
| `content_action` | Text | notification, apply, admit_card, result, answer_key |
| `category` | Text | General, OBC, SC, ST, etc. |
| `verification_status` | Text | pending, verified_ready, approved, rejected, published, duplicate, failed |
| `verification_score` | Integer | 0-100 AI verification score |
| `verification_notes` | Text | AI verification notes |
| `ai_confidence_score` | Integer | 0-100 AI confidence |
| `duplicate_reason` | Text | Why item was marked duplicate |
| `duplicate_of` | UUID | Reference to original item |
| `rejection_reason` | Text | Admin's rejection reason |
| `approved_by` | UUID | Admin who approved |
| `approved_at` | Timestamptz | Approval timestamp |
| `published_by` | UUID | Admin who published |
| `published_at` | Timestamptz | Publish timestamp |
| `pipeline_status` | Text | collected, cleaned, verified, classified |
| `is_deleted` | Boolean | Soft delete flag |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/collected-data?page=&limit=&status=` | List collected data by status |
| GET | `/api/admin/collected-data/:id` | Get single item |
| PATCH | `/api/admin/collected-data/:id/approve` | Approve item |
| PATCH | `/api/admin/collected-data/:id/reject` | Reject item |
| PATCH | `/api/admin/collected-data/:id/edit` | Edit item fields |
| PATCH | `/api/admin/collected-data/:id/publish` | Publish to public table |
| PATCH | `/api/admin/collected-data/:id/unpublish` | Unpublish item |
| PATCH | `/api/admin/collected-data/:id/delete` | Soft-delete item |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/sources` | List sources |
| GET | `/api/admin/updates` | List AI logs/updates |
| POST | `/api/pipeline/process-collected-data` | Run AI pipeline on pending |
| POST | `/api/collectors/run-all` | Run all data collectors |
