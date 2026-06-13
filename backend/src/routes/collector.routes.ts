
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdminOrModerator } from "../middlewares/role.middleware";
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

// All collector routes require admin/moderator auth
router.use(requireAuth, requireAdminOrModerator);

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
