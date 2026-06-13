/**
 * Daily Collector Job
 *
 * Runs the full data pipeline every 24 hours:
 * collect → clean → verify → dedup → classify → log
 *
 * Only runs if ENABLE_COLLECTOR_CRON is true.
 * Provides detailed per-run logging with source-wise breakdowns.
 */

import cron from "node-cron";
import { env } from "../config/env";
import { collectorConfig } from "../config/collector.config";
import { runFullPipeline } from "../services/pipeline.service";
import { supabase } from "../config/supabase";

/**
 * Log pipeline run details to the pipeline_logs table.
 * Creates a record with all key metrics for auditing.
 */
async function logPipelineRun(result: {
  totalFetched: number;
  cleaned: number;
  fakeRemoved: number;
  duplicateRemoved: number;
  suspicious: number;
  pendingVerification: number;
  failed: number;
  sourceWise: Record<string, unknown>;
  durationMs: number;
}): Promise<void> {
  try {
    const { error } = await supabase.from("ai_processing_logs").insert({
      processing_type: "pipeline",
      status: "success",
      reason: `Pipeline completed: ${result.totalFetched} fetched, ${result.cleaned} cleaned, ${result.fakeRemoved} fake, ${result.duplicateRemoved} duplicate, ${result.suspicious} suspicious, ${result.pendingVerification} pending`,
      confidence_score: result.totalFetched > 0
        ? Math.round((result.pendingVerification / result.totalFetched) * 100)
        : 0,
      source_name: "pipeline",
      items_processed: result.cleaned,
      items_failed: result.failed,
      items_duplicate: result.duplicateRemoved,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[daily-collector] Failed to log pipeline run:", error.message);
    }
  } catch (err) {
    console.error("[daily-collector] Failed to log pipeline run:", err);
  }
}

export function initDailyCollectorJob(): void {
  if (!env.ENABLE_COLLECTOR_CRON) {
    console.log("[daily-collector] Cron job disabled (ENABLE_COLLECTOR_CRON is false)");
    return;
  }

  const cronExpression = collectorConfig.cronExpression;
  console.log(`[daily-collector] Initializing daily collector job: "${cronExpression}"`);

  cron.schedule(cronExpression, async () => {
    console.log("[daily-collector] ====== Starting daily pipeline run ======");

    try {
      const result = await runFullPipeline();

      // Log to database
      await logPipelineRun(result);

      // Detailed console report
      console.log("[daily-collector] ====== Daily pipeline completed ======");
      console.log("[daily-collector] Summary:");
      console.log(`  Total fetched:       ${result.totalFetched}`);
      console.log(`  Cleaned:             ${result.cleaned}`);
      console.log(`  Fake removed:        ${result.fakeRemoved}`);
      console.log(`  Duplicate removed:   ${result.duplicateRemoved}`);
      console.log(`  Suspicious:          ${result.suspicious}`);
      console.log(`  Pending verification: ${result.pendingVerification}`);
      console.log(`  Failed:              ${result.failed}`);
      console.log(`  Duration:            ${result.durationMs}ms`);

      // Source-wise breakdown
      if (Object.keys(result.sourceWise).length > 0) {
        console.log("[daily-collector] Source-wise results:");
        for (const [source, data] of Object.entries(result.sourceWise)) {
          const d = data as { fetched?: number; inserted?: number; cleaned?: number; verified?: number; duplicates?: number; failed?: number };
          console.log(
            `  ${source}: fetched=${d.fetched ?? 0}, inserted=${d.inserted ?? 0}, ` +
            `cleaned=${d.cleaned ?? 0}, verified=${d.verified ?? 0}, ` +
            `duplicates=${d.duplicates ?? 0}, failed=${d.failed ?? 0}`,
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[daily-collector] Daily pipeline run failed:", message);

      // Log failure
      try {
        await supabase.from("ai_processing_logs").insert({
          processing_type: "pipeline",
          status: "failed",
          reason: `Pipeline failed: ${message}`,
          confidence_score: 0,
          source_name: "pipeline",
          items_processed: 0,
          items_failed: 1,
          items_duplicate: 0,
        });
      } catch (logErr) {
        console.error("[daily-collector] Failed to log pipeline failure:", logErr);
      }
    }
  });

  console.log(`[daily-collector] Daily collector job initialized (cron: "${cronExpression}")`);
}
