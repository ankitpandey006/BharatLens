/**
 * Migration Runner Script
 *
 * Runs SQL migration files against the Supabase database using the service role key.
 *
 * Usage:
 *   npx ts-node scripts/run-migration.ts migrations/006_fix_admin_verification_system.sql
 *
 * This script:
 *   - Reads the SQL file
 *   - Splits it into individual statements
 *   - Executes each statement via the Supabase REST API
 *   - Reports success/failure for each statement
 *
 * Environment variables (from .env):
 *   SUPABASE_URL - https://<project>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY - secret service role key
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";
import dotenv from "dotenv";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Validate migration file path
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("❌ Usage: npx ts-node scripts/run-migration.ts <migration-file>");
  console.error("   Example: npx ts-node scripts/run-migration.ts migrations/006_fix_admin_verification_system.sql");
  process.exit(1);
}

const migrationPath = path.resolve(__dirname, "..", migrationFile);
if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Split SQL into individual statements, handling multi-line statements */
function splitStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"))
    .map((s) => s + ";");
}

function extractLabel(statement: string): string {
  const firstLine = statement.split("\n").find((l) => l.trim().length > 0) ?? statement;
  // Extract the operation type for readable logging
  const opMatch = firstLine.match(/\b(CREATE|ALTER|UPDATE|INSERT|DROP|COMMENT)\s+(\w+)/i);
  if (opMatch) {
    return `${opMatch[1].toUpperCase()} ${opMatch[2].toLowerCase()}`;
  }
  return firstLine.slice(0, 60);
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Migration Runner");
  console.log(`   File: ${migrationPath}`);
  console.log(`   Database: ${SUPABASE_URL}\n`);

  const sql = fs.readFileSync(migrationPath, "utf-8");
  const statements = splitStatements(sql);

  console.log(`📦 Found ${statements.length} SQL statements to execute\n`);

  // Create a Supabase admin client for executing SQL
  // We use the REST API directly with the service role key for SQL execution
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  let successCount = 0;
  let failCount = 0;
  const errors: Array<{ index: number; statement: string; error: string }> = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const label = extractLabel(stmt);

    process.stdout.write(`[${i + 1}/${statements.length}] ${label}... `);

    try {
      // Execute SQL via Supabase REST API
      // We use the pg_query endpoint which executes SQL via the auth schema
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: stmt }),
      });

      if (!response.ok) {
        // Some ALTER TABLE / CREATE TABLE statements may return errors for
        // columns that already exist (IF NOT EXISTS still returns success on
        // most databases, but Supabase's REST gateway may return errors).
        // We treat these as warnings rather than failures.
        const text = await response.text();

        // Check if it's a "already exists" or "duplicate" error (safe to ignore)
        const isSafeError =
          text.includes("already exists") ||
          text.includes("duplicate column") ||
          text.includes("already has a default") ||
          text.includes("IF NOT EXISTS") ||
          text.includes("already been applied");

        if (isSafeError) {
          console.log("⚠️ (already applied - safe to ignore)");
          successCount++;
        } else {
          console.log(`❌ (HTTP ${response.status})`);
          errors.push({ index: i, statement: stmt.slice(0, 200), error: text.slice(0, 300) });
          failCount++;
        }
      } else {
        console.log("✅");
        successCount++;
      }
    } catch (err) {
      console.log("❌ (exception)");
      errors.push({
        index: i,
        statement: stmt.slice(0, 200),
        error: err instanceof Error ? err.message : String(err),
      });
      failCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 Results: ${successCount} succeeded, ${failCount} failed, ${statements.length} total`);

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    for (const err of errors) {
      console.log(`   [${err.index + 1}] ${err.error}`);
    }
    process.exit(1);
  }

  console.log("\n✅ Migration completed successfully!");
  console.log("\n💡 Tip: Restart your backend server to pick up schema changes via Supabase schema cache.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
