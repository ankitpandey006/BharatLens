
import cron from "node-cron";
import { env } from "../config/env";
import { collectorConfig } from "../config/collector.config";
import { runAllCollectors } from "../services/collector.service";

export function initDailyCollectorJob(): void {
  if (!env.ENABLE_COLLECTOR_CRON) {
    return;
  }

  cron.schedule(collectorConfig.cronExpression, async () => {
    try {
      const result = await runAllCollectors();
      console.info("Daily collector job completed", {
        rssSources: Object.keys(result.rss).length,
        scraperSources: Object.keys(result.scraping).length,
        totalFetched: result.totalFetched,
        totalInserted: result.totalInserted,
        totalDuplicates: result.totalDuplicates,
        totalFailed: result.totalFailed,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Daily collector job failed", message);
    }
  });
}
