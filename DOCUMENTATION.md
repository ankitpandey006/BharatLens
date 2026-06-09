# BharatLens — Complete Codebase Documentation

> **Version:** 1.2.0  
> **Stack:** Next.js 16 (Frontend) + Express 5 (Backend) + Supabase (Database/Auth)  
> **Last Updated:** June 2026
>
> **Status:** Partially stabilized. Frontend builds clean (TypeScript). Backend type-checks clean. Testing coverage is minimal (1 backend test file). Not production-ready — see [Testing Status](#16-testing-status) and [Known Issues](#17-known-issues--technical-debt).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Frontend Documentation](#4-frontend-documentation)
5. [Backend Documentation](#5-backend-documentation)
6. [API Documentation](#6-api-documentation)
7. [Database Schema](#7-database-schema)
8. [Authentication Flow](#8-authentication-flow)
9. [Admin Workflow](#9-admin-workflow)
10. [Recommendation Engine](#10-recommendation-engine)
11. [Data Collection Workflow](#11-data-collection-workflow)
12. [AI Services](#12-ai-services)
13. [Loading Strategy](#13-loading-strategy)
14. [Deployment Guide](#14-deployment-guide)
15. [Security Analysis](#15-security-analysis)
16. [Performance Analysis](#16-performance-analysis)
17. [Testing Status](#17-testing-status)
18. [Known Issues & Technical Debt](#18-known-issues--technical-debt)
19. [Final Audit Summary](#19-final-audit-summary)
20. [Future Roadmap](#20-future-roadmap)

---

## 1. Project Overview

BharatLens is an AI-powered discovery platform that provides verified information about Indian government schemes, scholarships, jobs, and exams. It aggregates data from multiple official government sources (RSS feeds, scraping, PDFs), classifies and cleans the data, and surfaces personalized recommendations through a rule-based eligibility matching engine.

### Core Value Proposition

- **Centralized Discovery:** Aggregates schemes, scholarships, jobs, and exams from PIB, Employment News, MyGov, India.gov, SSC, UPSC, NTA, AICTE, UGC, RRB, and Data.gov
- **Rule-Based Personalization:** Profile-based recommendation engine that matches users to relevant opportunities using static scoring rules
- **Verified Content Pipeline:** Admin moderation workflow with approval, rejection, and publishing stages
- **Multi-platform Access:** Responsive web interface with both user-facing and admin-facing panels

### Key Technologies

| Layer | Technology | Version |
|---|---|---|
| **Frontend Framework** | Next.js | 16.2.6 |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS | v4 |
| **Animations** | Framer Motion | 12.40.0 |
| **Icons** | Lucide React | 1.16.0 |
| **Client Cache** | SWR | 2.4.1 |
| **Backend Framework** | Express | 5.2.1 |
| **Database** | Supabase (PostgreSQL) | — |
| **Auth** | Supabase Auth | — |
| **Validation** | Zod | 4.4.3 |
| **RSS Parsing** | rss-parser | 3.13.0 |
| **Web Scraping** | Cheerio + Axios | 1.2.0 / 1.17.0 |
| **PDF Parsing** | pdf-parse | 2.4.5 |
| **Task Scheduling** | node-cron | 4.2.1 |
| **Security** | Helmet | 8.2.0 |

---

## 2. System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js 16)"
        FP[Public Pages<br/>Home, About]
        AP[Auth Pages<br/>Login, Register]
        MP[Main Pages<br/>Dashboard, Saved, Profile, Notifications]
        CP[Content Pages<br/>Schemes, Scholarships, Jobs, Exams]
        RP[Recommendations Page]
        CH[Chatbot Page]
        ADP[Admin Pages<br/>Dashboard, Content Mgmt, Users]
        AC[Admin Components<br/>Sidebar, Header, Stat Cards, Tables]
        CC[Content Components<br/>Cards, Detail Pages, Lists]
        UC[UI Components<br/>Skeletons, Spinners, Modals]
    end

    subgraph "Backend (Express 5)"
        MW[Middleware<br/>Auth, Role, Validation, Error]
        R[Routes<br/>17 Route Modules]
        C[Controllers]
        S[Services<br/>Business Logic Layer]
        REP[Repositories<br/>Data Access Layer]
        AI[AI Services<br/>Classifier, Cleaner, Dedup - Rule Based]
        COL[Collectors<br/>RSS, Scraper, PDF, API]
        SCH[Scheduler<br/>Daily Collector Cron]
    end

    subgraph "Data Layer"
        SUP[(Supabase<br/>PostgreSQL)]
        RSS[RSS Feeds<br/>PIB, Employment News, etc.]
        WEB[Government Websites<br/>SSC, UPSC, NTA, etc.]
        PDF[PDF Documents]
    end

    FP --> MW
    AP --> MW
    MP --> MW
    CP --> MW
    RP --> MW
    CH --> MW
    ADP --> MW
    MW --> R
    R --> C
    C --> S
    S --> REP
    S --> AI
    COL --> REP
    SCH --> COL
    COL --> RSS
    COL --> WEB
    COL --> PDF
    REP --> SUP
```

### Architecture Principles

1. **Layered Backend:** Routes → Controllers → Services → Repositories → Supabase
2. **Rate Limited:** Three tiers — 100 req/min general API, 10 req/min auth, 30-300 req/min admin (dev/production)
3. **Security Headers:** Strict CSP, frame-src denied, CORS restricted, request size limited to 1MB
4. **Production-Safe Errors:** 500 errors return generic messages in production; full details logged server-side
5. **Client-side Rendering:** All authenticated pages use `"use client"` for interactivity
6. **Token-based Auth:** JWT tokens managed through Supabase Auth with bearer tokens
7. **Admin Isolation:** Separate layout and sidebar with role-based access
8. **Data Pipeline:** External sources → Collectors → `collected_data` table → Verification → Public tables
9. **Client-Side Caching:** SWR with stale-while-revalidate for all GET API requests; no duplicate loading states

---

## 3. Folder Structure

```
BharatLens/
├── frontend/                          # Next.js 16 Frontend
│   ├── app/                          # App Router Pages
│   │   ├── layout.tsx                # Root layout w/ AuthProvider & AppShell
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Tailwind + custom CSS
│   │   ├── (main)/layout.tsx         # Authenticated layout w/ skeleton loading
│   │   ├── (auth)/layout.tsx         # Auth layout (login/register)
│   │   ├── (main)/dashboard/page.tsx # User dashboard
│   │   ├── (main)/saved/page.tsx     # Saved items
│   │   ├── (main)/profile/page.tsx   # User profile
│   │   ├── (main)/notifications/page.tsx
│   │   ├── (main)/recommendations/page.tsx
│   │   ├── (main)/schemes/page.tsx   # Schemes listing
│   │   ├── (main)/schemes/[id]/page.tsx # Scheme detail
│   │   ├── (main)/scholarships/page.tsx
│   │   ├── (main)/scholarships/[id]/page.tsx
│   │   ├── (main)/jobs/page.tsx
│   │   ├── (main)/jobs/[id]/page.tsx
│   │   ├── (main)/exams/page.tsx
│   │   ├── (main)/exams/[id]/page.tsx
│   │   ├── (main)/chatbot/page.tsx   # Chatbot/AI assistant page
│   │   ├── admin/layout.tsx          # Admin layout w/ skeleton loading
│   │   ├── admin/page.tsx            # Admin dashboard
│   │   └── auth/callback/route.ts    # OAuth callback handler
│   ├── components/                   # React Components
│   │   ├── auth/                     # AuthProvider, OriginGuard
│   │   ├── layout/                   # AppShell, SiteHeader, SiteFooter
│   │   ├── admin/                    # AdminSidebar, AdminHeader, AdminStatCard, etc.
│   │   ├── cards/                    # SchemeCard, JobCard, ExamCard, etc.
│   │   ├── details/                  # DetailLoading, DetailHero, EligibilityList, etc.
│   │   ├── forms/                    # LoginForm, RegisterForm, etc.
│   │   ├── filters/                  # ListingSearchFilter
│   │   └── ui/skeletons/            # Loading skeletons
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.ts                # Auth context wrapper
│   │   ├── useApi.ts                 # SWR-based API hooks (useSchemes, useJobs, etc.)
│   │   ├── useProfile.ts             # Dead/unused wrapper
│   │   └── useSavedItems.ts          # Dead/unused wrapper
│   ├── lib/                          # API & utilities
│   │   ├── api/                      # API clients (client, auth-api, content-api, admin, dashboard-api, admin-utils)
│   │   ├── auth/                     # Auth utilities (urls, storage, safe-origin, debug)
│   │   ├── supabase/                 # Supabase client (client.ts, server.ts)
│   │   └── types/                    # Shared type definitions
│   ├── types/                        # TypeScript type definitions
│   ├── utils/                        # Utility functions (cn, formatDate, filterItems)
│   ├── proxy.ts                      # Next.js middleware for auth protection
│   ├── next.config.ts                # Next.js config
│   └── package.json                  # Frontend dependencies
│
├── backend/                          # Express 5 Backend
│   ├── src/
│   │   ├── server.ts                 # Server entry point
│   │   ├── app.ts                    # Express app configuration
│   │   ├── config/                   # Configuration files
│   │   │   ├── env.ts                # Zod-validated environment variables
│   │   │   ├── supabase.ts           # Supabase client setup
│   │   │   └── collector.config.ts   # Collector source definitions
│   │   ├── routes/                   # Express routers (17 modules)
│   │   ├── controllers/             # Request handlers
│   │   ├── services/                 # Business logic (14 modules)
│   │   ├── repositories/            # Data access layer
│   │   ├── middlewares/              # Express middleware (6 modules)
│   │   ├── validators/              # Zod validation schemas
│   │   ├── collectors/              # Data collectors
│   │   │   ├── rss/                  # RSS feed collectors
│   │   │   ├── scraping/             # Website scrapers
│   │   │   ├── pdf/                  # PDF extractors
│   │   │   └── apis/                 # External API collectors (Data.gov placeholder)
│   │   ├── ai/                       # AI services (rule-based: classifier, cleaner, dedup)
│   │   ├── jobs/                     # Scheduled jobs (daily collector)
│   │   ├── types/                    # TypeScript types
│   │   ├── utils/                    # Utilities
│   │   ├── constants/               # Status constants
│   │   └── docs/                     # OpenAPI spec
│   └── tests/                        # Backend tests
│       └── controllers/              # Controller tests (1 test file)
│
├── .gitignore
├── .vscode/                          # VS Code settings
├── AGENTS.md                         # AI agent configuration
├── CLAUDE.md                         # AI assistant rules
├── DOCUMENTATION.md                  # This file
├── DOCUMENTATION.md.bak              # Old version backup
└── README.md
```

---

## 4. Frontend Documentation

### 4.1 Pages & Routing

The application uses Next.js App Router with the following route groups:

| Route Group | Path | Purpose | Auth Required | Layout |
|---|---|---|---|---|
| **Public** | `/` | Landing page | No | AppShell |
| | `/about` | About page | No | AppShell |
| **Auth** | `/login` | Login form | No (redirects if authenticated) | AuthLayout |
| | `/register` | Registration form | No (redirects if authenticated) | AuthLayout |
| | `/forgot-password` | Password reset request | No | AuthLayout |
| | `/reset-password` | Password reset action | No | AuthLayout |
| **Main** | `/dashboard` | User dashboard | Yes + profile check | MainLayout |
| | `/profile` | View profile | Yes | MainLayout |
| | `/profile/setup` | Profile setup wizard | Yes | MainLayout |
| | `/saved` | Saved items | Yes | MainLayout |
| | `/notifications` | Notifications list | Yes | MainLayout |
| | `/recommendations` | AI recommendations | Yes | MainLayout |
| | `/chatbot` | AI chatbot/assistant | Yes | MainLayout |
| | `/schemes` | Schemes listing | Yes | MainLayout |
| | `/schemes/[id]` | Scheme detail | Yes | MainLayout |
| | `/scholarships` | Scholarship listing | Yes | MainLayout |
| | `/scholarships/[id]` | Scholarship detail | Yes | MainLayout |
| | `/jobs` | Jobs listing | Yes | MainLayout |
| | `/jobs/[id]` | Job detail | Yes | MainLayout |
| | `/exams` | Exams listing | Yes | MainLayout |
| | `/exams/[id]` | Exam detail | Yes | MainLayout |
| **Admin** | `/admin` | Admin dashboard | Yes + admin/moderator role | AdminLayout |
| | `/admin/analytics` | Analytics | Yes + admin/moderator role | AdminLayout |
| | `/admin/verification` | Data verification | Yes + admin/moderator role | AdminLayout |
| | `/admin/published` | Published items | Yes + admin/moderator role | AdminLayout |
| | `/admin/approved` | Approved items | Yes + admin/moderator role | AdminLayout |
| | `/admin/rejected` | Rejected items | Yes + admin/moderator role | AdminLayout |
| | `/admin/sources` | Data sources | Yes + admin/moderator role | AdminLayout |
| | `/admin/users` | User management | Yes + admin/moderator role | AdminLayout |
| | `/admin/updates` | Content updates | Yes + admin/moderator role | AdminLayout |
| **Callback** | `/auth/callback` | OAuth callback | Public | None |

### 4.2 Layout Architecture

```
RootLayout (app/layout.tsx)
├── AuthProvider
│   ├── OriginGuard
│   └── AppShell (components/layout/AppShell.tsx)
│       ├── SiteHeader (hidden on /admin, /login, /register, etc.)
│       ├── Main Content (flex-1)
│       │   ├── (main)/layout.tsx     ← Auth check + profile check (skeleton while loading)
│       │   │   └── Page content (SWR skeletons for each page)
│       │   ├── (auth)/layout.tsx     ← Auth redirect check (skeleton while loading)
│       │   │   └── Auth forms
│       │   └── admin/layout.tsx      ← Role check, sidebar (skeleton while loading)
│       │       └── Admin content
│       └── SiteFooter (hidden on same pages as header)
```

### 4.3 Key Components

#### Layout Components
- **`AppShell.tsx`** (`frontend/components/layout/AppShell.tsx`): Conditionally renders header/footer based on route (hidden for admin, auth pages)
- **`SiteHeader.tsx`** (`frontend/components/layout/SiteHeader.tsx`): Sticky navigation with scroll effect, explore dropdown, profile dropdown with logout, mobile menu
- **`SiteFooter.tsx`** (`frontend/components/layout/SiteFooter.tsx`): Footer with brand, explore links, resource links

#### Auth Components
- **`AuthProvider.tsx`** (`frontend/components/auth/AuthProvider.tsx`): React context for Supabase session management, handles token save/clear, sign out, session refresh
- **`OriginGuard.tsx`** (`frontend/components/auth/OriginGuard.tsx`): Redirects users from `0.0.0.0` to `localhost` to fix OAuth PKCE state issues

#### Admin Components
- **`AdminSidebar.tsx`** (`frontend/components/admin/AdminSidebar.tsx`): Admin navigation sidebar
- **`AdminHeader.tsx`** (`frontend/components/admin/AdminHeader.tsx`): Admin top header with mobile menu toggle
- **`AdminStatCard.tsx`** (`frontend/components/admin/AdminStatCard.tsx`): Statistics display card
- **`AdminItemTable.tsx`** (`frontend/components/admin/AdminItemTable.tsx`): Table for admin item listings
- **`VerificationDetailPanel.tsx`** (`frontend/components/admin/VerificationDetailPanel.tsx`): Detail panel for approve/reject/publish workflow
- **`VerificationTable.tsx`** (`frontend/components/admin/VerificationTable.tsx`): Verification items table

#### Card Components
- **`SchemeCard.tsx`**, **`ScholarshipCard.tsx`**, **`JobCard.tsx`**, **`ExamCard.tsx`**: Content listing cards with save/bookmark functionality
- **`SavedItemCard.tsx`** (`frontend/components/cards/SavedItemCard.tsx`): Card for saved items with remove capability
- **`NotificationCard.tsx`** (`frontend/components/cards/NotificationCard.tsx`): Notification display card

#### Detail Components
- **`DetailPage.tsx`** (`frontend/components/details/DetailPage.tsx`): Generic detail page wrapper (unused for main content types)
- **`DetailHero.tsx`**: Hero section for detail pages
- **`DetailLoading.tsx`**: Skeleton loading state for detail pages
- **`EligibilityList.tsx`**: Eligibility criteria display
- **`InfoSection.tsx`**: Information sections
- **`DocumentsList.tsx`**: Required documents display
- **`TimelineSection.tsx`**: Timeline view for dates
- **`RelatedCards.tsx`**: Related opportunities
- **`DetailSidebar.tsx`**: Sidebar with actions (save, share, apply)
- **`DetailError.tsx`**: Error state for detail pages

#### Form Components
- **`LoginForm.tsx`**: Email/password and Google OAuth login
- **`RegisterForm.tsx`**: User registration form
- **`ForgotPasswordForm.tsx`**: Password reset request
- **`ResetPasswordForm.tsx`**: Password reset with new password

#### Filter Components
- **`ListingSearchFilter.tsx`**: Search input + category filter + result count

#### UI Components
- **Skeletons**: `DashboardSkeleton.tsx`, `CardSkeleton.tsx`, `ListSkeleton.tsx`, `PageSkeleton.tsx`
- **`Spinner.tsx`**: Animation-only spinner (used for actions: save, delete, form submit)
- **`Skeleton.tsx`**: Base skeleton component

### 4.4 Hooks

| Hook | File | Status | Purpose |
|---|---|---|---|
| `useAuth` | `frontend/hooks/useAuth.ts` | **Active** | Wraps AuthContext for authentication state |
| `useSchemes` | `frontend/hooks/useApi.ts` | **Active** | SWR-based scheme listing with caching |
| `useJobs` | `frontend/hooks/useApi.ts` | **Active** | SWR-based job listing with caching |
| `useExams` | `frontend/hooks/useApi.ts` | **Active** | SWR-based exam listing with caching |
| `useScholarships` | `frontend/hooks/useApi.ts` | **Active** | SWR-based scholarship listing with caching |
| `useSavedItems` | `frontend/hooks/useApi.ts` | **Active** | SWR-based saved items with caching |
| `useNotifications` | `frontend/hooks/useApi.ts` | **Active** | SWR-based notifications with caching |
| `useRecommendations` | `frontend/hooks/useApi.ts` | **Active** | SWR-based recommendations with caching |
| `useDashboardSummary` | `frontend/hooks/useApi.ts` | **Active** | SWR-based dashboard data with caching |
| `useCurrentUser` | `frontend/hooks/useApi.ts` | **Active** | SWR-based current user profile with caching |
| `useAdminStats` | `frontend/hooks/useApi.ts` | **Active** | SWR-based admin stats with caching |
| `useAdminCollectedData` | `frontend/hooks/useApi.ts` | **Active** | SWR-based admin collected data with caching |
| `useSavedItemsMap` | `frontend/hooks/useApi.ts` | **Active** | SWR-based saved items map (item_id → boolean) |
| `useProfile` | `frontend/hooks/useProfile.ts` | **Dead/unused** | Generic useState wrapper, not used anywhere |
| `useSavedItems` (legacy) | `frontend/hooks/useSavedItems.ts` | **Dead/unused** | Generic useState wrapper, not used anywhere |

### 4.5 API Client Architecture

The frontend uses a centralized API client (`frontend/lib/api/client.ts`) that:

1. Automatically retrieves auth tokens from Supabase session or localStorage fallback
2. Handles standardized response format `{ success, message, data, pagination }`
3. Manages 401 errors with session verification and redirect to login
4. Supports "optional" mode (returns `undefined` instead of throwing on failure)
5. Supports "rawResponse" mode for accessing full response object including pagination
6. Has **request deduplication**: Concurrent identical GET calls share a single in-flight promise
7. **Note:** This dedup is separate from SWR's deduping — both coexist

### 4.6 Styling

- **Tailwind CSS v4** with custom CSS variables in `globals.css`
- Custom color palette: `--bl-navy: #1a3c6e`, `--bl-accent: #3b82f6`, `--bl-sand: #f5f3ee`
- Consistent design language: rounded cards, shadows, hover transitions, backdrop blur
- Responsive design with mobile-first breakpoints
- Custom scrollbar styling
- Animations via CSS transitions and keyframes (Framer Motion dependency present but barely used)

---

## 5. Backend Documentation

### 5.1 Application Entry Point

**`backend/src/server.ts`** — Starts Express server on configured PORT (default 5001).

**`backend/src/app.ts`** — Configures:
- Security middleware (Helmet with strict CSP)
- CORS (FRONTEND_URL + localhost:3001)
- JSON body parsing (1MB limit)
- Logging (Morgan)
- Rate limiting (3 tiers: api/auth/admin)
- 17 route modules mounted under `/api`
- Health check endpoints (`/` and `/api/health`)
- Daily collector cron job initialization (if `ENABLE_COLLECTOR_CRON=true`)
- 404 handler + global error handler

### 5.2 Middleware Stack

| Middleware | File | Purpose |
|---|---|---|
| `requireAuth` | `backend/src/middlewares/auth.middleware.ts` | Extracts Bearer token, verifies with Supabase, syncs user record |
| `requireRole` | `backend/src/middlewares/role.middleware.ts` | Role-based access (`admin`, `moderator`) |
| `validate` | `backend/src/middlewares/validate.middleware.ts` | Zod schema validation for params/body/query |
| `injectItemType` | `backend/src/middlewares/inject-item-type.middleware.ts` | Converts plural URL paths to singular item types (`schemes` → `scheme`) |
| `apiLimiter` | `backend/src/middlewares/rate-limit.middleware.ts` | 100 req/min general API |
| `authLimiter` | `backend/src/middlewares/rate-limit.middleware.ts` | 10 req/min auth endpoints |
| `adminLimiter` | `backend/src/middlewares/rate-limit.middleware.ts` | 300 req/min dev, 100 req/min prod |
| `errorHandler` | `backend/src/middlewares/error.middleware.ts` | Global error handler for AppError, ZodError, generic errors |
| `notFoundHandler` | `backend/src/middlewares/not-found.middleware.ts` | 404 handler for unknown routes |

### 5.3 Route Modules (17)

All routes are mounted under `/api` in `app.ts`:

| Route Prefix | File | Auth Required | Key Endpoints |
|---|---|---|---|
| `/api/auth` | `auth.routes.ts` | Partial | Register, Login, Logout, Me, Update Profile, Get by ID |
| `/api/schemes` | `scheme.routes.ts` | No | List (paginated/filtered), Get by ID |
| `/api/scholarships` | `scholarship.routes.ts` | No | List, Get by ID |
| `/api/jobs` | `job.routes.ts` | No | List, Get by ID |
| `/api/exams` | `exam.routes.ts` | No | List, Get by ID |
| `/api/search` | `search.routes.ts` | No | Search across all content types |
| `/api/eligibility` | `eligibility.routes.ts` | No | Check eligibility |
| `/api/recommendations` | `recommendation.routes.ts` | Yes | List, Generate, By Type, Mark Viewed |
| `/api/profile` | `profile.routes.ts` | Yes | Get own, Update, Create |
| `/api/notifications` | `notifications.routes.ts` | Yes | List, Unread count, Mark read, Delete |
| `/api/saved` | `saved.routes.ts` | Yes | List, Save, Remove, Check |
| `/api/dashboard` | `dashboard.routes.ts` | Yes | Dashboard summary |
| `/api/admin` | `admin.routes.ts` | Yes + Admin/Mod | Stats, Users, Sources, Items CRUD, Collected data workflow |
| `/api/collectors` | `collector.routes.ts` | **No** ❌ | Status, Stats, Run collectors (unauthenticated) |
| `/api/pdf` | `pdf.routes.ts` | **No** ❌ | Extract PDF text (unauthenticated) |
| `/api/docs` | `docs.routes.ts` | No | OpenAPI spec |
| `/api/test-db` | `test.route.ts` | No (dev only) | Database connectivity test (only in dev) |

### 5.4 Controller Layer

Each controller delegates to a service and handles request/response formatting. Key patterns:
- Uses `asyncHandler` wrapper to catch async errors
- Uses `sendSuccess` / `sendError` helpers for consistent responses
- Validated inputs accessed via `req.validatedBody`, `req.validatedParams`, `req.validatedQuery`
- Authenticated user accessed via `req.user`

### 5.5 Service Layer

Services contain business logic and orchestrate repository calls. All services are in `backend/src/services/`:

| Service | Key Functions |
|---|---|
| `auth.service.ts` | registerNewUser, loginUser, fetchUserProfile, logoutUser, updateUserProfile |
| `scheme.service.ts` | fetchAllSchemes, fetchSchemeById |
| `scholarship.service.ts` | fetchAllScholarships, fetchScholarshipById |
| `job.service.ts` | fetchAllJobs, fetchJobById |
| `exam.service.ts` | fetchAllExams, fetchExamById |
| `search.service.ts` | performSearch (loads all content, filters by query, paginates) |
| `eligibility.service.ts` | determineEligibility (rule-based scoring) |
| `recommendation.service.ts` | getRecommendations, generateRecommendations, viewRecommendation |
| `profile.service.ts` | fetchProfile, modifyProfile |
| `dashboard.service.ts` | getDashboardSummary (aggregated counts, profile, recommendations, notifications, updates via Promise.allSettled) |
| `notifications.service.ts` | fetchUserNotifications, readNotification, markReadAll, deleteNotification |
| `saved-items.service.ts` | fetchSavedItems, saveItem, deleteSavedItem, checkSavedItem |
| `admin.service.ts` | Extensive CRUD for content items, collected data workflow (approve, reject, publish, unpublish, delete, edit) with fallback column detection |
| `collector.service.ts` | RSS/Scraper/PDF collection orchestration, stats, text processing |

### 5.6 Repository Layer

Repositories interact directly with Supabase. All repositories are in `backend/src/repositories/`:

| Repository | Key Functions | Table(s) |
|---|---|---|
| `auth.repository.ts` | registerUser, authenticateUser, findUserById, signOutUser, updateUserProfile, syncAuthenticatedUser | `users`, `user_profiles` |
| `scheme.repository.ts` | getAllSchemes (paginated/filtered/sorted/search), getSchemeById | `schemes` |
| `scholarship.repository.ts` | getAllScholarships, getScholarshipById | `scholarships` |
| `job.repository.ts` | getAllJobs, getJobById | `jobs` |
| `exam.repository.ts` | getAllExams, getExamById | `exams` |
| `admin.repository.ts` | CRUD for admin items, stats, users, sources, admin actions | `schemes`, `scholarships`, `jobs`, `exams`, `users`, `sources`, `admin_actions` |
| `search.repository.ts` | searchAll (loads all content, maps to unified format) | `schemes`, `scholarships`, `jobs`, `exams` |
| `eligibility.repository.ts` | evaluateEligibility (rule-based) | In-memory |
| `recommendation.repository.ts` | fetchRecommendations, generateRecommendationsForUser, markRecommendationViewed | `recommendations`, `eligibility_rules`, `schemes`, `scholarships`, `jobs`, `exams` |
| `collected-data.repository.ts` | CRUD for collected data, dedup check, bulk insert, source management | `collected_data`, `sources` |
| `saved-items.repository.ts` | listSavedItems, addSavedItem, removeSavedItem, findSavedItem | `saved_items` |
| `notifications.repository.ts` | getNotificationsForUser, markNotificationAsRead, markAllNotificationsRead, deleteNotification, countUnreadNotifications | `notifications` |
| `audit.repository.ts` | insertAdminAuditLog | `admin_audit_logs` |

### 5.7 Validation Layer (Zod Schemas)

All validators are in `backend/src/validators/`:

| Validator | Purpose |
|---|---|
| `query.validator.ts` | Pagination, sorting, filtering, search parameters |
| `auth.validator.ts` | Registration, login, profile update, user ID param |
| `admin.validator.ts` | Item params, review body, publish body, collected data edit, user role update |
| `common.validator.ts` | Generic ID param |
| `eligibility.validator.ts` | Eligibility check input |
| `notifications.validator.ts` | Notification ID, query params |
| `profile.validator.ts` | Profile creation and update with field normalization |
| `recommendation.validator.ts` | Recommendation queries, ID params |
| `saved-items.validator.ts` | Save item body, check params, user ID params |
| `search.validator.ts` | Search query params |

### 5.8 Environment Configuration (`backend/src/config/env.ts`)

Uses Zod for validation. Fails fast on startup if env vars missing.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `PORT` | No | `5001` | Server port |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS origin |
| `SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | — | Anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Service role key (admin operations) |
| `JWT_SECRET` | **Yes** (min 32 chars) | — | Used for JWT verification |
| `DATA_GOV_API_KEY` | No | — | For Data.gov API collector |
| `ENABLE_COLLECTOR_CRON` | No | `false` | Enable daily collector cron job |

---

## 6. API Documentation

### 6.1 Standard Response Format

```json
{
  "success": true,
  "message": "Schemes fetched successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Invalid authentication token",
  "error": "Expired authentication token"
}
```

### 6.2 Complete API Endpoint Reference

#### Authentication Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login with email/password |
| `POST` | `/api/auth/logout` | Yes | Logout current session |
| `GET` | `/api/auth/me` | Yes | Get current user profile |
| `PATCH` | `/api/auth/profile` | Yes | Update own profile |
| `GET` | `/api/auth/:id` | No | Get user profile by ID |

#### Content Endpoints (Public)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/schemes` | No | List schemes (paginated, filtered, sorted) |
| `GET` | `/api/schemes/:id` | No | Get scheme by ID |
| `GET` | `/api/scholarships` | No | List scholarships |
| `GET` | `/api/scholarships/:id` | No | Get scholarship by ID |
| `GET` | `/api/jobs` | No | List jobs |
| `GET` | `/api/jobs/:id` | No | Get job by ID |
| `GET` | `/api/exams` | No | List exams |
| `GET` | `/api/exams/:id` | No | Get exam by ID |

**Content List Query Parameters:**
- `page` (number, default 1)
- `limit` (number, default 10, max 100)
- `search` (string, searches title/description/search_text)
- `state` (string filter)
- `category` (string filter)
- `sortBy` (`created_at` | `updated_at` | `deadline` | `title`)
- `sortOrder` (`asc` | `desc`, default `desc`)

#### Search & Eligibility

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search` | No | Search across all content types |
| `POST` | `/api/eligibility` | No | Check eligibility (rule-based) |

**Search Parameters:** `query`, `page`, `limit`

**Eligibility Body:**
```json
{
  "age": 25,
  "state": "Maharashtra",
  "income": 300000,
  "education": "Graduate",
  "occupation": "Student"
}
```

#### Recommendations (Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/recommendations` | List recommendations (paginated) |
| `POST` | `/api/recommendations/generate` | Generate/regenerate recommendations |
| `GET` | `/api/recommendations/:itemType` | Get recommendations by type |
| `PATCH` | `/api/recommendations/:id/viewed` | Mark recommendation as viewed |

#### Profile (Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/profile/me` | Get own profile |
| `GET` | `/api/profile` | Get own profile |
| `POST` | `/api/profile` | Create profile |
| `PUT` | `/api/profile` | Update profile |
| `PATCH` | `/api/profile` | Update profile |
| `GET` | `/api/profile/:id` | Get profile by ID |

> ⚠️ **Note:** Duplicate profile routes exist (`/api/profile` and `/api/auth/profile`). `/api/auth/profile` is the primary route used by the frontend auth API.

#### Notifications (Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications` | List notifications |
| `GET` | `/api/notifications/unread-count` | Get unread count |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read |
| `PATCH` | `/api/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/notifications/:id` | Delete notification |

#### Saved Items (Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/saved` | List saved items |
| `POST` | `/api/saved` | Save an item |
| `DELETE` | `/api/saved/:id` | Remove saved item by ID |
| `DELETE` | `/api/saved/item/:itemType/:itemId` | Remove saved item by item |
| `GET` | `/api/saved/:itemType/:itemId/check` | Check if item is saved |

#### Dashboard (Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Aggregated dashboard data |

#### Admin Endpoints (Auth Required + Admin/Moderator Role)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Get admin statistics |
| `GET` | `/api/admin/users` | List all users |
| `PATCH` | `/api/admin/users/:userId/role` | Update user role (requires confirm for self-demotion) |
| `GET` | `/api/admin/sources` | List data sources |
| `PATCH` | `/api/admin/sources/:id/verify` | Verify a source |
| `GET` | `/api/admin/updates` | List content updates |
| `GET` | `/api/admin/collected-data` | List collected data (paginated, filterable by status) |
| `GET` | `/api/admin/collected-data/:id` | Get collected data item |
| `PATCH` | `/api/admin/collected-data/:id/approve` | Approve collected data |
| `PATCH` | `/api/admin/collected-data/:id/reject` | Reject collected data |
| `PATCH` | `/api/admin/collected-data/:id/edit` | Edit collected data |
| `PATCH` | `/api/admin/collected-data/:id/publish` | Publish to public table |
| `PATCH` | `/api/admin/collected-data/:id/unpublish` | Unpublish from public table |
| `PATCH` | `/api/admin/collected-data/:id/delete` | Soft-delete collected data |
| `GET` | `/api/admin/pending` | Pending items (from collected_data) |
| `GET` | `/api/admin/approved` | Approved items (from collected_data) |
| `GET` | `/api/admin/rejected` | Rejected items (from collected_data) |
| `GET` | `/api/admin/published` | Published items (from collected_data) |
| `GET` | `/api/admin/items/:status` | Items by status (from collected_data) |
| `GET` | `/api/admin/items/:itemType/:itemId` | Get item by type and ID |
| `PATCH` | `/api/admin/items/:itemType/:itemId/approve` | Approve item |
| `PATCH` | `/api/admin/items/:itemType/:itemId/reject` | Reject item |
| `PATCH` | `/api/admin/items/:itemType/:itemId/publish` | Publish item |
| `PATCH` | `/api/admin/items/:itemType/:itemId/unpublish` | Unpublish item |
| `PATCH` | `/api/admin/items/:itemType/:itemId/expire` | Expire item |
| `PATCH` | `/api/admin/items/:itemType/:itemId` | Update item |
| `DELETE` | `/api/admin/items/:itemType/:itemId` | Delete item |

Plus redundant plural routes (`/schemes/:id`, `/scholarships/:id`, etc.) under `/api/admin` for backward compatibility.

#### Collector Endpoints (Unauthenticated — security risk)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/collectors/status` | Collector status |
| `GET` | `/api/collectors/stats` | Collector statistics |
| `GET` | `/api/collectors/collected-data` | List collected data |
| `POST` | `/api/collectors/process` | Process raw data |
| `POST` | `/api/collectors/clean` | Clean text |
| `POST` | `/api/collectors/classify` | Classify text |
| `POST` | `/api/collectors/run-all` | Run all collectors |
| `POST` | `/api/collectors/rss` | Run all RSS collectors |
| `POST` | `/api/collectors/rss/pib` | Run PIB RSS collector |
| `POST` | `/api/collectors/rss/employment` | Run Employment News RSS |
| `POST` | `/api/collectors/rss/:sourceName` | Run RSS by source name |
| `POST` | `/api/collectors/scrape/:sourceName` | Run website scraper |
| `POST` | `/api/collectors/pdf` | Extract PDF |

---

## 7. Database Schema

### 7.1 Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ user_profiles : has
    users ||--o{ saved_items : saves
    users ||--o{ notifications : receives
    users ||--o{ recommendations : gets
    users ||--o{ admin_actions : performs
    users ||--o{ admin_audit_logs : performs
    
    sources ||--o{ collected_data : provides
    sources ||--o{ schemes : sources
    sources ||--o{ scholarships : sources
    sources ||--o{ jobs : sources
    sources ||--o{ exams : sources
    
    collected_data ||--o| schemes : publishes_to
    collected_data ||--o| scholarships : publishes_to
    collected_data ||--o| jobs : publishes_to
    collected_data ||--o| exams : publishes_to
    
    schemes ||--o{ saved_items : referenced_in
    scholarships ||--o{ saved_items : referenced_in
    jobs ||--o{ saved_items : referenced_in
    exams ||--o{ saved_items : referenced_in
    
    schemes ||--o{ recommendations : referenced_in
    scholarships ||--o{ recommendations : referenced_in
    jobs ||--o{ recommendations : referenced_in
    exams ||--o{ recommendations : referenced_in
```

### 7.2 Tables

Schema inferred from repository queries. **No formal migration scripts exist.**

#### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Matches Supabase Auth user ID |
| `email` | TEXT | |
| `full_name` | TEXT | |
| `role` | TEXT | `user` / `admin` / `moderator` |
| `age` | INTEGER | Optional |
| `annual_income` | NUMERIC | Optional |
| `preferred_language` | TEXT | Optional |
| `profile_completed` | BOOLEAN | Calculated from field completeness |
| `profile_completion_percentage` | INTEGER | 0-100 |
| `missing_profile_fields` | TEXT[] | Array of missing field names |
| `city` | TEXT | Optional |
| `state` | TEXT | Optional |
| `category` | TEXT | Optional |
| `dob` | DATE | Optional |
| `education_level` | TEXT | Optional |
| `occupation` | TEXT | Optional |
| `user_type` | TEXT | Optional |
| `income_range` | TEXT | Optional |
| `gender` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

#### `user_profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK→users) | |
| `state` | TEXT | |
| `category` | TEXT | General/OBC/SC/ST |
| `dob` | DATE | |
| `education_level` | TEXT | |
| `occupation` | TEXT | |
| `user_type` | TEXT | |
| `income_range` | TEXT | |
| `gender` | TEXT | |
| `preferred_language` | TEXT | Default: `hinglish` |
| `profile_completed` | BOOLEAN | Calculated from field completeness |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

#### `schemes`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `title` | TEXT | |
| `description` | TEXT | |
| `category` | TEXT | |
| `state` | TEXT | |
| `provider` | TEXT | |
| `benefit` | TEXT | |
| `eligibility` | TEXT | |
| `deadline` | DATE | |
| `status` | TEXT | `active` / `inactive` |
| `verification_status` | TEXT | `pending` / `approved` / `rejected` / `published` / `expired` |
| `official_url` | TEXT | |
| `apply_url` | TEXT | |
| `source_url` | TEXT | |
| `search_text` | TEXT | Full-text search index |
| `source_id` | UUID (FK→sources) | |
| `approved_by` | UUID (FK→users) | |
| `approved_at` | TIMESTAMPTZ | |
| `is_expired` | BOOLEAN | |
| `expired_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

#### `scholarships`, `jobs`, `exams`
Same base structure as `schemes` with content-type-specific columns:
- **scholarships:** `education_level`, `amount`, `rejection_reason`
- **jobs:** `department`, `qualification`, `vacancies`, `rejection_reason`
- **exams:** `exam_name`, `conducting_body`, `notification_date`, `application_start_date`, `application_end_date`, `admit_card_date`, `result_date`, `rejection_reason`

#### `collected_data`
Full schema in `backend/src/repositories/collected-data.repository.ts`. Key columns: `id`, `source_id`, `raw_title`, `raw_content`, `raw_url`, `collection_method`, `processing_status`, `verification_status` (pending/approved/rejected/published), `item_type`, `published_item_id`, `is_deleted`, audit fields (approved_by, rejected_by, published_by, etc.), timestamps.

#### `saved_items`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK→users) | |
| `item_id` | UUID | References any content table |
| `item_type` | TEXT | `scheme` / `scholarship` / `job` / `exam` |
| `saved_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

#### `notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK→users) | |
| `title` | TEXT | |
| `message` | TEXT | |
| `is_read` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

#### `recommendations`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK→users) | |
| `item_id` | UUID | |
| `item_type` | TEXT | `scheme` / `scholarship` / `job` / `exam` |
| `reason` | TEXT | Human-readable match reason |
| `match_score` | NUMERIC | 0-100 |
| `is_viewed` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

#### `admin_actions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `admin_id` | UUID (FK→users) | |
| `item_id` | UUID | |
| `item_type` | TEXT | |
| `action` | TEXT | `approve` / `reject` / `publish` / `unpublish` / `delete` |
| `detail` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

#### `admin_audit_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `admin_id` | TEXT | |
| `action` | TEXT | |
| `entity_type` | TEXT | |
| `entity_id` | TEXT | |
| `previous_status` | TEXT | |
| `new_status` | TEXT | |
| `changed_fields` | JSONB | |
| `reason` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

#### `sources`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `source_name` | TEXT | PIB, Employment News, MyGov, India.gov, SSC, etc. |
| `source_url` | TEXT | |
| `source_type` | TEXT | `rss` / `website` / `api` / `pdf` |
| `is_verified` | BOOLEAN | |
| `trust_score` | NUMERIC | |
| `verified_by` | UUID (FK→users) | |
| `verified_at` | TIMESTAMPTZ | |
| `last_checked_at` | TIMESTAMPTZ | |

#### `eligibility_rules`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `item_id` | UUID | |
| `item_type` | TEXT | |
| `state` | TEXT | |
| `category` | TEXT | |
| `gender` | TEXT | |
| `education_level` | TEXT | |
| `occupation` | TEXT | |
| `user_type` | TEXT | |
| `income_range` | TEXT | |
| `min_age` | INTEGER | |
| `max_age` | INTEGER | |

#### `content_updates`
Referenced in admin service, full schema not defined in code.

---

## 8. Authentication Flow

### 8.1 Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS as Next.js (Frontend)
    participant Supabase
    participant Express as Express (Backend)
    participant DB as Supabase DB

    Note over User,DB: Registration
    User->>Browser: Fill registration form
    Browser->>NextJS: POST /api/auth/register (via apiClient)
    NextJS->>Express: POST /api/auth/register {email, password, full_name}
    Express->>Supabase: supabaseAuth.auth.signUp()
    Supabase-->>Express: Auth user created
    Express->>DB: INSERT INTO users (id, email, full_name, role="user")
    Express->>DB: INSERT INTO user_profiles (user_id, profile_completed=false)
    Express-->>NextJS: { user: UserProfile, access_token }
    NextJS->>Browser: Save token to localStorage, redirect to /profile/setup

    Note over User,DB: Login
    User->>Browser: Enter credentials
    Browser->>NextJS: POST /api/auth/login (via apiClient)
    NextJS->>Express: POST /api/auth/login {email, password}
    Express->>Supabase: supabaseAuth.auth.signInWithPassword()
    Supabase-->>Express: { session, user }
    Express->>DB: Query users + user_profiles
    Express-->>NextJS: { access_token, refresh_token, user }
    NextJS->>Browser: Save token to localStorage, redirect

    Note over User,DB: Authenticated Request
    Browser->>NextJS: GET /api/dashboard/summary
    NextJS->>Express: GET /api/dashboard/summary (Authorization: Bearer <token>)
    Express->>Supabase: supabaseAuth.auth.getUser(token)
    Supabase-->>Express: { user }
    Express->>DB: syncAuthenticatedUser(user)
    Express->>DB: Query dashboard data
    Express-->>NextJS: Dashboard response
    NextJS-->>Browser: Render dashboard with SWR caching

    Note over User,DB: Token Expiry
    NextJS->>Express: Request with expired token
    Express->>Supabase: auth.getUser(expired token)
    Supabase-->>Express: Error: JWT expired
    Express-->>NextJS: 401 - Expired authentication token
    NextJS->>NextJS: Verify session via GET /api/auth/me
    Note over NextJS: If invalid, redirect to /login?next=<original_path>
    NextJS-->>Browser: Redirect to /login
```

### 8.2 Auth Implementation Details

1. **Frontend:** `AuthProvider.tsx` manages Supabase session via `onAuthStateChange` listener, with an 800ms timeout
2. **Token Storage:** JWT stored in localStorage under `bharatlens_auth_token` key
3. **Token Injection:** `apiClient.ts` retrieves token from Supabase session (primary) or localStorage (fallback)
4. **Backend Verification:** `auth.middleware.ts` calls `supabaseAuth.auth.getUser(token)` on every authenticated request
5. **User Sync:** After verifying token, `syncAuthenticatedUser()` ensures local `users` and `user_profiles` records exist
6. **Logout:** Calls Supabase signOut, clears localStorage, redirects to `/login?signed_out=1`
7. **OAuth Callback:** `frontend/app/auth/callback/route.ts` handles Google OAuth, exchanges code for session, checks profile completion, redirects accordingly
8. **Password Reset:** Handled via Supabase's built-in password reset flow

### 8.3 Auth Guard Layers

```
Layered Protection:
1. proxy.ts (Next.js Middleware):
   - Protects routes matching protectedPrefixes
   - Redirects to /login if no session
   - Redirects auth pages to /dashboard if authenticated
   - Skips auth callback paths

2. (main)/layout.tsx (Client-side):
   - Shows skeleton while auth is loading (removed old "Loading..." spinner)
   - Redirects to /login if no session
   - Fetches /api/auth/me for profile completion check
   - Redirects complete profiles away from /profile/setup

3. (auth)/layout.tsx (Client-side):
   - Shows skeleton while auth is loading
   - Redirects authenticated users to /dashboard

4. admin/layout.tsx (Client-side):
   - Shows skeleton while auth/role is loading
   - Checks for admin/moderator role
   - Redirects non-admin users to /
```

### 8.4 CORS Configuration

```typescript
app.use(cors({
  origin: [env.FRONTEND_URL, "http://localhost:3001"],
  credentials: true,
}));
```

---

## 9. Admin Workflow

### 9.1 Content Moderation Flow

```mermaid
stateDiagram-v2
    [*] --> Collected: RSS/Scraper/PDF
    Collected --> Pending: Processing
    
    state AdminReview <<choice>>
    Pending --> AdminReview: Admin reviews item
    
    AdminReview --> Approved: Admin approves
    AdminReview --> Rejected: Admin rejects (with reason)
    
    Approved --> Published: Admin publishes to public table
    Published --> Unpublished: Admin unpublishes
    
    Approved --> Expired: Admin expires
    Published --> Expired: Admin expires
    
    Rejected --> [*]
    Expired --> [*]
    Unpublished --> [*]
```

### 9.2 Collected Data Pipeline

1. **Collection:** External sources → `collected_data` table with `verification_status = "pending"`
2. **Review:** Admin can view, edit, approve, or reject collected data
3. **Approval:** Sets `verification_status = "approved"`, records `approved_by` and `approved_at`
4. **Rejection:** Requires `rejection_reason`, sets `verification_status = "rejected"`, records `rejected_by` and `rejected_at`
5. **Publishing:** Admin selects item type, provides optional payload overrides, publishes to the corresponding public table (schemes/scholarships/jobs/exams)
6. **Publishing Logic:** `admin.service.ts` has sophisticated fallback:
   - Normalizes titles from 5+ sources
   - Normalizes URLs from 10+ sources
   - Filters payload to allowed columns per table (defined in `PUBLIC_TABLE_ALLOWED_COLUMNS`)
   - Detects missing columns and retries without them
   - Finds existing published records by URL or title to avoid duplicates
   - Requires `source_id` to be present
   - Validates required fields per item type (e.g., category for schemes, department for jobs)
7. **Unpublishing:** Deletes from public table, resets `collected_data` status to "approved"
8. **Audit Trail:** Every action logged to `admin_actions` and `admin_audit_logs`

### 9.3 Admin Frontend Pages

| Page | Route | Fetches |
|---|---|---|
| Admin Dashboard | `/admin` | Stats from `/api/admin/stats` |
| Data Verification | `/admin/verification` | Pending items from `/api/admin/collected-data?status=pending` |
| Published Content | `/admin/published` | Published items from `/api/admin/items/published` |
| Approved Items | `/admin/approved` | Approved items from `/api/admin/items/approved` |
| Rejected Items | `/admin/rejected` | Rejected items from `/api/admin/items/rejected` |
| Users | `/admin/users` | All users from `/api/admin/users` |
| Sources | `/admin/sources` | All sources from `/api/admin/sources` |
| Updates | `/admin/updates` | Content updates from `/api/admin/updates` |
| Analytics | `/admin/analytics` | Stats from `/api/admin/stats` |

### 9.4 Admin Route Conventions

Two path conventions coexist:
1. `/api/admin/items/:itemType/:itemId/...` — canonical singular form with `items/` prefix
2. `/api/admin/schemes/:id/...`, `/api/admin/scholarships/:id/...`, etc. — plural form (with `injectItemType` middleware for backward compatibility)

---

## 10. Recommendation Engine

### 10.1 Architecture

```mermaid
flowchart TD
    A[User Profile] --> B{Generate Recommendations}
    B --> C[Fetch Eligibility Rules<br/>from eligibility_rules table]
    B --> D[Fetch All Content<br/>from schemes, scholarships,<br/>jobs, exams]
    B --> E[Delete Old<br/>Recommendations]
    
    C --> F[Score Each Item]
    D --> F
    
    F --> G{Score >= 30?}
    G -->|Yes| H[Add to Candidates]
    G -->|No| I[Skip]
    
    H --> J[Insert into<br/>recommendations table]
    J --> K[Sort by Score DESC]
    K --> L[Return Recommendations]
```

### 10.2 Scoring Algorithm

The `getMatchScore` function (`recommendation.repository.ts`) calculates a 0-100 score using static rules:

| Criterion | Max Points | Matching Logic |
|---|---|---|
| **State Match** | 20 | "All India" matches any state; otherwise exact match |
| **Category Match** | 20 | "General" matches any category; otherwise exact match |
| **Education Match** | 15 | Supports mappings like "Bachelor Degree" ↔ "Graduate" |
| **Income Eligible** | 20 | User income ≤ item income_threshold |
| **Gender Match** | 10 | Exact match |
| **Occupation Match** | 10 | Exact match |
| **Age Eligible** | 15 | Age from DOB between min_age and max_age |
| **Deadline Active** | 10 | Deadline is null or ≥ today |

**Threshold:** Items scoring ≥ 30 are recommended. Maximum score is 100.

### 10.3 Key Implementation Details

- **`generateRecommendationsForUser()`** (`recommendation.repository.ts`):
  1. Deletes all existing recommendations for the user
  2. Fetches eligibility rules from `eligibility_rules` table
  3. Fetches all approved/published content (up to 1000 each via `getAllSchemes`/`getAllScholarships`/`getAllJobs`/`getAllExams`)
  4. Scores every item against the user's profile
  5. Inserts qualifying items (score ≥ 30) into `recommendations` table
  6. Returns sorted by match_score descending

- **Eligibility Rules:** Optional rules stored in `eligibility_rules` table can override item-level criteria
- **Filtering:** Only items with `verification_status = "approved"` or `"published"` are included
- **Title/Description Storage:** `recommendations` table doesn't store item title/description; these are fetched at display time

### 10.4 Known Issues

1. **Inefficient for large datasets:** Loads ALL content (up to 1000 per type) into memory for scoring
2. **No caching:** Recommendations regenerated from scratch each time
3. **No incremental updates:** New content doesn't automatically trigger recommendation refresh
4. **Simple text matching:** No NLP/ML-based semantic matching despite being called "AI"
5. **Rule engine is basic:** Static rules with hardcoded weights, no model training

---

## 11. Data Collection Workflow

### 11.1 Collector Architecture

```mermaid
flowchart LR
    subgraph "Scheduled (node-cron)"
        DC[Daily Collector Job<br/>initDailyCollectorJob]
    end
    
    subgraph "Manual / API"
        MC[Trigger via<br/>API endpoints]
    end
    
    DC --> RC[Run All Collectors]
    MC --> RC
    
    RC --> RSS[Run RSS Collectors]
    RC --> SC[Run Website Scrapers]
    RC --> PDF[Run PDF Extraction]
    
    RSS --> PIB[PIB RSS]
    RSS --> EMP[Employment News RSS]
    RSS --> MYG[MyGov RSS]
    RSS --> IND[India.gov RSS]
    
    SC --> SSC[SSC Website]
    SC --> UPSC[UPSC Website]
    SC --> NTA[NTA Website]
    SC --> AICTE[AICTE Website]
    SC --> UGC[UGC Website]
    SC --> RRB[RRB Website]
    
    PDF --> PDFExt[Extract PDF<br/>from URL]
    
    PIB --> CD[(collected_data table)]
    EMP --> CD
    MYG --> CD
    IND --> CD
    SSC --> CD
    UPSC --> CD
    NTA --> CD
    AICTE --> CD
    UGC --> CD
    RRB --> CD
    PDFExt --> CD
```

### 11.2 Collector Types

#### RSS Collectors
| Collector | Source | URL |
|---|---|---|
| PIB | Press Information Bureau | `https://pib.gov.in/RssMain.aspx` |
| Employment News | Employment News | `https://employmentnews.gov.in/RssFeed.aspx` |
| MyGov | MyGov | `https://www.mygov.in/feed/` |
| India.gov | India.gov | `https://www.india.gov.in/app/newsfeed/en/rss` |

**Process:** Fetch RSS → Parse with rss-parser → Clean text → Dedup by URL → Bulk insert to `collected_data`

#### Website Scrapers
| Scraper | Target Sources |
|---|---|
| SSC | Staff Selection Commission |
| UPSC | Union Public Service Commission |
| NTA | National Testing Agency |
| AICTE | All India Council for Technical Education |
| UGC | University Grants Commission |
| RRB | Railway Recruitment Board |

**Process:** Fetch HTML with Axios → Parse with Cheerio → Extract links → Filter useful government items → Dedup → Bulk insert

#### PDF Extractor
- Downloads PDF from URL, extracts text using pdf-parse, stores in `collected_data`
- Can infer source from URL hostname (e.g., `ugc.ac.in` → "UGC")

#### API Collector (Placeholder)
- **`data-gov.collector.ts`** — Placeholder for Data.gov API
- Not functional — requires `DATA_GOV_API_KEY` and returns empty results

### 11.3 Scheduling

- **`daily-collector.job.ts`** — Uses `node-cron` with expression `0 0 * * *` (midnight daily)
- **Enabled by:** `ENABLE_COLLECTOR_CRON=true` environment variable
- **Trigger:** Also available via API endpoints (`POST /api/collectors/run-all`)

### 11.4 Deduplication

- **Exact URL dedup:** Checks `raw_url` against existing entries in `collected_data` table
- **Title similarity:** `areTitlesSimilar()` function in `duplicate-detector.service.ts` compares normalized titles (exact match only)
- **Note:** The `ai/duplicate-detector.service.ts` is defined but NOT actually used in the collector pipeline — basic collectors do their own URL-based dedup

---

## 12. AI Services

Despite being called "AI-powered", the AI services are **rule-based** — no ML/NLP models are used.

### 12.1 Text Classifier (`backend/src/ai/classifier.service.ts`)

```typescript
const keywordMap = {
  scheme: ["scheme", "yojana", "yatna", "subsidy"],
  scholarship: ["scholarship", "fellowship", "financial assistance", "grant"],
  job: ["recruitment", "vacancy", "job", "hiring", "career"],
  exam: ["exam", "admit card", "result", "cut off", "answer key"],
  notification: ["notification", "application", "last date", "deadline"],
};
```

Simple keyword matching — not ML/NLP.

### 12.2 Data Cleaner (`backend/src/ai/data-cleaner.service.ts`)

- Removes HTML tags via regex
- Normalizes whitespace
- Truncates to `pdfMaxContentLength` (120,000 chars)

### 12.3 Duplicate Detector (`backend/src/ai/duplicate-detector.service.ts`)

- `isExactDuplicate()` — checks URL against existing URLs
- `areTitlesSimilar()` — compares normalized (cleaned, lowercased) titles (exact match comparison)
- **Not actually used in collector pipeline** — collectors use their own URL-based dedup

### 12.4 Chatbot Page

- Route exists: `/chatbot` under `frontend/app/(main)/chatbot/page.tsx`
- Frontend UI exists with message bubbles and layout
- **Backend chatbot API is NOT implemented** — no chatbot routes, controllers, or services exist
- The frontend page renders but cannot send messages to any backend endpoint

---

## 13. Loading Strategy

### 13.1 Design Principles

| Use Case | Loading Component | Standard |
|---|---|---|
| **Page initial load** (auth check, route transition) | Skeleton matching page layout | No full-page spinner |
| **List/card loading** (schemes, jobs, etc.) | CardSkeleton (repeating cards) | Grid of grey placeholder cards |
| **Dashboard loading** | DashboardSkeleton (hero + stats + content) | Full-page skeleton matching dashboard layout |
| **Detail page loading** (scheme/[id], etc.) | DetailLoading (skeleton with header + sections) | Content-matched skeleton |
| **Search/filter changes** | CardSkeleton | Transient loading while fetching new results |
| **Save/Unsave action** | Spinner on the save button | Small inline spinner, 16px |
| **Delete/Remove action** | Spinner on the action button | Small inline spinner with "Removing..." text |
| **Form submit** (login, register, profile setup) | Spinner on submit button + disabled state | Button shows "Saving...", form disabled |
| **Pagination** | Dependent: skeleton if full refresh, else instant page change | Page change triggers skeleton with `keepPreviousData` |
| **Back navigation** (returning to a page) | Cached data shown instantly | SWR provides cached data, background refresh only if stale |

### 13.2 Caching Strategy (SWR)

- **Default `dedupingInterval`:** 5000ms (prevents duplicate requests within 5 seconds)
- **`revalidateOnFocus`:** `false` (prevents refetch on tab focus — avoids flicker)
- **`revalidateOnReconnect`:** `false`
- **`shouldRetryOnError`:** `false`
- **`keepPreviousData`:** `true` for paginated lists (shows stale data while loading new page)
- **Search/list pages:** Use `SEARCH_SWR_CONFIG` with 2000ms deduping for faster response to filter changes

### 13.3 Layout Loading Changes

- **(main)/layout.tsx**: Shows page-area skeleton while auth is loading (replaced full-page "Loading..." centered spinner)
- **(auth)/layout.tsx**: Shows auth page skeleton (matching the two-column auth layout) while auth is loading
- **admin/layout.tsx**: Shows admin layout skeleton (sidebar + header + content area) while auth/role is loading
- **Page skeletons are specific to each page type** — DashboardSkeleton for dashboard, CardSkeleton for lists, DetailLoading for detail pages

### 13.4 What Was Removed

- Global centered "Loading..." spinner from all three layouts
- Duplicate loading states (layout spinner + page skeleton both showing)
- Unnecessary `authLoading` checks in page components (recommendations page)

---

## 14. Deployment Guide

### 14.1 Environment Variables

#### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Backend (`backend/.env`)
```bash
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
JWT_SECRET=<32-char-min-secret>
DATA_GOV_API_KEY=<optional>
ENABLE_COLLECTOR_CRON=false
```

### 14.2 Local Development

**Backend:**
```bash
cd backend
cp .env.example .env   # Edit with your values
npm install
npm run dev            # ts-node-dev with hot reload on port 5001
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev            # Next.js dev server on 0.0.0.0:3000
```

### 14.3 Production Build

**Backend:**
```bash
cd backend
npm run build          # tsc → dist/
npm start              # node dist/server.js
```

**Frontend:**
```bash
cd frontend
npm run build          # next build
npm start              # next start
```

### 14.4 API Base URL Resolution

The frontend resolves the backend API URL in this order:
1. `NEXT_PUBLIC_API_BASE_URL`
2. `NEXT_PUBLIC_API_URL`
3. `http://localhost:5001/api` (fallback)

### 14.5 Common Deployment Errors

1. **Missing env vars:** Backend fails immediately with Zod validation error showing which vars are missing
2. **CORS errors:** Frontend must have `NEXT_PUBLIC_API_BASE_URL` or backend must have `FRONTEND_URL` configured correctly
3. **Supabase connection:** Verify `SUPABASE_URL` is reachable and service role key has appropriate permissions
4. **JWT validation:** `JWT_SECRET` must match the one used by Supabase project (check Supabase dashboard → Settings → API)
5. **Collector cron:** Set `ENABLE_COLLECTOR_CRON=true` only if you want automatic daily data collection
6. **Production vs development:** Collector routes (unauthenticated) and test-db route are accessible in production — ensure proper network restrictions

---

## 15. Security Analysis

### 15.1 Implemented Security Measures

| Measure | Implementation |
|---|---|
| **JWT Authentication** | Bearer token verified with Supabase Auth |
| **Role-based Access** | Admin/Moderator role middleware |
| **Input Validation** | Zod schemas on all request inputs |
| **SQL Injection** | Supabase client uses parameterized queries |
| **CORS** | Restricted to FRONTEND_URL and localhost:3001 |
| **Helmet** | HTTP security headers with strict CSP |
| **Request Size Limit** | 1MB body limit |
| **XSS** | React's built-in escaping + Helmet |
| **Soft Delete** | `is_deleted` flag instead of hard delete for collected data |
| **Audit Trail** | Admin actions logged to `admin_actions` and `admin_audit_logs` |
| **Rate Limiting** | Three tiers: 100/10/100 req/min (api/auth/admin) |

### 15.2 Security Risks & Issues

| Severity | Issue | Location | Status |
|---|---|---|---|
| **HIGH** | JWT stored in localStorage (XSS-vulnerable) | `frontend/lib/api/client.ts` | ⚠️ Open |
| **MEDIUM** | Collector endpoints have NO auth protection | `backend/src/routes/collector.routes.ts` | ⚠️ Open |
| **MEDIUM** | PDF extraction endpoint has NO auth | `backend/src/routes/pdf.routes.ts` | ⚠️ Open |
| **MEDIUM** | No CSRF protection | Express app | ⚠️ Open |
| **MEDIUM** | No input sanitization for HTML content | `backend/src/ai/data-cleaner.service.ts` | ⚠️ Open |
| **INFO** | OpenAPI spec served without auth | `backend/src/routes/docs.routes.ts` | ⚠️ Open |
| **INFO** | console.debug statements in production code | Multiple files | ⚠️ Open |

---

## 16. Performance Analysis

### 16.1 Bottlenecks

| Issue | Impact | Location |
|---|---|---|
| **No database pagination on admin queries** | Loads ALL items into memory | `admin.repository.ts` (status-based queries) |
| **Search loads ALL content** | Loads up to 4,000 items (4 types × 1000 limit) | `search.repository.ts` |
| **Recommendation generator loads ALL content** | Loads up to 4,000 items | `recommendation.repository.ts` |
| **Dashboard queries run in parallel** | Multiple DB calls but uses Promise.allSettled (good) | `dashboard.service.ts` |
| **No Redis/memory caching** | Every request hits the database | Throughout backend |
| **No database indexes documented** | Full table scans possible | Schema definition needed |

### 16.2 Optimization Recommendations

1. Add database indexes on: `verification_status`, `state`, `category`, `status`, `created_at`, `search_text`, `user_id`, `item_type`
2. Use Supabase full-text search instead of `ILIKE` patterns
3. Add Redis caching layer for frequently accessed content
4. Implement recommendation caching with incremental updates
5. Batch saved item data fetching with JOIN queries
6. Add connection pooling configuration for Supabase

---

## 17. Testing Status

### 17.1 Test Coverage

```
backend/tests/
└── controllers/
    └── admin-collected-data.test.ts   # Only test file
```

### 17.2 Test Analysis

| Aspect | Status | Details |
|---|---|---|
| **Backend unit tests** | ❌ Minimal | 1 test file for admin collected data endpoints |
| **Frontend tests** | ❌ None | No test files found |
| **Integration tests** | ❌ None | |
| **E2E tests** | ❌ None | |
| **API test scripts** | ⚠️ Partial | curl examples in `API_TESTING_GUIDE.md` |
| **Type checking** | ✅ Passes | Both frontend (`tsc --noEmit`) and backend (`tsc --noEmit`) |
| **Build** | ✅ Passes | Frontend `npm run build` succeeds with zero errors |
| **Lint** | ⚠️ Needs check | ESLint configured but not verified in this audit |

---

## 18. Known Issues & Technical Debt

### 18.1 Critical Issues

| # | Issue | Impact | Status |
|---|---|---|---|
| C1 | **Duplicate profile routes** (`/api/profile` and `/api/auth/profile`) | Confusion, potential inconsistencies | ⚠️ Open |
| C2 | **Dead hooks still in codebase** (`useProfile.ts`, `useSavedItems.ts`) | Code clutter | ⚠️ Open — should remove |
| C3 | **Admin routes have redundant plural patterns** | Code duplication, maintenance burden | ⚠️ Open |

### 18.2 Bugs

| # | Bug | Impact | Status |
|---|---|---|---|
| B1 | **Recommendation scoring inconsistency** — frontend displays match as percentage but backend stores as decimal | UI shows 0% for valid recommendations | ⚠️ Open |
| B2 | **Admin verification page not using SWR** | Refetches on every mount without caching | ⚠️ Open — uses raw useEffect |
| B3 | **Collector routes unauthenticated** | Anyone can trigger data collection | ⚠️ Open |

### 18.3 Technical Debt

| # | Item | Impact | Status |
|---|---|---|---|
| T1 | **No database migration scripts** | Schema changes must be manual | ⚠️ Open |
| T2 | **Hardcoded API URL fallback** | Breaks in non-local environments | ⚠️ Open |
| T3 | **Collector endpoints unauthenticated** | Security risk | ⚠️ Open |
| T4 | **Eligibility/recommendation engine is rule-based but branded "AI"** | Misleading | ⚠️ Open |
| T5 | **No proper logging system** | Cannot monitor production | ⚠️ Open |
| T6 | **No TypeScript path mapping for backend** | Long relative imports | ⚠️ Open |
| T7 | **Frontend `@/` alias not consistent** | Import style inconsistency | ⚠️ Open |
| T8 | **Dead hooks still present** (`useProfile.ts`, `useSavedItems.ts`) | Code clutter, confusion | ⚠️ Open |

### 18.4 Incomplete Features

| # | Feature | Status | Notes |
|---|---|---|---|
| F1 | **Data.gov API collector** | ❌ Placeholder only | Returns empty result; requires API key |
| F2 | **Chatbot backend API** | ❌ Not implemented | Frontend page exists but no backend |
| F3 | **Notifications creation** | ❌ No create API | Only read/update/delete endpoints exist |
| F4 | **Framer Motion animations** | ⚠️ Dependency present but barely used | Most animations done via CSS |

---

## 19. Final Audit Summary

| Area | Status | Notes |
|---|---|---|
| **Frontend Build** | ✅ PASS | `npm run build` succeeds, zero TypeScript errors |
| **Frontend Type-Check** | ✅ PASS | `tsc --noEmit` passes |
| **Backend Type-Check** | ✅ PASS | `tsc --noEmit` passes |
| **Backend Tests** | ❌ Minimal | 1 test file, low coverage |
| **Frontend Tests** | ❌ None | No tests |
| **Lint** | ⚠️ Partial | ESLint configured but not verified |
| **Auth Flow** | ✅ Functional | JWT + Supabase Auth, OAuth callback |
| **Admin Workflow** | ✅ Functional | Approve/reject/publish/unpublish/delete |
| **Recommendation Engine** | ⚠️ Basic | Rule-based scoring, no ML |
| **AI Services** | ⚠️ Basic | Rule-based classifier/cleaner/dedup |
| **Data Collection** | ✅ Functional | RSS, scraping, PDF extraction |
| **Chatbot** | ❌ Partial | Frontend only, no backend |
| **Caching (Frontend)** | ✅ Implemented | SWR with stale-while-revalidate |
| **Caching (Backend)** | ❌ None | No Redis/memory cache |
| **Rate Limiting** | ✅ Implemented | 3 tiers |
| **Security** | ⚠️ Partial | JWT in localStorage, collector routes open |
| **Production Readiness** | ⚠️ Not Ready | Needs testing, security fixes, logging, and caching |

---

## 20. Future Roadmap

### Phase 8: Production Hardening
- [ ] Add comprehensive test coverage (unit, integration, E2E)
- [ ] Implement proper logging (Pino/Winston)
- [ ] Add CSRF protection
- [ ] Move JWT to httpOnly cookies
- [ ] Implement database indexes
- [ ] Remove dead hooks (useProfile.ts, useSavedItems.ts)
- [ ] Protect collector endpoints with admin auth
- [ ] Protect PDF extraction endpoint with auth

### Phase 9: Performance Optimization
- [ ] Add Redis/memory caching layer
- [ ] Implement proper full-text search (PostgreSQL tsvector)
- [ ] Optimize recommendation engine with incremental updates
- [ ] Batch database queries (eliminate N+1 patterns)
- [ ] Add pagination to admin item queries
- [ ] Implement database connection pooling

### Phase 10: AI Enhancement
- [ ] Replace keyword classification with ML/NLP models
- [ ] Implement semantic search (embeddings + vector search)
- [ ] Build proper ML-based recommendation engine with user feedback loops
- [ ] Add natural language query support
- [ ] Implement document similarity for duplicate detection

### Phase 11: Feature Completion
- [ ] Build chatbot backend API
- [ ] Complete notification creation (when new content matches user profile)
- [ ] Implement email/WhatsApp notification delivery
- [ ] Add data.gov.in API integration
- [ ] Build mobile app (React Native?)

### Phase 12: DevOps & Infrastructure
- [ ] Dockerize both frontend and backend
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Set up staging environment
- [ ] Implement automatic DB migration scripts
- [ ] Add monitoring and alerting (Sentry, DataDog)
- [ ] Configure proper secrets management
- [ ] Set up CDN for static assets

---

## Appendix A: File Path Reference

### Frontend Key Files

| Role | File Path |
|---|---|
| Root Layout | `frontend/app/layout.tsx` |
| Landing Page | `frontend/app/page.tsx` |
| Global CSS | `frontend/app/globals.css` |
| Auth Provider | `frontend/components/auth/AuthProvider.tsx` |
| Site Header | `frontend/components/layout/SiteHeader.tsx` |
| Site Footer | `frontend/components/layout/SiteFooter.tsx` |
| App Shell | `frontend/components/layout/AppShell.tsx` |
| API Client | `frontend/lib/api/client.ts` |
| Auth API | `frontend/lib/api/auth-api.ts` |
| Content API | `frontend/lib/api/content-api.ts` |
| Dashboard API | `frontend/lib/api/dashboard-api.ts` |
| Admin API | `frontend/lib/api/admin.ts` |
| Admin Utils | `frontend/lib/api/admin-utils.ts` |
| SWR Hooks | `frontend/hooks/useApi.ts` |
| Supabase Client | `frontend/lib/supabase/client.ts` |
| Supabase Server | `frontend/lib/supabase/server.ts` |
| Auth URLs | `frontend/lib/auth/urls.ts` |
| Safe Origin | `frontend/lib/auth/safe-origin.ts` |
| Auth Debug | `frontend/lib/auth/debug.ts` |
| Auth Storage | `frontend/lib/auth/storage.ts` |
| Proxy/Middleware | `frontend/proxy.ts` |
| useAuth Hook | `frontend/hooks/useAuth.ts` |
| Config | `frontend/next.config.ts` |

### Backend Key Files

| Role | File Path |
|---|---|
| Server Entry | `backend/src/server.ts` |
| App Config | `backend/src/app.ts` |
| Env Config | `backend/src/config/env.ts` |
| Supabase Config | `backend/src/config/supabase.ts` |
| Collector Config | `backend/src/config/collector.config.ts` |
| Routes Index | `backend/src/routes/index.ts` |
| Auth Middleware | `backend/src/middlewares/auth.middleware.ts` |
| Role Middleware | `backend/src/middlewares/role.middleware.ts` |
| Validator Middleware | `backend/src/middlewares/validate.middleware.ts` |
| Rate Limit Middleware | `backend/src/middlewares/rate-limit.middleware.ts` |
| Error Middleware | `backend/src/middlewares/error.middleware.ts` |
| AppError Class | `backend/src/utils/app-error.ts` |
| API Response Helper | `backend/src/utils/response-helper.ts` |
| Request Handler | `backend/src/utils/async-handler.ts` |
| Recommendation Repository | `backend/src/repositories/recommendation.repository.ts` |
| Collected Data Repository | `backend/src/repositories/collected-data.repository.ts` |
| Admin Service | `backend/src/services/admin.service.ts` |
| Dashboard Service | `backend/src/services/dashboard.service.ts` |
| Text Classifier | `backend/src/ai/classifier.service.ts` |
| Data Cleaner | `backend/src/ai/data-cleaner.service.ts` |
| Duplicate Detector | `backend/src/ai/duplicate-detector.service.ts` |
| Daily Collector Job | `backend/src/jobs/daily-collector.job.ts` |
| OpenAPI Spec | `backend/src/docs/openapi.ts` |
| Content Status | `backend/src/constants/status.ts` |

---

## Appendix B: Quick Reference Commands

```bash
# Backend
cd backend && npm run dev          # Development server (hot reload)
cd backend && npm run build        # Production build (tsc)
cd backend && npm start            # Start production server
cd backend && npm test             # Run Jest tests
cd backend && npm run type-check   # TypeScript check (tsc --noEmit)

# Frontend
cd frontend && npm run dev          # Development server (0.0.0.0)
cd frontend && npm run dev:local    # Development server (localhost)
cd frontend && npm run build        # Production build (next build)
cd frontend && npm start            # Start production server
cd frontend && npm run lint         # ESLint
cd frontend && npm run type-check   # TypeScript check (tsc --noEmit)
```

---

> **Document generated from codebase analysis. Updated: June 2026. For questions or updates, refer to the project repository or open an issue.**
