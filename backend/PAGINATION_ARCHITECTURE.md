/**
 * BharatLens Backend - Production-Ready Pagination & Filtering System
 * Architecture & Implementation Guide
 */

// ============================================================================
// OVERVIEW
// ============================================================================

/**
 * This document describes the production-ready pagination, filtering, searching,
 * and sorting system implemented for all listing APIs in BharatLens backend.
 * 
 * Key Features:
 * - Type-safe query parameter validation using Zod
 * - Dynamic Supabase queries with filtering and searching
 * - Comprehensive pagination metadata (page, limit, total, totalPages, hasNextPage, hasPreviousPage)
 * - Search functionality across multiple columns (title, description, search_text)
 * - Filtering by state, category, status
 * - Sorting by created_at, updated_at, deadline, title
 * - Centralized error handling with meaningful error messages
 * - Performance optimized queries
 * - Security: parameter sanitization and whitelisting
 */

// ============================================================================
// ARCHITECTURE LAYERS
// ============================================================================

/**
 * Clean Architecture with 4 Layers:
 * 
 * 1. CONTROLLER LAYER
 *    - Receives HTTP requests
 *    - Parses and validates query parameters using parseListQuery()
 *    - Calls service layer with validated query
 *    - Returns consistent JSON response with pagination metadata
 * 
 * 2. SERVICE LAYER
 *    - Orchestrates business logic
 *    - Calls repository layer with query parameters
 *    - No database access directly
 *    - Handles cross-layer concerns
 * 
 * 3. REPOSITORY LAYER
 *    - Direct database access via Supabase
 *    - Implements pagination, filtering, searching, sorting
 *    - Builds dynamic queries based on parameters
 *    - Handles database errors
 *    - Returns ListResult<T> with items and pagination metadata
 * 
 * 4. UTILITY & VALIDATOR LAYER
 *    - Query types: src/types/query.types.ts
 *    - Query parser: src/utils/query-parser.ts
 *    - Query validators: src/validators/query.validator.ts
 *    - API response utilities: src/utils/api-response.ts
 *    - Error handling: src/utils/app-error.ts
 */

// ============================================================================
// FILE STRUCTURE
// ============================================================================

/**
 * New Files Created:
 * 
 * src/types/query.types.ts
 * ├─ PaginationParams interface
 * ├─ PaginationMeta interface (extended with totalPages, hasNextPage, hasPreviousPage)
 * ├─ SortParams interface
 * ├─ FilterParams interface
 * ├─ SearchParams interface
 * ├─ ListQuery type
 * ├─ ListResult<T> interface
 * ├─ AllowedSortColumns type
 * └─ AllowedFilterColumns type
 * 
 * src/validators/query.validator.ts
 * ├─ paginationSchema (Zod)
 * ├─ sortSchema (Zod)
 * ├─ filterSchema (Zod)
 * ├─ searchSchema (Zod)
 * ├─ listQuerySchema (merged schema)
 * └─ Exported types: PaginationInput, SortInput, FilterInput, SearchInput, ListQueryInput
 * 
 * src/utils/query-parser.ts
 * ├─ parseListQuery(req: Request) - parses and validates query parameters
 * ├─ calculatePaginationMeta() - calculates pagination metadata
 * └─ calculateOffset() - calculates database offset for pagination
 * 
 * Updated Files:
 * ├─ src/utils/api-response.ts (PaginationMeta extended)
 * ├─ src/repositories/scheme.repository.ts (new getAllSchemes signature)
 * ├─ src/repositories/scholarship.repository.ts (new getAllScholarships signature)
 * ├─ src/repositories/job.repository.ts (new getAllJobs signature)
 * ├─ src/repositories/exam.repository.ts (new getAllExams signature)
 * ├─ src/services/scheme.service.ts (passes query to repository)
 * ├─ src/services/scholarship.service.ts (passes query to repository)
 * ├─ src/services/job.service.ts (passes query to repository)
 * ├─ src/services/exam.service.ts (passes query to repository)
 * ├─ src/controllers/scheme.controller.ts (uses parseListQuery)
 * ├─ src/controllers/scholarship.controller.ts (uses parseListQuery)
 * ├─ src/controllers/job.controller.ts (uses parseListQuery)
 * ├─ src/controllers/exam.controller.ts (uses parseListQuery)
 * ├─ src/repositories/search.repository.ts (updated for new signatures)
 * ├─ src/repositories/recommendation.repository.ts (updated for new signatures)
 * ├─ src/services/search.service.ts (updated return type)
 * └─ src/utils/pagination.ts (updated PaginationMeta structure)
 */

