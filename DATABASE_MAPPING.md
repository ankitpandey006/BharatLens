# BharatLens Database Mapping

## Core Tables

### collected_data
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Original title |
| `raw_title` | TEXT | Raw extracted title |
| `raw_content` | TEXT | Raw extracted content |
| `description` | TEXT | Cleaned description |
| `item_type` | TEXT | Content type: `scheme`, `scholarship`, `job`, `exam` |
| `content_action` | TEXT | Content action: `notification`, `apply`, `admit_card`, `result`, `answer_key` |
| `verification_status` | TEXT | `pending`, `verified_ready`, `approved`, `rejected`, `published`, `duplicate`, `failed` |
| `verification_score` | INTEGER | AI verification score (0-100) |
| `ai_confidence_score` | INTEGER | AI confidence score (0-100) |
| `source_name` | TEXT | Source of data |
| `source_url` | TEXT | Source URL |
| `source_trust_score` | INTEGER | Source trust rating |
| `duplicate_of` | UUID | Reference to duplicated item |
| `duplicate_reason` | TEXT | Reason for duplicate classification |
| `normalized_title` | TEXT | Normalized title for dedup |
| `rejection_reason` | TEXT | Admin rejection reason |
| `admin_notes` | TEXT | Admin notes |
| `collected_at` | TIMESTAMPTZ | When collected |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last updated |

### schemes (Published)
| Field | Type |
|-------|------|
| `id` | UUID |
| `title` | TEXT |
| `description` | TEXT |
| `category` | TEXT |
| `provider` | TEXT |
| `eligibility` | TEXT |
| `benefit` | TEXT |
| `deadline` | TIMESTAMPTZ |
| `state` | TEXT |
| `official_url` | TEXT |
| `apply_url` | TEXT |
| `status` | TEXT |
| `source_url` | TEXT |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

### scholarships (Published)
| Field | Type |
|-------|------|
| `id` | UUID |
| `title` | TEXT |
| `description` | TEXT |
| `category` | TEXT |
| `provider` | TEXT |
| `eligibility` | TEXT |
| `amount` | TEXT |
| `deadline` | TIMESTAMPTZ |
| `state` | TEXT |
| `official_url` | TEXT |
| `apply_url` | TEXT |
| `status` | TEXT |
| `source_url` | TEXT |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

### jobs (Published)
| Field | Type |
|-------|------|
| `id` | UUID |
| `title` | TEXT |
| `description` | TEXT |
| `organization` | TEXT |
| `qualification` | TEXT |
| `vacancies` | INTEGER |
| `location` | TEXT |
| `salary` | TEXT |
| `deadline` | TIMESTAMPTZ |
| `official_url` | TEXT |
| `apply_url` | TEXT |
| `status` | TEXT |
| `source_url` | TEXT |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

### exams (Published)
| Field | Type |
|-------|------|
| `id` | UUID |
| `title` | TEXT |
| `description` | TEXT |
| `category` | TEXT |
| `conducting_body` | TEXT |
| `eligibility` | TEXT |
| `exam_date` | TIMESTAMPTZ |
| `application_deadline` | TIMESTAMPTZ |
| `official_url` | TEXT |
| `apply_url` | TEXT |
| `status` | TEXT |
| `source_url` | TEXT |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

## Audit & Logging Tables

### admin_actions
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `admin_id` | UUID | Admin user ID |
| `action_type` | TEXT | `approve`, `reject`, `publish`, `unpublish`, `restore`, `delete`, `edit` |
| `target_type` | TEXT | `collected_data`, `scheme`, `scholarship`, `job`, `exam` |
| `target_id` | UUID | Target item ID |
| `details` | JSONB | Action details |
| `created_at` | TIMESTAMPTZ | When action occurred |

### ai_processing_logs
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `item_id` | UUID | Reference to collected_data |
| `processing_type` | TEXT | `clean`, `classify`, `dedup`, `verify` |
| `input_data` | JSONB | AI input |
| `output_data` | JSONB | AI output |
| `confidence_score` | INTEGER | AI confidence |
| `status` | TEXT | `success`, `failed` |
| `error_message` | TEXT | Error if failed |
| `created_at` | TIMESTAMPTZ | When processed |

### sources
| Field | Type |
|-------|------|
| `id` | UUID |
| `name` | TEXT |
| `url` | TEXT |
| `type` | TEXT |
| `trust_score` | INTEGER |
| `is_verified` | BOOLEAN |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

## User-Facing Tables

### profiles
| Field | Type |
|-------|------|
| `id` | UUID |
| `email` | TEXT |
| `full_name` | TEXT |
| `role` | TEXT |
| `created_at` | TIMESTAMPTZ |

### saved_items
| Field | Type |
|-------|------|
| `id` | UUID |
| `user_id` | UUID |
| `item_id` | UUID |
| `item_type` | TEXT |
| `item_data` | JSONB |
| `created_at` | TIMESTAMPTZ |

## Content Structure

```
content_type (item_type):
  scheme
  scholarship
  job
  exam

content_action (for job/exam):
  notification
  apply
  admit_card
  result
  answer_key
```

## Visibility Rules

| Status | Visible to Users |
|--------|-----------------|
| `pending` | ❌ No |
| `verified_ready` | ❌ No |
| `approved` | ❌ No |
| `rejected` | ❌ No |
| `published` | ✅ Yes (if `status = 'active'`) |
| `duplicate` | ❌ No |
| `failed` | ❌ No |
