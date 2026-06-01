/**
 * BharatLens Listing APIs - Test Examples
 * Comprehensive curl commands for testing pagination, filtering, searching, and sorting
 * 
 * Base URL: http://localhost:5001/api
 * 
 * Tables: schemes, scholarships, jobs, exams
 */

// ============================================================================
// 1. PAGINATION EXAMPLES
// ============================================================================

// Basic pagination - default page 1, limit 10
curl -s http://localhost:5001/api/schemes | jq .

// Pagination - page 1, limit 20
curl -s "http://localhost:5001/api/schemes?page=1&limit=20" | jq .

// Pagination - page 2, limit 10
curl -s "http://localhost:5001/api/schemes?page=2&limit=10" | jq .

// Pagination - page 3, limit 50
curl -s "http://localhost:5001/api/schemes?page=3&limit=50" | jq .

// Max limit boundary test (should clamp to 100)
curl -s "http://localhost:5001/api/schemes?page=1&limit=100" | jq .

// Invalid limit (should default to 10)
curl -s "http://localhost:5001/api/schemes?page=1&limit=0" | jq .

// ============================================================================
// 2. SEARCH EXAMPLES
// ============================================================================

// Search by keyword "farmer"
curl -s "http://localhost:5001/api/schemes?search=farmer" | jq .

// Search "scholarship" with pagination
curl -s "http://localhost:5001/api/schemes?search=scholarship&page=1&limit=20" | jq .

// Search "agriculture"
curl -s "http://localhost:5001/api/jobs?search=agriculture" | jq .

// Search with special characters (should be sanitized)
curl -s "http://localhost:5001/api/scholarships?search=tech%20skill" | jq .

// Empty search (returns all items)
curl -s "http://localhost:5001/api/schemes?search=" | jq .

// ============================================================================
// 3. STATE FILTERING EXAMPLES
// ============================================================================

// Filter by state "Bihar"
curl -s "http://localhost:5001/api/schemes?state=Bihar" | jq .

// Filter by state "Uttar Pradesh"
curl -s "http://localhost:5001/api/schemes?state=Uttar%20Pradesh" | jq .

// Filter by state "Maharashtra"
curl -s "http://localhost:5001/api/jobs?state=Maharashtra" | jq .

// Filter with pagination
curl -s "http://localhost:5001/api/scholarships?state=West%20Bengal&page=1&limit=15" | jq .

// ============================================================================
// 4. CATEGORY FILTERING EXAMPLES
// ============================================================================

// Filter by category "Farmer"
curl -s "http://localhost:5001/api/schemes?category=Farmer" | jq .

// Filter by category "Student"
curl -s "http://localhost:5001/api/schemes?category=Student" | jq .

// Filter by category "General"
curl -s "http://localhost:5001/api/scholarships?category=General" | jq .

// Filter by category with pagination
curl -s "http://localhost:5001/api/jobs?category=Government&page=1&limit=10" | jq .

// ============================================================================
// 5. STATUS FILTERING EXAMPLES
// ============================================================================

// Filter by status "active"
curl -s "http://localhost:5001/api/schemes?status=active" | jq .

// Filter by status "closed"
curl -s "http://localhost:5001/api/scholarships?status=closed" | jq .

// Filter by status "open"
curl -s "http://localhost:5001/api/exams?status=open" | jq .

// ============================================================================
// 6. SORTING EXAMPLES
// ============================================================================

// Sort by created_at descending (default)
curl -s "http://localhost:5001/api/schemes?sortBy=created_at&sortOrder=desc" | jq .

// Sort by created_at ascending
curl -s "http://localhost:5001/api/schemes?sortBy=created_at&sortOrder=asc" | jq .

// Sort by deadline descending
curl -s "http://localhost:5001/api/scholarships?sortBy=deadline&sortOrder=desc" | jq .

// Sort by deadline ascending
curl -s "http://localhost:5001/api/scholarships?sortBy=deadline&sortOrder=asc" | jq .

// Sort by title ascending
curl -s "http://localhost:5001/api/jobs?sortBy=title&sortOrder=asc" | jq .

// Sort by updated_at descending
curl -s "http://localhost:5001/api/exams?sortBy=updated_at&sortOrder=desc" | jq .

// ============================================================================
// 7. COMBINED FILTER EXAMPLES
// ============================================================================

// Search + State filter + Pagination
curl -s "http://localhost:5001/api/schemes?search=loan&state=Bihar&page=1&limit=10" | jq .

// State + Category + Pagination
curl -s "http://localhost:5001/api/schemes?state=Maharashtra&category=Student&page=1&limit=20" | jq .

// Search + Category + Sorting
curl -s "http://localhost:5001/api/scholarships?search=merit&category=General&sortBy=deadline&sortOrder=desc" | jq .

// All filters combined
curl -s "http://localhost:5001/api/jobs?search=engineer&state=Bangalore&category=Government&status=active&sortBy=created_at&sortOrder=desc&page=1&limit=15" | jq .

// Search + Status + Sorting + Pagination
curl -s "http://localhost:5001/api/exams?search=SSC&status=active&sortBy=deadline&sortOrder=asc&page=1&limit=20" | jq .

// ============================================================================
// 8. EDGE CASES & ERROR HANDLING
// ============================================================================

// Invalid page (< 1, should default to 1)
curl -s "http://localhost:5001/api/schemes?page=0" | jq .

// Negative limit (should reject)
curl -s "http://localhost:5001/api/schemes?limit=-10" | jq .

