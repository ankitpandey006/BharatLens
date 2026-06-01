/**
 * BharatLens Backend - Listing APIs Quick Reference Guide
 * For Backend Developers & API Consumers
 */

// ============================================================================
// QUICK START
// ============================================================================

/**
 * All listing APIs support: Pagination | Filtering | Searching | Sorting
 * 
 * Endpoints:
 * - GET /api/schemes
 * - GET /api/scholarships
 * - GET /api/jobs
 * - GET /api/exams
 * 
 * Single Item:
 * - GET /api/schemes/:id
 * - GET /api/scholarships/:id
 * - GET /api/jobs/:id
 * - GET /api/exams/:id
 */

// ============================================================================
// COMMON QUERY PARAMETERS
// ============================================================================

/**
 * Pagination:
 *   ?page=1&limit=10
 *   - page: integer, min 1, default 1
 *   - limit: integer, 1-100, default 10
 * 
 * Searching:
 *   ?search=farmer
 *   - Search across: title, description, search_text
 *   - Case-insensitive ILIKE matching
 *   - Max 100 characters
 * 
 * Filtering:
 *   ?state=Bihar&category=Farmer&status=active
 *   - state: exact match, string
 *   - category: exact match, string
 *   - status: exact match, string
 * 
 * Sorting:
 *   ?sortBy=deadline&sortOrder=asc
 *   - sortBy: "created_at" | "updated_at" | "deadline" | "title"
 *   - sortOrder: "asc" | "desc", default "desc"
 */

// ============================================================================
// QUICK EXAMPLES
// ============================================================================

/**
 * 1. List all schemes (first 10)
 *    GET /api/schemes
 * 
 * 2. Search schemes
 *    GET /api/schemes?search=farmer
 * 
 * 3. Filter by state
 *    GET /api/schemes?state=Bihar&limit=20
 * 
 * 4. Sorted search with filters
 *    GET /api/schemes?search=loan&state=Maharashtra&sortBy=deadline&sortOrder=asc
 * 
 * 5. Pagination
 *    GET /api/schemes?page=3&limit=25
 * 
 * 6. Combined
 *    GET /api/schemes?search=farmer&state=Bihar&category=Student&sortBy=created_at&sortOrder=desc&page=1&limit=20
 */

// ============================================================================
// RESPONSE FORMAT
// ============================================================================

/**
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Schemes fetched successfully",
 *   "data": [ /* items array */ ],
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
 * Error Response (400/500):
 * {
 *   "success": false,
 *   "message": "User-friendly error message"
 * }
 * 
 * Not Found (404):
 * {
 *   "success": false,
 *   "message": "Scheme not found"
 * }
 */

// ============================================================================
// PAGINATION METADATA
// ============================================================================

/**
 * Understand pagination metadata:
 * 
 * page: Current page number (1-indexed)
 * limit: Items per page (1-100)
 * total: Total matching items across all pages
 * totalPages: Number of pages available
 * hasNextPage: Is there a next page?
 * hasPreviousPage: Is there a previous page?
 * 
 * Frontend can use hasNextPage/hasPreviousPage to:
 * - Disable "next" button on last page
 * - Disable "previous" button on first page
 * - Build pagination UI
 * 
 * Example: 1000 items, page 5, limit 100
 * {
 *   "page": 5,
 *   "limit": 100,
 *   "total": 1000,
 *   "totalPages": 10,
 *   "hasNextPage": true,        // Can fetch page 6
 *   "hasPreviousPage": true     // Can fetch page 4
 * }
 */

// ============================================================================
// PARAMETER VALIDATION
// ============================================================================

/**
 * What happens with invalid parameters?
 * 
 * Invalid page/limit:
 * ?page=0 → defaults to page 1
 * ?limit=-10 → rejected with 400 error
 * ?limit=200 → clamped to max 100
 * 
 * Invalid sortBy:
 * ?sortBy=invalid_column → rejected with 400 error
 * 
 * Invalid sortOrder:
 * ?sortOrder=invalid → rejected with 400 error
 * 
 * No matching results:
 * ?state=NonExistent → returns empty data array with pagination: { total: 0 }
 * 
 * Database error:
 * → 403 if permission denied
 * → 500 if database error
 */

// ============================================================================
// DEVELOPER WORKFLOW
// ============================================================================