// ============================================================================
// QUERY PARAMETER FLOW
// ============================================================================

/**
 * Request Flow:
 * 
 * 1. HTTP GET /api/schemes?page=2&limit=20&search=farmer&state=Bihar&sortBy=deadline&sortOrder=asc
 * 
 * 2. CONTROLLER (scheme.controller.ts - getAllSchemes)
 *    - Receives req: Request
 *    - Calls parseListQuery(req)
 *    - Gets validated: ListQueryInput { page: 2, limit: 20, search: 'farmer', state: 'Bihar', sortBy: 'deadline', sortOrder: 'asc' }
 *    - Calls fetchAllSchemes(query)
 *    - Receives ListResult<SchemeItem>
 *    - Returns successResponse with items and pagination
 * 
 * 3. SERVICE (scheme.service.ts - fetchAllSchemes)
 *    - Receives query: ListQueryInput
 *    - Calls getAllSchemes(query)
 *    - Returns ListResult<SchemeItem>
 * 
 * 4. REPOSITORY (scheme.repository.ts - getAllSchemes)
 *    - Receives query: ListQueryInput
 *    - Validates ID with AppError if needed
 *    - Builds Supabase query:
 *      - select(*) with count: exact
 *      - Apply search filter (ilike on title, description, search_text)
 *      - Apply state filter (eq)
 *      - Apply sorting (order by deadline asc)
 *      - Apply pagination (range)
 *    - Executes query: await sqlQuery
 *    - Handles errors with AppError
 *    - Calculates pagination metadata
 *    - Returns ListResult<SchemeItem>
 * 
 * 5. HTTP Response 200
 *    {
 *      "success": true,
 *      "message": "Schemes fetched successfully",
 *      "data": [...],
 *      "pagination": {
 *        "page": 2,
 *        "limit": 20,
 *        "total": 150,
 *        "totalPages": 8,
 *        "hasNextPage": true,
 *        "hasPreviousPage": true
 *      }
 *    }
 */

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

/**
 * Zod Validation Schema (listQuerySchema):
 * 
 * {
 *   page: z.coerce.number().int().positive().default(1),
 *   limit: z.coerce.number().int().min(1).max(100).default(10),
 *   sortBy: z.enum(["created_at", "updated_at", "deadline", "title"]).optional(),
 *   sortOrder: z.enum(["asc", "desc"]).default("desc"),
 *   state: z.string().trim().optional(),
 *   category: z.string().trim().optional(),
 *   status: z.string().trim().optional(),
 *   search: z.string().trim().max(100).optional()
 * }
 * 
 * Validation Rules:
 * - page: positive integer, >= 1, defaults to 1
 * - limit: integer between 1 and 100, defaults to 10
 * - sortBy: must be one of the whitelisted columns
 * - sortOrder: must be 'asc' or 'desc', defaults to 'desc'
 * - state, category, status, search: strings, trimmed, optional
 * - search: max 100 characters (prevents DoS)
 * 
 * Error Response (invalid query):
 * {
 *   "success": false,
 *   "message": "Invalid query parameters: page: Number must be greater than 0"
 * }
 */

// ============================================================================
// REPOSITORY QUERY BUILDING LOGIC
// ============================================================================

/**
 * Dynamic Supabase Query Building:
 * 
 * 1. Initialize query with select(*) and count: exact
 *    let sqlQuery = supabase.from("schemes").select("*", { count: "exact" })
 * 
 * 2. Apply search filter (if provided)
 *    if (search && search.trim()) {
 *      const searchPattern = `%${search.trim()}%`;
 *      sqlQuery = sqlQuery.or(
 *        `title.ilike.${searchPattern},description.ilike.${searchPattern},search_text.ilike.${searchPattern}`
 *      );
 *    }
 *    - Uses ILIKE for case-insensitive search
 *    - Searches across multiple columns: title, description, search_text
 *    - Prevents SQL injection by using Supabase built-in operators
 * 
 * 3. Apply filters (if provided)
 *    if (state && state.trim()) {
 *      sqlQuery = sqlQuery.eq("state", state.trim());
 *    }
 *    - Similar for category and status
 *    - Exact match (case-sensitive)
 *    - Whitelist columns: state, category, status only
 * 
 * 4. Apply sorting
 *    const isAscending = sortOrder === "asc";
 *    sqlQuery = sqlQuery.order(sortBy as AllowedSortColumns, { ascending: isAscending });
 *    - Whitelist columns: created_at, updated_at, deadline, title
 *    - Prevents arbitrary column access
 * 
 * 5. Apply pagination (must be last)
 *    sqlQuery = sqlQuery.range(offset, offset + limit - 1);
 *    where offset = (page - 1) * limit
 *    - Supabase range is inclusive on both ends
 *    - Example: page=2, limit=10 -> range(10, 19) returns items 10-19
 * 
 * 6. Execute and handle results
 *    const { data, error, count } = await sqlQuery;
 *    if (error) throw new AppError(..., 403/500)
 *    const total = count ?? 0
 *    const pagination = calculatePaginationMeta(page, limit, total)
 *    return { items: data, pagination }
 */

