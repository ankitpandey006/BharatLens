
import { Router } from "express";
import {
  getCollectorStatus,
  getCollectorStatsHandler,
  getCollectedDataHandler,
  processCollectorDataHandler,
  cleanTextHandler,
  classifyTextHandler,
  runAllCollectorsHandler,
  runAllRssCollectorsHandler,
  runEmploymentRssCollector,
  runGenericRssCollectorHandler,
  runPdfExtractorHandler,
  runPibRssCollector,
  runWebsiteScraperHandler,
} from "../controllers/collector.controller";

const router = Router();

router.get("/status", getCollectorStatus);
router.get("/stats", getCollectorStatsHandler);
router.get("/collected-data", getCollectedDataHandler);
router.post("/process", processCollectorDataHandler);
router.post("/clean", cleanTextHandler);
router.post("/classify", classifyTextHandler);
router.post("/run-all", runAllCollectorsHandler);
router.post("/rss", runAllRssCollectorsHandler);
router.post("/rss/pib", runPibRssCollector);
router.post("/rss/employment", runEmploymentRssCollector);
router.post("/rss/:sourceName", runGenericRssCollectorHandler);
router.post("/scrape/:sourceName", runWebsiteScraperHandler);
router.post("/pdf", runPdfExtractorHandler);

export default router;