/**
 * Adding a new filter (example: adding "region" filter):
 * 
 * 1. Add to query.validator.ts filterSchema
 *    region: z.string().trim().optional()
 * 
 * 2. Add to query.types.ts FilterParams
 *    region?: string
 * 
 * 3. Update repository query logic
 *    if (region && region.trim()) {
 *      sqlQuery = sqlQuery.eq("region", region.trim());
 *    }
 * 
 * 4. Rebuild and test
 *    npm run build
 *    curl "http://localhost:5001/api/schemes?region=North"
 */

/**
 * Adding a new sort column (example: adding "title" ascending):
 * 
 * 1. Already supported! sortBy="title"&sortOrder="asc"
 * 2. Column must be in AllowedSortColumns type
 * 3. Database must have index for performance
 */

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Manual Testing:
 * 
 * ✓ curl http://localhost:5001/api/schemes
 * ✓ curl http://localhost:5001/api/schemes?page=1&limit=10
 * ✓ curl http://localhost:5001/api/schemes?search=farmer
 * ✓ curl http://localhost:5001/api/schemes?state=Bihar
 * ✓ curl http://localhost:5001/api/schemes?sortBy=deadline&sortOrder=asc
 * ✓ curl http://localhost:5001/api/schemes?page=2
 * ✓ curl "http://localhost:5001/api/schemes?search=loan&state=Bihar&limit=20"
 * ✓ Verify pagination metadata is correct
 * ✓ Verify no raw SQL errors in response
 * ✓ Verify items array matches limit
 * 
 * Edge Cases:
 * ✓ curl http://localhost:5001/api/schemes?page=999 (out of range)
 * ✓ curl http://localhost:5001/api/schemes?limit=0 (invalid)
 * ✓ curl http://localhost:5001/api/schemes?state=NonExistent (empty results)
 * ✓ curl http://localhost:5001/api/schemes?search= (empty search)
 */

// ============================================================================
// COMMON ISSUES & SOLUTIONS
// ============================================================================

/**
 * Issue: "permission denied for table schemes"
 * Solution: Check Supabase RLS settings, or ensure service_role key is used
 * 
 * Issue: Total items seems wrong
 * Solution: Check if filters are applied correctly
 * 
 * Issue: Search returns no results
 * Solution: Check search_text column has data, search is case-insensitive
 * 
 * Issue: Pagination metadata doesn't match
 * Solution: Verify offset calculation: (page-1) * limit
 * 
 * Issue: Sorting not working
 * Solution: Check column name is in AllowedSortColumns, has database index
 */

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

/**
 * When using APIs programmatically:
 * 
 * import type { ListQueryInput } from "./validators/query.validator";
 * import type { ListResult, SchemeItem } from "./repositories/scheme.repository";
 * 
 * const query: ListQueryInput = {
 *   page: 1,
 *   limit: 10,
 *   search: "farmer",
 *   state: "Bihar",
 *   sortBy: "created_at",
 *   sortOrder: "desc"
 * };
 * 
 * const result: ListResult<SchemeItem> = await getAllSchemes(query);
 * console.log(result.items);         // SchemeItem[]
 * console.log(result.pagination);    // PaginationMeta
 */

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

/**
 * Frontend Optimization:
 * - Cache results for same query
 * - Use hasNextPage to avoid unnecessary requests
 * - Implement infinite scroll with pagination
 * - Debounce search input
 * 
 * Backend Optimization:
 * - Database indexes on: state, category, status, created_at, deadline, title
 * - Denormalize search_text column for faster searches
 * - Consider Redis caching for popular queries
 * - Monitor slow queries
 */

// ============================================================================
// IMPORTANT NOTES
// ============================================================================

/**
 * SECURITY:
 * - Service role key (backend only, never expose to frontend)
 * - All parameters validated and sanitized
 * - Whitelist filters and sort columns
 * - No arbitrary column access allowed
 * - Max search length 100 chars (DoS prevention)
 * 
 * COMPATIBILITY:
 * - Frontend must not be modified
 * - Backend only changes
 * - Focus on production-ready architecture
 * - All APIs type-safe with TypeScript
 * 
 * DEPLOYMENT:
 * - npm run build must pass
 * - Test all endpoints before deployment
 * - Verify Supabase permissions
 * - Monitor database performance
 */

export {};