// ============================================================================
// PAGINATION METADATA CALCULATION
// ============================================================================

/**
 * Helper Function: calculatePaginationMeta(page, limit, total)
 * 
 * Calculates:
 * - totalPages = Math.ceil(total / limit)
 * - hasNextPage = page < totalPages
 * - hasPreviousPage = page > 1
 * 
 * Example:
 * total=150, limit=10
 * 
 * Page 1: { page: 1, limit: 10, total: 150, totalPages: 15, hasNextPage: true, hasPreviousPage: false }
 * Page 8: { page: 8, limit: 10, total: 150, totalPages: 15, hasNextPage: true, hasPreviousPage: true }
 * Page 15: { page: 15, limit: 10, total: 150, totalPages: 15, hasNextPage: false, hasPreviousPage: true }
 * 
 * If no results:
 * total=0: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
 */

// ============================================================================
// ERROR HANDLING STRATEGY
// ============================================================================

/**
 * Error Hierarchy:
 * 
 * 1. VALIDATION ERRORS (400)
 *    - parseListQuery throws AppError(400) if Zod validation fails
 *    - Message includes specific field validation issues
 *    - Example: "Invalid query parameters: page: Number must be greater than 0"
 * 
 * 2. BUSINESS LOGIC ERRORS (400)
 *    - ID validation errors in getById
 *    - Invalid filter combinations (handled gracefully with empty results)
 * 
 * 3. PERMISSION ERRORS (403)
 *    - Database permission denied (RLS or service role issues)
 *    - Detected by error.code === "42501"
 * 
 * 4. DATABASE ERRORS (500)
 *    - Query execution failures
 *    - Connection issues
 *    - Unexpected Supabase errors
 * 
 * Error Response Format:
 * {
 *   "success": false,
 *   "message": "User-friendly error message (never raw DB error)"
 * }
 * 
 * All errors caught in asyncHandler and converted to consistent format
 */

// ============================================================================
// SECURITY FEATURES
// ============================================================================

/**
 * 1. PARAMETER SANITIZATION
 *    - All string parameters trimmed: state.trim(), search.trim()
 *    - Search length limited to 100 characters
 *    - Page/limit validated with positive integers
 * 
 * 2. INJECTION PREVENTION
 *    - Uses Supabase PostgREST operators (ilike, eq, order)
 *    - No string concatenation for SQL
 *    - Whitelist allowed sort/filter columns
 * 
 * 3. WHITELISTING
 *    - sortBy: only "created_at", "updated_at", "deadline", "title"
 *    - sortOrder: only "asc", "desc"
 *    - filterColumns: only "state", "category", "status"
 *    - searchColumns: only "title", "description", "search_text"
 * 
 * 4. DoS PREVENTION
 *    - limit max 100 (prevents large data transfer)
 *    - search max 100 chars (prevents query explosion)
 *    - Zod validation prevents type coercion attacks
 * 
 * 5. ROLE-BASED SECURITY
 *    - Backend uses service_role (admin access) via SUPABASE_SERVICE_ROLE_KEY
 *    - Service role bypasses RLS for controlled server operations
 *    - Frontend would use anon key with RLS if implemented
 *    - Never expose service role key to frontend
 */

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