// Invalid sortBy (should reject or ignore)
curl -s "http://localhost:5001/api/schemes?sortBy=invalid_column" | jq .

// Invalid sortOrder (should reject or default)
curl -s "http://localhost:5001/api/schemes?sortOrder=invalid" | jq .

// Non-existent state (returns empty results)
curl -s "http://localhost:5001/api/schemes?state=NonExistentState" | jq .

// Very long search query (should be sanitized)
curl -s "http://localhost:5001/api/schemes?search=verylongsearchtermthatmightnotexistinanyoftherecords" | jq .

// Multiple filters with no matching results
curl -s "http://localhost:5001/api/schemes?state=Bihar&category=NonExistent&status=invalid" | jq .

// ============================================================================
// 9. SPECIFIC ENDPOINT TESTS
// ============================================================================

// Test all schemes listing
curl -s http://localhost:5001/api/schemes | jq .pagination

// Test all scholarships listing
curl -s http://localhost:5001/api/scholarships | jq .pagination

// Test all jobs listing
curl -s http://localhost:5001/api/jobs | jq .pagination

// Test all exams listing
curl -s http://localhost:5001/api/exams | jq .pagination

// Get single scheme by ID
curl -s http://localhost:5001/api/schemes/scheme-id-123 | jq .

// Get single scholarship by ID
curl -s http://localhost:5001/api/scholarships/scholarship-id-123 | jq .

// ============================================================================
// 10. RESPONSE STRUCTURE VALIDATION
// ============================================================================

// Verify pagination metadata is present and correct
curl -s "http://localhost:5001/api/schemes?page=1&limit=10" | jq '.pagination | {page, limit, total, totalPages, hasNextPage, hasPreviousPage}'

// Verify items array structure
curl -s "http://localhost:5001/api/schemes?page=1&limit=5" | jq '.data[0] | keys'

// Verify success response format
curl -s "http://localhost:5001/api/schemes?page=1" | jq '{success, message, pagination: (.pagination | type)}'

// ============================================================================
// EXPECTED RESPONSE FORMAT
// ============================================================================

/*
Success Response (HTTP 200):
{
  "success": true,
  "message": "Schemes fetched successfully",
  "data": [
    {
      "id": "scheme-001",
      "title": "PM Kisan Samman Nidhi",
      "description": "Direct income support to farmers",
      "category": "Farmer",
      "provider": "Government of India",
      "benefit": "₹6000 per year",
      "eligibility": "All farmers",
      "deadline": "2025-12-31",
      "status": "active",
      "state": "Bihar",
      "created_at": "2026-01-01T10:00:00Z"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}

Error Response (HTTP 400/500):
{
  "success": false,
  "message": "Invalid query parameters: page: Number must be greater than 0"
}

Permission Denied Response (HTTP 403):
{
  "success": false,
  "message": "permission denied for table schemes"
}
*/

// ============================================================================
// PAGINATION METADATA EXPLANATION
// ============================================================================

/*
page: Current page number (1-indexed)
limit: Items per page (1-100)
total: Total number of items matching the filters
totalPages: Math.ceil(total / limit) - total number of pages
hasNextPage: boolean - true if there are more pages
hasPreviousPage: boolean - true if there are previous pages

Example: total=150, limit=10
- totalPages = 15
- page=1: hasNextPage=true, hasPreviousPage=false
- page=8: hasNextPage=true, hasPreviousPage=true
- page=15: hasNextPage=false, hasPreviousPage=true
*/

// ============================================================================
// QUERY PARAMETER VALIDATION RULES
// ============================================================================

/*
page:
- Type: integer
- Min: 1
- Default: 1

limit:
- Type: integer
- Min: 1
- Max: 100
- Default: 10

search:
- Type: string
- Max length: 100 characters
- Trimmed and sanitized
- Case-insensitive search on: title, description, search_text

state:
- Type: string
- Trimmed
- Exact match (case-sensitive)

category:
- Type: string
- Trimmed
- Exact match (case-sensitive)

status:
- Type: string
- Trimmed
- Exact match (case-sensitive)

sortBy:
- Type: enum
- Allowed values: "created_at", "updated_at", "deadline", "title"
- Default: "created_at"

sortOrder:
- Type: enum
- Allowed values: "asc", "desc"
- Default: "desc"
*/

// ============================================================================
// ADVANCED TESTING SCRIPTS
// ============================================================================

// Test pagination boundaries
#!/bin/bash
echo "Testing pagination boundaries..."
for page in 1 2 3 10 100; do
  echo "Page $page:"
  curl -s "http://localhost:5001/api/schemes?page=$page&limit=10" | jq '.pagination'
done

// Test all sort columns
#!/bin/bash
echo "Testing all sort columns..."
for col in created_at updated_at deadline title; do
  echo "Sorting by $col (desc):"
  curl -s "http://localhost:5001/api/schemes?sortBy=$col&sortOrder=desc&limit=3" | jq '.data[] | {id, title, ['$col']}'
done

// Test search performance
#!/bin/bash
echo "Testing search..."
for term in farmer scholarship tech agriculture; do
  echo "Searching for '$term':"
  curl -s "http://localhost:5001/api/schemes?search=$term&limit=5" | jq '.pagination | {total, page, hasNextPage}'
done

// Test combined filters
#!/bin/bash
echo "Testing combined filters..."
curl -s "http://localhost:5001/api/schemes?state=Bihar&category=Farmer&status=active&sortBy=deadline&sortOrder=asc&page=1&limit=20" | jq '.'
