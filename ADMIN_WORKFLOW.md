# BharatLens Admin Workflow

## Complete Content Lifecycle

```
AI Data Collection → Data Cleaning → Duplicate Detection → AI Verification → AI Classification
       ↓
Verification Queue (pending / verified_ready)
       ↓
Admin Review & Edit (Slide Panel with dynamic forms)
       ↓
Approve ──────────────────────────────────────────────── Reject
       ↓                                                      ↓
Approved Queue                                          Rejected Page
       ↓                                                      ↓
Publish (one-click, auto-destination)                   Restore (→ approved) OR Delete (permanent)
       ↓
Published Queue
       ↓
Visible to Users
       ↓
Unpublish (→ approved) OR Delete (permanent)
```

## Admin Pages

| Page | URL | Status Filter | Available Actions |
|------|-----|---------------|-------------------|
| Dashboard | `/admin` | — | View pipeline stats, quick actions |
| Verification Queue | `/admin/verification` | pending, verified_ready, duplicate, failed | Preview, Edit, Approve, Reject |
| Approved | `/admin/approved` | approved | Preview, Edit, Publish, Reject |
| Published | `/admin/published` | published | Preview, Edit, Unpublish, Delete |
| Rejected | `/admin/rejected` | rejected | Preview, Edit, Restore, Delete |
| Sources | `/admin/sources` | — | View/manage data sources |
| AI Logs | `/admin/updates` | — | View AI processing logs |
| Users | `/admin/users` | — | View/manage users |

## Status Flow

```
pending → verified_ready → approved → published
                              ↓            ↓
                           rejected    approved (unpublish)
                              ↓
              restore (→ approved) OR delete (permanent)
```

## Admin Actions

### Approve
- Sets `verification_status = approved`
- Adds `admin_notes` if provided
- Logged in `admin_actions`

### Reject
- Sets `verification_status = rejected`
- Requires `rejection_reason`
- Logged in `admin_actions`

### Publish (One-Click)
- Automatically inserts/updates the correct target table based on `item_type`:
  - `scheme` → `schemes` table
  - `scholarship` → `scholarships` table
  - `job` → `jobs` table
  - `exam` → `exams` table
- Sets `verification_status = published`
- Only confirmation dialog required — no second form, no publish wizard
- Logged in `admin_actions`

### Unpublish
- Sets `verification_status = approved`
- Item returns to Approved page
- Logged in `admin_actions`

### Restore
- Sets `verification_status = approved`
- Item returns to Approved page
- Logged in `admin_actions`

### Delete
- Hard delete from `collected_data` table
- Requires confirmation
- Not reversible

## Slide Panel (Review & Edit)

The Slide Panel replaces all previous modals and edit pages. Features:
- **AI Review** card showing Verification Score, Confidence, Source Trust
- **Dynamic form** that shows type-specific fields depending on `content_type`:
  - **Scheme**: Title, Description, State, Category, Eligibility, Benefits, Required Documents, Official URL, Start Date, Last Date
  - **Scholarship**: Title, Description, State, Category, Amount, Income Limit, Education Level, Eligibility, Required Documents, Official URL, Last Date
  - **Job**: Title, Description, Organization, Vacancies, Education, Age Limit, Salary, Application Fee, Selection Process, Official URL, Last Date
  - **Exam**: Title, Description, Conducting Body, Education, Age Limit, Exam Date, Official URL, Last Date
- **Sub-type specific fields** for Job/Exam based on `content_action`:
  - **Apply**: Apply Link, Application Fee, Last Date
  - **Admit Card**: Admit Card Link, Exam Date
  - **Result**: Result Link, Result Date
  - **Answer Key**: Answer Key Link, Challenge Last Date
  - **Notification**: Notification Link/PDF, Notification Date

## Moderation Table

All admin content lists use `ModerationTable` with columns:
- Title (with duplicate badge)
- Source
- Type (colored badge)
- Sub Type (action badge: Notification, Apply, Admit Card, Result, Answer Key)
- Score (AI verification score)
- Confidence (AI confidence)
- Status (colored status badge)
- Date (collected date)
- Actions (contextual: Preview, Edit, Approve, Reject, Publish, Unpublish, Restore, Delete)