/**
 * 1. EXACT COUNT USAGE
 *    - Uses count: "exact" only when needed
 *    - Count is calculated efficiently by Supabase
 * 
 * 2. PAGINATION EFFICIENCY
 *    - Range queries are database-side (not in-memory)
 *    - No fetching unnecessary rows
 *    - Example: page=100, limit=10 only fetches rows 990-999
 * 
 * 3. COLUMN PROJECTION
 *    - Selects * (could be optimized to specific columns if schema known)
 *    - Supabase efficiently handles PostgREST select
 * 
 * 4. SEARCH OPTIMIZATION
 *    - ILIKE searches use Postgres full-text search capabilities
 *    - Searches only happen in specified columns
 *    - search_text column can be pre-computed denormalized text
 * 
 * 5. QUERY COMBINATION
 *    - All filters applied in single query (no N+1 queries)
 *    - Uses Supabase query builder for efficiency
 *    - Single database round-trip per request
 * 
 * 6. CACHING OPPORTUNITY
 *    - Could implement Redis caching at controller level
 *    - Cache key: `${endpoint}:${JSON.stringify(query)}`
 *    - Invalidate on data changes
 */

// ============================================================================
// TESTING & CURL EXAMPLES
// ============================================================================

/**
 * See API_TESTING_GUIDE.md for comprehensive test examples
 * 
 * Quick Examples:
 * 
 * // Basic pagination
 * curl http://localhost:5001/api/schemes?page=1&limit=10
 * 
 * // Search
 * curl http://localhost:5001/api/schemes?search=farmer
 * 
 * // Filter by state
 * curl http://localhost:5001/api/schemes?state=Bihar
 * 
 * // Combined filters
 * curl "http://localhost:5001/api/schemes?search=loan&state=Bihar&category=Farmer&sortBy=deadline&sortOrder=asc&page=1&limit=20"
 */

// ============================================================================
// RESPONSE EXAMPLES
// ============================================================================

/**
 * Success Response:
 * {
 *   "success": true,
 *   "message": "Schemes fetched successfully",
 *   "data": [
 *     {
 *       "id": "scheme-001",
 *       "title": "PM Kisan Samman Nidhi",
 *       "description": "Direct income support to farmers",
 *       "category": "Farmer",
 *       "provider": "Government of India",
 *       "benefit": "₹6000 per year",
 *       "eligibility": "All farmers",
 *       "deadline": "2025-12-31",
 *       "status": "active",
 *       "state": "Bihar"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 150,
 *     "totalPages": 15,
 *     "hasNextPage": true,
 *     "hasPreviousPage": false
 *   }
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "message": "Invalid query parameters: page: Number must be greater than 0"
 * }
 * 
 * Not Found (single item):
 * {
 *   "success": false,
 *   "message": "Scheme not found"
 * }
 */

// ============================================================================
// FUTURE ENHANCEMENTS
// ============================================================================

/**
 * Potential improvements for future iterations:
 * 
 * 1. ADVANCED SEARCH
 *    - Implement Postgres full-text search
 *    - Support search operators: AND, OR, NOT
 *    - Relevance ranking
 * 
 * 2. CACHING
 *    - Redis caching for popular queries
 *    - Cache invalidation on data updates
 *    - Cache warming for hot queries
 * 
 * 3. ANALYTICS
 *    - Track popular search terms
 *    - Monitor slow queries
 *    - Usage metrics per endpoint
 * 
 * 4. ADVANCED FILTERING
 *    - Date range filters (deadline between)
 *    - Numeric range filters (benefit amount)
 *    - Multi-select filters (state in [Bihar, UP, ...])
 * 
 * 5. PERFORMANCE MONITORING
 *    - Query execution time logging
 *    - Database slow query alerts
 *    - API latency monitoring
 * 
 * 6. EXPORT FUNCTIONALITY
 *    - Export results as CSV/JSON
 *    - Bulk operations
 *    - Scheduled reports
 */

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/**
 * Before production deployment:
 * 
 * ✓ TypeScript build passes: npm run build
 * ✓ All endpoints tested with comprehensive curl commands
 * ✓ Pagination metadata accurate in all scenarios
 * ✓ Filters work independently and combined
 * ✓ Search works across all specified columns
 * ✓ Sorting works for all allowed columns
 * ✓ Error messages are user-friendly (never expose raw DB errors)
 * ✓ RLS configuration correct on Supabase (or disabled for service role)
 * ✓ Service role key secure (environment variable only, never exposed)
 * ✓ Rate limiting configured if needed
 * ✓ Database indexes created on filter columns (state, category, status)
 * ✓ Database indexes created on sort columns (created_at, updated_at, deadline)
 * ✓ Database indexes created on search columns (title, description, search_text)
 * ✓ Monitoring and logging configured
 * ✓ Load testing performed
 */

export {};